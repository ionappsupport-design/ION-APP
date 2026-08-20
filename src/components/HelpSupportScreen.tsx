import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronRight, 
  HelpCircle, 
  Mail, 
  ShieldCheck, 
  FileText, 
  Headphones, 
  CheckCircle2,
  ChevronDown,
  Send,
  AlertCircle
} from 'lucide-react';
import { NavigationTab } from '../types';
interface HelpSupportScreenProps {
  onBack: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  React.useEffect(() => {
    // Local mode - no stored user fetched
  }, []);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ id: string; preview: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const faqs = [
    {
      q: 'How does ION detect duplicate photos safely?',
      a: 'ION utilizes advanced cryptographic hashing combined with structural similarity index measure (SSIM) to scan your media on a pixel-by-pixel level. This allows it to identify exact duplicates, burst shots, and visually similar photos. Our smart algorithm automatically flags the highest resolution original as the "Best" photo, while selecting the inferior copies for safe removal. You always retain the original, highest quality memory.',
    },
    {
      q: 'Is my data safe and private when using ION?',
      a: 'Absolutely. ION operates with a strict "Privacy First" offline architecture. All scanning, hashing, and duplicate detection happen entirely locally on your device. We do not upload your personal photos, videos, or files to any cloud servers. Your personal data never leaves your phone.',
    },
    {
      q: 'What happens if I accidentally delete an important file?',
      a: 'You are completely protected by ION\'s Secure 30-Day Recycle Bin architecture. When you clean files using ION, they are not immediately destroyed. Instead, they are securely moved to a hidden local backup vault on your device for 30 days. You can instantly restore any accidentally deleted file with a single tap from the Recycle Bin tab. After 30 days, files are permanently erased to free up space.',
    },
    {
      q: 'How does the Video Compressor reclaim so much space?',
      a: 'Our built-in Video Compressor leverages hardware-accelerated H.264/HEVC transcoding algorithms. It optimizes bitrates and frame encoding without visibly affecting the human eye\'s perception of quality. By intelligently stripping out unnecessary metadata and compressing visual artifacts, ION can reduce large video file sizes by up to 80% while keeping them crisp and shareable.',
    },
    {
      q: 'Why does ION need "All Files Access" (MANAGE_EXTERNAL_STORAGE)?',
      a: 'To perform a comprehensive deep clean, ION requires the Android Storage Access Framework (SAF) permission. This permission allows ION to scan beyond standard media folders—it can detect hidden app caches, leftover junk from uninstalled apps, bloated WhatsApp databases, and temporary files scattered across your internal storage that standard gallery apps cannot see.',
    }
  ];

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !message) return;
    setIsSubmitting(true);
    setError(null);

    // Mock local submission
    setTimeout(() => {
      const mockTicketId = 'TKT-' + Math.floor(Math.random() * 10000);
      const preview = `To: ${userEmail}\nSubject: Re: ${subject || 'ION Support Request'}\n\nHi ${userName || 'User'},\n\nThank you for reaching out to ION Support Team. We have received your inquiry: "${message.substring(0, 80)}...". Our technical team will review your query and get back to you shortly.\n\nTicket Reference: ${mockTicketId}\nStatus: OPEN`;
      setTicketResult({
        id: mockTicketId,
        preview,
      });
      setMessage('');
      setSubject('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <header className="shrink-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-slate-200/50 dark:border-slate-800">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          Help & Support
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Support Links List */}
        <div className="bg-slate-900/90 rounded-3xl p-2 border border-slate-800 shadow-sm divide-y divide-slate-800/60">
          {/* FAQs Item */}
          <div className="p-3.5">
            <div 
              onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-900/30 text-cyan-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-white">
                  Frequently Asked Questions
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex !== null ? 'rotate-180' : ''}`} />
            </div>

            {openFaqIndex !== null && (
              <div className="mt-3 space-y-3 pt-2 border-t border-slate-800">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-slate-800/50 p-3 rounded-2xl space-y-1 text-left">
                    <div className="text-xs font-bold text-white">{faq.q}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{faq.a}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support Toggle */}
          <button 
            onClick={() => setShowTicketForm(!showTicketForm)}
            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-800/40 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-900/30 text-cyan-400 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">Contact Support</span>
                <span className="text-[10px] text-slate-400">ionapp.support@gmail.com</span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showTicketForm ? 'rotate-90' : ''}`} />
          </button>

          {/* How ION works */}
          <div className="p-3.5 border-b border-slate-800/60">
            <div 
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-900/30 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-white">
                  How ION Works
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showHowItWorks ? 'rotate-180' : ''}`} />
            </div>

            {showHowItWorks && (
              <div className="mt-3 p-3 bg-slate-800/50 rounded-2xl text-xs text-slate-400 leading-relaxed text-left space-y-3">
                <p>
                  <strong className="text-slate-200 block mb-0.5">1. Intelligent Scanning Engine</strong>
                  ION's proprietary scanning algorithms deeply analyze your phone's internal storage in seconds, uncovering hidden caches, leftover app data, identical duplicate photos, and oversized media.
                </p>
                <p>
                  <strong className="text-slate-200 block mb-0.5">2. Smart Selection & Safety</strong>
                  We automatically categorize everything. Our algorithm identifies the highest quality "Best" photos and safely groups exact duplicates, ensuring you never lose important memories.
                </p>
                <p>
                  <strong className="text-slate-200 block mb-0.5">3. 30-Day Recovery Architecture</strong>
                  When you clean your storage, your files are securely moved to a 30-day Recycle Bin. You instantly get your storage space back, with the complete peace of mind that you can reverse any accidental deletion with a single tap.
                </p>
              </div>
            )}
          </div>

          {/* Privacy Policy */}
          <button 
            onClick={() => onNavigate('security')}
            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-800/40 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-900/30 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white">
                Privacy & Data Security Policy
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Realtime Email Ticket Form */}
        {showTicketForm && (
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3.5">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Create Support Ticket</h3>
            </div>

            {error && (
              <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 flex items-center gap-2 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {ticketResult ? (
              <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl p-4 space-y-2 text-xs text-emerald-300">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Ticket Logged: {ticketResult.id}</span>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl font-mono text-[11px] text-slate-300 whitespace-pre-line border border-slate-800">
                  {ticketResult.preview}
                </div>
                <button
                  onClick={() => setTicketResult(null)}
                  className="mt-2 text-xs font-bold text-cyan-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="Alex"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Storage scan question"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe how we can help you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Ticket...' : 'Dispatch Ticket to Support'}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
