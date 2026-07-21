import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImagePlus, Loader, Search, Filter, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CakeCard from '../components/CakeCard';
import './Menu.css';

import { useCart } from '../context/CartContext';


export default function Menu() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { addItem } = useCart();

  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadPrice, setUploadPrice] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  // Dynamic Category State
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const filteredCakes = cakes.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      category === 'All' ||
      (category === 'Bestsellers' && c.badge === 'Bestseller') ||
      (category === 'Chocolate' && c.name.toLowerCase().includes('chocolate')) ||
      (category === 'Fruit' && (c.name.toLowerCase().includes('mango') || c.name.toLowerCase().includes('strawberry'))) ||
      (category === 'Premium' && c.badge === 'Premium') ||
      (category === 'Wedding' && c.name.toLowerCase().includes('wedding'));
    return matchSearch && matchCat;
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategoriesList(data.data.map(c => c.name));
        if (data.data.length > 0) setSelectedCategory(data.data[0].name);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    const fetchCakes = async () => {
      try {
        const res = await fetch('/api/files/all');
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch cakes');
        setCakes(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCakes();
    fetchCategories();
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) setUploadFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setUploadStatus('');

    try {
      let finalCategory = selectedCategory;

      // 1. Check if we need to create a new category first
      if (isNewCategory && newCategoryName.trim()) {
        const catRes = await fetch('/api/categories/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: newCategoryName })
        });
        const catData = await catRes.json();
        if (!catRes.ok) throw new Error(catData.message || 'Failed to create category');
        finalCategory = catData.data.name;
        // Refresh categories
        await fetchCategories();
      }

      // 2. Submit the main cake form
      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('name', uploadName);
      formData.append('price', uploadPrice);
      formData.append('description', uploadDesc);
      formData.append('category', finalCategory);

      const res = await fetch('/api/files/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');

      setCakes((prev) => [data.data, ...prev]);
      setUploadStatus('success');
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadFile(null);
        setUploadName('');
        setUploadPrice('');
        setUploadDesc('');
        setIsNewCategory(false);
        setNewCategoryName('');
        setUploadStatus('');
      }, 1500);
    } catch (err) {
      setUploadStatus(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="menu-page page-enter">
      {/* Page header */}
      <section className="menu-header">
        <div className="container">
          <motion.span
            className="section-subtitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Crafted with love
          </motion.span>
          <motion.h1
            className="section-title"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Our Cake Collection
          </motion.h1>
          <motion.p
            className="section-desc"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Every cake is baked fresh to order by Archana Karmakar using the finest ingredients.
          </motion.p>
        </div>
      </section>

      <div className="container">
        {/* Pricing Note */}
        <motion.div
          className="menu-pricing-note"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Info size={18} style={{ flexShrink: 0 }} />
          <span><strong>Note:</strong> All prices listed below are calculated per <strong>1 Pound (lb)</strong> cake custom order standard baseline.</span>
        </motion.div>

        {/* Controls row */}
        <div className="menu-controls">
          {/* Search */}
          <div className="menu-search-wrap">
            <Search size={16} className="menu-search-icon" />
            <input
              type="text"
              className="input-field menu-search"
              placeholder="Search cakes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="menu-search"
            />
          </div>

          {/* Admin upload button */}
          {isAdmin && (
            <motion.button
              className="btn-gold"
              onClick={() => setShowUploadModal(true)}
              whileTap={{ scale: 0.96 }}
              id="open-upload-modal"
            >
              <ImagePlus size={16} />
              Upload New Cake
            </motion.button>
          )}
        </div>

        <div className="menu-filters">
          <Filter size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          {['All', ...categoriesList].map((cat) => (
            <button
              key={cat}
              className={`menu-filter-btn ${category === cat ? 'menu-filter-btn--active' : ''}`}
              onClick={() => setCategory(cat)}
              id={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="menu-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card" style={{ height: '350px', background: 'var(--bg-secondary)', animate: 'pulse', opacity: 0.7, borderRadius: '12px' }}></div>
            ))}
          </div>
        ) : error ? (
          <div className="menu-empty">
            <p className="error">Error loading cakes: {error}</p>
          </div>
        ) : filteredCakes.length === 0 ? (
          <div className="menu-empty">
            <p>No cakes found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredCakes.map((cake, i) => (
              <CakeCard
                key={cake._id}
                cake={cake}
                index={i}
                onCakeUpdated={(updated) =>
                  setCakes(prev => prev.map(c => c._id === updated._id ? updated : c))
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal (Admin only) */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !uploading && setShowUploadModal(false)}
          >
            <motion.div
              className="upload-modal card"
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 30 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="upload-modal__header">
                <h2 className="upload-modal__title">Upload New Cake</h2>
                <button
                  className="cart-drawer__close"
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  aria-label="Close upload modal"
                  id="close-upload-modal"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="upload-modal__form">
                <div className="upload-modal__body">
                  {/* Dropzone */}
                  <div
                    className={`upload-dropzone ${dragOver ? 'upload-dropzone--active' : ''} ${uploadFile ? 'upload-dropzone--has-file' : ''}`}
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
                      onChange={(e) => setUploadFile(e.target.files[0])}
                    />
                    {uploadFile ? (
                      <div className="upload-preview">
                        <img
                          src={URL.createObjectURL(uploadFile)}
                          alt="Preview"
                          className="upload-preview__img"
                        />
                        <p className="upload-preview__name">{uploadFile.name}</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={36} strokeWidth={1.5} />
                        <p>Drag & drop an image here or <span>browse</span></p>
                        <span className="upload-dropzone__hint">PNG, JPG, WEBP up to 10MB</span>
                      </>
                    )}
                  </div>

                  <div className="input-group">
                    <label htmlFor="upload-name">Cake Name</label>
                    <input
                      id="upload-name"
                      className="input-field"
                      placeholder="e.g. Blueberry Cheesecake"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="upload-price">Price (₹)</label>
                    <input
                      id="upload-price"
                      className="input-field"
                      type="number"
                      min="0"
                      placeholder="1299"
                      value={uploadPrice}
                      onChange={(e) => setUploadPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="upload-desc">Description</label>
                    <textarea
                      id="upload-desc"
                      className="input-field"
                      rows={3}
                      placeholder="Describe this cake..."
                      value={uploadDesc}
                      onChange={(e) => setUploadDesc(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="upload-category">Category</label>
                    <select
                      id="upload-category"
                      className="input-field"
                      value={isNewCategory ? 'new_category' : selectedCategory}
                      onChange={(e) => {
                        if (e.target.value === 'new_category') {
                          setIsNewCategory(true);
                        } else {
                          setIsNewCategory(false);
                          setSelectedCategory(e.target.value);
                        }
                      }}
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="new_category">+ Add New Category</option>
                    </select>
                  </div>

                  {isNewCategory && (
                    <div className="input-group">
                      <label htmlFor="upload-new-category">NEW CATEGORY NAME</label>
                      <input
                        id="upload-new-category"
                        className="input-field"
                        placeholder="e.g. Seasonal"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {uploadStatus && uploadStatus !== 'success' && (
                    <p className="upload-error">{uploadStatus}</p>
                  )}

                  {uploadStatus === 'success' && (
                    <p className="upload-success">✓ Cake uploaded successfully!</p>
                  )}
                </div>

                <div className="upload-modal__footer">
                  <button
                    type="submit"
                    className="btn-gold"
                    disabled={uploading || !uploadFile}
                    id="submit-upload"
                    style={{ width: '100%', justifyContent: 'center', opacity: (!uploadFile || uploading) ? 0.6 : 1 }}
                  >
                    {uploading ? <><Loader size={16} className="spin-icon" /> Uploading…</> : <><Upload size={16} /> Add Cake to Menu</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
