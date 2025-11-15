import { Mail, Phone, ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { QuoteModal } from './QuoteModal';

export function Contact() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (contactRef.current) {
      observer.observe(contactRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" ref={contactRef} className="py-20 bg-[#DADFE4]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#348ADC] rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#65C9D4] rounded-full opacity-20 blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-[#348ADC] to-[#65C9D4] p-1 rounded-2xl">
                <div className="bg-[#FBFCFC] rounded-2xl p-12 flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="text-[#348ADC] mx-auto mb-4" size={80} />
                    <h3
                      className="text-2xl font-semibold text-[#072741]"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Let's Talk
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <h2
              className="text-4xl md:text-5xl font-bold text-[#072741] mb-6"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Ready to Transform Your Marketing Operations?
            </h2>
            <p
              className="text-xl text-[#072741] opacity-90 mb-8 leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Let's discuss how Arkenix can become your marketing backend partner.
              Get a custom quote tailored to your needs and see how we can help you
              scale without the complexity.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-[#072741]">
                <div className="bg-[#348ADC] p-3 rounded-lg">
                  <Mail className="text-white" size={24} />
                </div>
                <span className="text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  hello@arkenix.co
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#072741]">
                <div className="bg-[#65C9D4] p-3 rounded-lg">
                  <Phone className="text-white" size={24} />
                </div>
                <span className="text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Schedule a consultation call
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setIsModalOpen(true)} className="bg-[#348ADC] hover:bg-[#2a6fb0] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                Contact Now
                <ArrowRight size={20} />
              </button>
              <button className="border-2 border-[#348ADC] hover:bg-[#348ADC] hover:text-white text-[#348ADC] px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} source="contact" />
    </section>
  );
}
