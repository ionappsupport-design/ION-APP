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
  AlertCircle,
  Phone,
  User,
  MapPin,
  X
} from 'lucide-react';
import { NavigationTab } from '../types';
import { 
  DEVELOPER_INFO, 
  PRIVACY_POLICY_DATA, 
  TERMS_OF_USE_DATA, 
  REFUND_POLICY_DATA 
} from '../utils/legalPolicies';

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
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<{ id: string; preview: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<'privacy' | 'terms' | 'refund' | null>(null);

  const faqs = [
    {
      q: 'How does ION detect duplicate photos safely?',
      a: 'ION utilizes advanced cryptographic hashing combined with structural similarity heuristics to scan media. It automatically flags the highest resolution copy as the "Best" original while selecting redundant duplicates for safe cleaning.',
    },
    {
      q: 'Is my data safe and private when using ION?',
      a: 'Absolutely. ION operates with a strict "Privacy First" offline architecture. All scanning, hashing, and duplicate detection happen entirely locally on your device. Your files never leave your phone.',
    },
    {
      q: 'What happens if I accidentally delete an important file?',
      a: 'You are completely protected by ION\'s Secure 30-Day Recycle Bin architecture. Cleaned files are securely archived in a hidden local backup vault for 30 days and can be restored with a single tap.',
    },
    {
      q: 'What are the pricing rates for ION Pro?',
      a: 'India: Rs. 100 | USA: US$ 4 | UK: £3 GBP | All other countries: Equivalent to US$ 4. All purchases include lifetime VIP updates and zero recurring fees.',
    },
    {
      q: 'What is the Refund Policy?',
      a: 'As per our Refund Policy (Effective August 21, 2026), all purchases made through the App are final and non-refundable, except where required by law. Duplicate or technical charges can be reported to our support team.',
    }
  ];

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail || !message) return;
    setIsSubmitting(true);
    setError(null);

    // Mock local ticket submission
    setTimeout(() => {
      const mockTicketId = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
      const preview = `To: ${userEmail}\nSubject: Re: ${subject || 'ION Support Request'}\n\nHi ${userName || 'User'},\n\nThank you for reaching out to ION Support. We have received your inquiry: "${message.substring(0, 80)}...". Our developer team will review your query and get back to you shortly.\n\nTicket Reference: ${mockTicketId}\nDeveloper: ${DEVELOPER_INFO.founder}\nEmail: ${DEVELOPER_INFO.founderEmail}\nStatus: OPEN`;
      setTicketResult({
        id: mockTicketId,
        preview,
      });
      setMessage('');
      setSubject('');
      setIsSubmitting(false);
    }, 800);
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* FAQs Item */}
          <div className="p-3.5">
            <div 
              onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Frequently Asked Questions
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaqIndex !== null ? 'rotate-180' : ''}`} />
            </div>

            {openFaqIndex !== null && (
              <div className="mt-3 space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl space-y-1 text-left">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{faq.q}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact Support Toggle */}
          <button 
            onClick={() => setShowTicketForm(!showTicketForm)}
            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Contact Developer & Support</span>
                <span className="text-[10px] text-slate-400">{DEVELOPER_INFO.founderEmail}</span>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showTicketForm ? 'rotate-90' : ''}`} />
          </button>

          {/* How ION works */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/60">
            <div 
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  How ION Works
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showHowItWorks ? 'rotate-180' : ''}`} />
            </div>

            {showHowItWorks && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-left space-y-3">
                <p>
                  <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">1. Intelligent Scanning Engine</strong>
                  ION deeply analyzes internal storage in seconds, uncovering hidden caches, leftover app residuals, and oversized media.
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">2. Smart Selection & Safety</strong>
                  Our algorithm identifies the highest quality "Best" photos and safely groups exact duplicates, ensuring you never lose important memories.
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-slate-200 block mb-0.5">3. 30-Day Recovery Architecture</strong>
                  When you clean your storage, your files are securely moved to a 30-day Recycle Bin. You can reverse any accidental deletion with a single tap.
                </p>
              </div>
            )}
          </div>

          {/* Privacy Policy Link */}
          <button 
            onClick={() => setSelectedPolicy('privacy')}
            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Privacy Policy (Aug 21, 2026)
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Terms of Use Link */}
          <button 
            onClick={() => setSelectedPolicy('terms')}
            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Terms of Use (Aug 21, 2026)
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          {/* Refund Policy Link */}
          <button 
            onClick={() => setSelectedPolicy('refund')}
            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Refund Policy (Aug 21, 2026)
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Developer Contact Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 text-xs">
          
          {/* Founder Section */}
          <div className="space-y-1">
            <div className="font-bold text-slate-900 dark:text-white text-sm">{DEVELOPER_INFO.founder}</div>
            <div className="text-slate-600 dark:text-slate-400">{DEVELOPER_INFO.founderTitle}</div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span>Email:</span>
              <a href={`mailto:${DEVELOPER_INFO.founderEmail}`} className="text-blue-600 dark:text-cyan-400 font-medium">{DEVELOPER_INFO.founderEmail}</a>
            </div>
          </div>

          <div className="h-px bg-slate-200 dark:bg-slate-800" />

          {/* Co-Developer Section */}
          <div className="space-y-1">
            <div className="text-slate-600 dark:text-slate-400">Co-developed by</div>
            <div className="font-bold text-slate-900 dark:text-white text-sm">{DEVELOPER_INFO.coDeveloper}</div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span>Email:</span>
              <a href={`mailto:${DEVELOPER_INFO.coDeveloperEmail}`} className="text-blue-600 dark:text-cyan-400 font-medium">{DEVELOPER_INFO.coDeveloperEmail}</a>
            </div>
          </div>

        </div>

        {/* Realtime Email Ticket Form */}
        {showTicketForm && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-3.5">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Support Ticket</h3>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 rounded-xl p-3 flex items-center gap-2 text-rose-600 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {ticketResult ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-500/40 rounded-2xl p-4 space-y-2 text-xs text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Ticket Logged: {ticketResult.id}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950/60 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-line border border-emerald-100 dark:border-slate-800">
                  {ticketResult.preview}
                </div>
                <button
                  onClick={() => setTicketResult(null)}
                  className="mt-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="Alex"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Storage scan question"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe how we can help you..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500"
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

      {/* Policy Viewer Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedPolicy === 'privacy' && PRIVACY_POLICY_DATA.title}
                  {selectedPolicy === 'terms' && TERMS_OF_USE_DATA.title}
                  {selectedPolicy === 'refund' && REFUND_POLICY_DATA.title}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Effective Date: August 21, 2026</p>
              </div>
              <button
                onClick={() => setSelectedPolicy(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed pr-1">
              {selectedPolicy === 'privacy' && (
                PRIVACY_POLICY_DATA.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{sec.heading}</h4>
                    <p className="whitespace-pre-line text-[11px] text-slate-600 dark:text-slate-400">{sec.content}</p>
                  </div>
                ))
              )}
              {selectedPolicy === 'terms' && (
                TERMS_OF_USE_DATA.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{sec.heading}</h4>
                    <p className="whitespace-pre-line text-[11px] text-slate-600 dark:text-slate-400">{sec.content}</p>
                  </div>
                ))
              )}
              {selectedPolicy === 'refund' && (
                REFUND_POLICY_DATA.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{sec.heading}</h4>
                    <p className="whitespace-pre-line text-[11px] text-slate-600 dark:text-slate-400">{sec.content}</p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedPolicy(null)}
              className="w-full mt-3 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
