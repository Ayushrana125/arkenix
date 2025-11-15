import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { QuoteModal } from './QuoteModal';

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-to-br from-[#072741] to-[#0a3d5c] text-white py-20 md:py-28"
    >
      {/* Softer background accents */}
      <div className="absolute top-32 right-10 w-72 h-72 bg-[#348ADC] rounded-full opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#65C9D4] rounded-full opacity-10 blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE TEXT */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <h1
              className="text-4xl md:text-5xl font-semibold mb-6 leading-tight"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Marketing doesn’t fail because of ideas. <br />
              It fails because execution slows down.
            </h1>

            <p
              className="text-lg text-gray-300 mb-4 leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Arkenix runs your entire marketing backenddddd —
              data, content, automation, and campaign delivery.
            </p>

            <p
              className="text-lg text-gray-300 mb-8 leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Your ideas. Our execution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#348ADC] hover:bg-[#2a6fb0] text-white px-6 py-3 rounded-lg text-base font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get a Quote
                <ArrowRight size={18} />
              </button>

              <button className="border border-white hover:bg-white hover:text-[#072741] px-6 py-3 rounded-lg text-base font-medium transition-all duration-300">
                Explore Services
              </button>
            </div>
          </div>

          {/* RIGHT SIDE – CLEAN IMAGE PLACEHOLDER */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="w-full h-64 md:h-80 bg-white/10 rounded-xl border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <span
                className="text-gray-300 text-lg"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Add your hero image here
              </span>
            </div>
          </div>

        </div>
      </div>

      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source="hero"
      />
    </section>
  );
}

