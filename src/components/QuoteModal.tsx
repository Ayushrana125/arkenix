import { X, Loader } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

export function QuoteModal({ isOpen, onClose, source }: QuoteModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: submitError } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            company: formData.company || null,
            message: formData.message,
            source: source || 'general',
          },
        ]);

      if (submitError) throw submitError;

      setIsSubmitted(true);
      setFormData({ name: '', email: '', company: '', message: '' });

      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to send request. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#BCC4C9] hover:text-[#072741] transition-colors"
        >
          <X size={24} />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3
              className="text-2xl font-bold text-[#072741] mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Request Sent!
            </h3>
            <p
              className="text-[#BCC4C9]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              We'll get back to you soon.
            </p>
          </div>
        ) : (
          <>
            <h2
              className="text-3xl font-bold text-[#072741] mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Get a Quote
            </h2>
            <p
              className="text-[#BCC4C9] mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Tell us about your needs and we'll send a custom proposal.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-[#072741] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#BCC4C9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348ADC] focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[#072741] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-[#BCC4C9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348ADC] focus:border-transparent"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-semibold text-[#072741] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Company (Optional)
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-[#BCC4C9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348ADC] focus:border-transparent"
                  placeholder="Your Company"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-[#072741] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-[#BCC4C9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348ADC] focus:border-transparent resize-none"
                  placeholder="Tell us about your marketing needs..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#348ADC] hover:bg-[#2a6fb0] disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading && <Loader size={20} className="animate-spin" />}
                {isLoading ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
