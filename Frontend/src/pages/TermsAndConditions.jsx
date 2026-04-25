import React from 'react';
import { Shield, Lock, FileText, Scale, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Shield,
      title: 'Agreement to Terms',
      content: 'By accessing and using the UNI360 Smart Campus platform, you agree to be bound by these Terms and Conditions. These terms apply to all users, including students, faculty, and administrative staff. If you disagree with any part of these terms, you may not access the service.',
    },
    {
      icon: Lock,
      title: 'User Accounts & Security',
      content: 'Users are responsible for maintaining the confidentiality of their account credentials. Any activities occurring under your account are your responsibility. You must immediately notify the administration of any unauthorized use of your account or security breach.',
    },
    {
      icon: Scale,
      title: 'Acceptable Use Policy',
      content: 'The platform is intended for academic and campus operational purposes only. Users must not engage in any activity that interferes with the platform\'s performance, security, or integrity. Prohibited activities include data mining, unauthorized access, and harassment of other users.',
    },
    {
      icon: FileText,
      title: 'Resource Booking & Services',
      content: 'Booking of campus resources (labs, lecture halls, equipment) is subject to availability and institutional policies. The administration reserves the right to cancel or reschedule bookings for priority campus events or maintenance requirements.',
    },
    {
      icon: Mail,
      title: 'Contact Information',
      content: 'For any queries regarding these Terms and Conditions, please contact the Smart Campus Operations Center at support@uni360.campus.edu or visit the administrative office in Block A.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-sky-100">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-100/30 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-50/40 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 py-12 sm:py-20">
        {/* Header */}
        <button 
          onClick={() => navigate(-1)}
          className="group mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors duration-300"
        >
          <div className="p-2 rounded-full border border-slate-200 group-hover:border-slate-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Go Back</span>
        </button>

        <header className="mb-16">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-600 mb-4">Legal Framework</p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 mb-6">
            Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">Conditions</span>
          </h1>
          <div className="h-1 w-20 bg-slate-900 rounded-full mb-6" />
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
            Please read these terms carefully before using the UNI360 platform. They govern your access and ensure a safe, productive environment for the entire campus community.
          </p>
        </header>

        {/* Content Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <section key={index} className="group relative">
              <div className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <section.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{section.title}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-medium">
                    {section.content}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Footer info */}
        <footer className="mt-20 pt-12 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</p>
            <p className="text-sm font-bold text-slate-900 mt-1">October 24, 2023</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-95">
              Print Document
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              I Understand
            </button>
          </div>
        </footer>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2023 UNI360 Smart Campus Operations Hub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
