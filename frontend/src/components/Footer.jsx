import { Link } from 'react-router-dom';
import { Globe, Share2, Phone, Mail, MapPin, Heart } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <img src="/logo.png" alt="Baked By Archana" className="footer__logo" />
            <h3 className="footer__name">Baked By Archana</h3>
            <p className="footer__tagline">
              Handcrafted with love by Archana Karmakar. Every cake tells a story.
            </p>
            <div className="footer__socials">
              <a href="#" aria-label="Website" className="footer__social-link" id="footer-website">
                <Globe size={18} />
              </a>
              <a href="#" aria-label="Share" className="footer__social-link" id="footer-share">
                <Share2 size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__list">
              <li><Link to="/" className="footer__list-link">Home</Link></li>
              <li><Link to="/menu" className="footer__list-link">Menu</Link></li>
              <li><Link to="/contact" className="footer__list-link">Contact</Link></li>
            </ul>
          </div>

          {/* Specialties */}
          <div className="footer__col">
            <h4 className="footer__col-title">Specialties</h4>
            <ul className="footer__list">
              <li><span className="footer__list-link">Wedding Cakes</span></li>
              <li><span className="footer__list-link">Birthday Cakes</span></li>
              <li><span className="footer__list-link">Custom Creations</span></li>
              <li><span className="footer__list-link">Cupcake Towers</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer__col">
            <h4 className="footer__col-title">Get in Touch</h4>
            <ul className="footer__contact-list">
              <li>
                <Phone size={14} />
                <span>+91 8777396996</span>
              </li>
              <li>
                <Mail size={14} />
                <span>aranyakarmakar3106@gmail.com</span>
              </li>
              <li>
                <MapPin size={14} />
                <a href="https://maps.app.goo.gl/9qst9W83LPxLAoc87" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <span>Shantipally, Patulia, Khardah, Kolkata-700 119</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copy">
            © {new Date().getFullYear()} Baked By Archana. All rights reserved.
          </p>
          <p className="footer__made-with">
            Made with <Heart size={12} fill="currentColor" /> by Archana Karmakar
          </p>
        </div>
      </div>
    </footer>
  );
}
