import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { QuoteModal } from './QuoteModal';

export function FullServiceCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    'Data & Audience Infrastructure',
    'Creative & Messaging Layer',
    'Campaign Execution & Delivery',
    'Performance Analytics & Optimization',
  ];

  return (
    <section ref={ctaRef} className="py-20 bg-gradient-to-br from-[#072741] to-[#0a3d5c] text-white">
      <div className="max-w-5xl mx-auto px-6">
        <div
          className={`text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Your End-to-End Marketing Backend Partner
          </h2>
          <p
            className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            All four pillars. One predictable monthly retainer. Complete marketing operations
            without the overhead of building an in-house team.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-lg transition-all duration-300 hover:bg-white/20"
                style={{
                  transitionDelay: `${index * 100}ms`,
                }}
              >
                <CheckCircle2 className="text-[#65C9D4] flex-shrink-0" size={24} />
                <span
                  className="text-left text-lg"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <button onClick={() => setIsModalOpen(true)} className="bg-[#348ADC] hover:bg-[#2a6fb0] text-white px-10 py-5 rounded-lg text-xl font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3 shadow-xl">
            Request Quote
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      <QuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} source="full-service-cta" />
    </section>
  );
}
