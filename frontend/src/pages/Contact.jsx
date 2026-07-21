import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { useRequireAuth } from '../hooks/useRequireAuth';
import './Contact.css';

const CONTACT_INFO = [
  { icon: <Phone size={20} />, title: 'Call Us', lines: ['+91 8777396996', 'Mon – Sat, 10 AM – 7 PM'] },
  { icon: <Mail size={20} />, title: 'Email Us', lines: ['aranyakarmakar3106@gmail.com', 'We reply within 24 hours'] },
  { icon: <MapPin size={20} />, title: 'Visit Us', lines: ['Shantipally, Patulia', 'Khardah, Kolkata-700 119', <a href="https://maps.app.goo.gl/9qst9W83LPxLAoc87" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>View on Maps</a>] },
  { icon: <Clock size={20} />, title: 'Working Hours', lines: ['Mon – Sat: 10 AM – 7 PM', 'Sunday: 11 AM – 5 PM'] },
];

export default function Contact() {
  const requireAuth = useRequireAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', occasion: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    requireAuth(async () => {
      setSending(true);
      setError('');
      // Simulate sending (replace with real email API call if needed)
      await new Promise((r) => setTimeout(r, 1200));
      setSending(false);
      setSent(true);
    });
  };

  return (
    <div className="contact-page page-enter">
      {/* Header */}
      <section className="contact-header">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-subtitle">Get in touch</span>
          <h1 className="section-title">Let's Create Something Sweet</h1>
          <p className="section-desc">
            Have a custom cake idea? Planning a special celebration? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="container contact-container">
        {/* Contact info cards */}
        <div className="contact-info-grid">
          {CONTACT_INFO.map((info, i) => (
            <motion.div
              key={info.title}
              className="contact-info-card card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
            >
              <span className="contact-info-card__icon">{info.icon}</span>
              <h3 className="contact-info-card__title">{info.title}</h3>
              {info.lines.map((line, j) => (
                <p key={j} className={j === 0 ? 'contact-info-card__primary' : 'contact-info-card__secondary'}>
                  {line}
                </p>
              ))}
            </motion.div>
          ))}
        </div>

        {/* Contact form */}
        <motion.div
          className="card contact-form-wrap"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="contact-form-title">Send Us a Message</h2>
          <p className="contact-form-desc">
            Fill out the form below and Archana will personally get back to you.
          </p>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                className="contact-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle size={48} strokeWidth={1.5} />
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. Archana will contact you within 24 hours.</p>
                <button className="btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', occasion: '', message: '' }); }} id="send-another">
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="contact-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="contact-form__row">
                  <div className="input-group">
                    <label htmlFor="contact-name">Full Name</label>
                    <input
                      id="contact-name"
                      name="name"
                      className="input-field"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="contact-email">Email Address</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className="input-field"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="contact-form__row">
                  <div className="input-group">
                    <label htmlFor="contact-phone">Phone Number</label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      className="input-field"
                      placeholder="+91 8777396996"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="contact-occasion">Occasion</label>
                    <select
                      id="contact-occasion"
                      name="occasion"
                      className="input-field"
                      value={form.occasion}
                      onChange={handleChange}
                    >
                      <option value="">Select occasion</option>
                      <option value="birthday">Birthday</option>
                      <option value="wedding">Wedding</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="baby-shower">Baby Shower</option>
                      <option value="corporate">Corporate Event</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="contact-message">Your Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="input-field"
                    rows={5}
                    placeholder="Describe your cake idea, theme, servings, date needed, or any special requests…"
                    value={form.message}
                    onChange={handleChange}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {error && <p style={{ color: 'var(--pink-500)', fontSize: '0.85rem' }}>{error}</p>}

                <motion.button
                  type="submit"
                  className="btn-primary contact-submit"
                  disabled={sending}
                  whileTap={{ scale: 0.97 }}
                  id="send-message-btn"
                >
                  {sending ? (
                    <span className="auth-spinner" />
                  ) : (
                    <><Send size={16} /> Send Message</>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
