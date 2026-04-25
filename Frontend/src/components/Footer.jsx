import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ExternalLink } from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Handle cases where the logo might not be found
  const logoSrc = logo || '';

  const footerLinks = {
    platform: [
      { name: 'Catalogue', path: '/bookings' },
      { name: 'Resources', path: '/resources' },
      { name: 'Services', path: '/services' },
      { name: 'Support Center', path: '/support' },
    ],
    company: [
      { name: 'About UNI360', path: '/' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Privacy Policy', path: '/terms' },
      { name: 'Operational Audit', path: '/' },
    ],
    contact: [
      { icon: Mail, text: 'ops@uni360.edu', href: 'mailto:ops@uni360.edu' },
      { icon: Phone, text: '+94 11 234 5678', href: 'tel:+94112345678' },
      { icon: MapPin, text: 'Main Admin Block, Campus Center', href: '#' },
    ]
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 px-6 sm:px-12 relative overflow-hidden">
      {/* Test Marker */}
      <div className="sr-only">Footer Rendered</div>
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="bg-white p-1 rounded-xl group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-white/10 flex items-center justify-center overflow-hidden h-12 w-12">
                {logo ? (
                  <img src={logo} alt="UNI360 Logo" className="h-full w-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                ) : null}
                <div style={{ display: logo ? 'none' : 'block' }} className="text-slate-900 font-black text-xl">U</div>
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight uppercase">UNI 360</span>
                <p className="text-[10px] font-bold text-sky-400 tracking-[0.2em] uppercase">Smart Campus OS</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 font-medium">
              The unified operating system for modern campus intelligence. Managing spaces, resources, and incidents with real-time clarity.
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a key={idx} href="#" className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-sky-500 hover:text-white hover:border-sky-400 transition-all active:scale-90">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-sky-500 rounded-full" /> Platform
            </h4>
            <ul className="space-y-4">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm font-bold hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Audit */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" /> Governance
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm font-bold hover:text-white hover:translate-x-1 inline-block transition-all duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h4 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Get in Touch
            </h4>
            <ul className="space-y-5">
              {footerLinks.contact.map((item, idx) => (
                <li key={idx}>
                  <a href={item.href} className="group flex items-start gap-3 hover:text-white transition-colors">
                    <item.icon className="w-5 h-5 text-slate-500 group-hover:text-sky-400 shrink-0" />
                    <span className="text-sm font-bold">{item.text}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-black uppercase tracking-widest text-slate-500">
          <div className="flex items-center gap-4">
            <span>© {currentYear} UNI360 Smart Campus Operations Hub</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full hidden md:block" />
            <span className="hidden md:block">All rights reserved</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors flex items-center gap-1.5">
              System Status <ExternalLink className="w-3 h-3" />
            </a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#" className="hover:text-white transition-colors">Feedback</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
