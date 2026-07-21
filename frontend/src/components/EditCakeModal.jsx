import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader, CheckCircle } from 'lucide-react';
import '../pages/Menu.css';

export default function EditCakeModal({ cake, categoriesList, onClose, onUpdated }) {
  const [name, setName] = useState(cake.name || '');
  const [price, setPrice] = useState(cake.price || '');
  const [description, setDescription] = useState(cake.description || '');
  const [category, setCategory] = useState(cake.category || '');
  const [newImageFile, setNewImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(cake.imageUrl || cake.url || '/logo.png');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(''); // 'success' | error message string
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setNewImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageChange(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('category', category);
      if (newImageFile) {
        formData.append('image', newImageFile);
      }

      const res = await fetch(`/api/files/edit/${cake._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed.');

      setStatus('success');
      // Notify parent with the fresh cake object so state updates instantly
      setTimeout(() => {
        onUpdated(data.data);
        onClose();
      }, 900);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="edit-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="edit-modal-card card"
          initial={{ opacity: 0, scale: 0.93, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 30 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="edit-modal__header">
            <h2 className="edit-modal__title">Edit Cake</h2>
            <button
              className="cart-drawer__close"
              onClick={onClose}
              disabled={saving}
              aria-label="Close edit modal"
              id="close-edit-modal"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="edit-modal__form">
            <div className="edit-modal__body">

              {/* Image Dropzone / Preview */}
              <div
                className={`edit-dropzone ${dragOver ? 'edit-dropzone--active' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageChange(e.target.files[0])}
                />
                <img
                  src={previewUrl}
                  alt="Cake preview"
                  className="edit-dropzone__preview"
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                />
                <span className="edit-dropzone__hint">
                  {newImageFile ? newImageFile.name : 'Click or drag to replace photo'}
                </span>
              </div>

              {/* Cake Name */}
              <div className="input-group">
                <label htmlFor="edit-name">Cake Name</label>
                <input
                  id="edit-name"
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Blueberry Cheesecake"
                />
              </div>

              {/* Price */}
              <div className="input-group">
                <label htmlFor="edit-price">Price (₹ per lb)</label>
                <input
                  id="edit-price"
                  className="input-field"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  placeholder="1299"
                />
              </div>

              {/* Category */}
              <div className="input-group">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  className="input-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="input-group">
                <label htmlFor="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  className="input-field"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                  placeholder="Describe this cake..."
                />
              </div>

              {/* Status messages */}
              {status && status !== 'success' && (
                <p className="upload-error">{status}</p>
              )}
              {status === 'success' && (
                <p className="upload-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={15} /> Cake updated successfully!
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="edit-modal__footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={saving}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-gold"
                disabled={saving}
                id="submit-edit"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                {saving
                  ? <><Loader size={15} className="spin-icon" /> Saving…</>
                  : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
