import { ArrowRight, LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { QuoteModal } from './QuoteModal';

interface ServicePillarProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  services: string[];
  color: string;
  imagePosition: 'left' | 'right';
  index: number;
}

export function ServicePillar({
  icon: Icon,
  title,
  subtitle,
  services,
  color,
  imagePosition,
  index,
}: ServicePillarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pillarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (pillarRef.current) {
      observer.observe(pillarRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const ImageSection = () => (
    <div className="flex items-center justify-center">
      <div
        className="relative bg-gradient-to-br from-[#348ADC] to-[#65C9D4] p-8 rounded-2xl shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${color}20, ${color}40)`,
        }}
      >
        <div className="bg-white rounded-xl p-12 flex items-center justify-center">
          <Icon size={120} style={{ color }} />
        </div>
      </div>
    </div>
  );

  const ContentSection = () => (
    <div className="space-y-6">
      <div>
        <h3
          className="text-3xl md:text-4xl font-semibold text-[#072741] mb-3"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {title}
        </h3>
        <p
          className="text-xl text-[#BCC4C9] mb-6"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {subtitle}
        </p>
      </div>

      <ul className="space-y-3" style={{ fontFamily: 'Inter, sans-serif' }}>
        {services.map((service, i) => (
          <li key={i} className="flex items-start gap-3">
            <div
              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
              style={{ backgroundColor: color }}
            ></div>
            <span className="text-[#072741] opacity-90">{service}</span>
          </li>
        ))}
      </ul>

      <button onClick={() => setIsModalOpen(true)} className="bg-[#348ADC] hover:bg-[#2a6fb0] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mt-6">
        Get a Quote
        <ArrowRight size={18} />
      </button>
    </div>
  );

  return (
    <div
      ref={pillarRef}
      className={`transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="bg-[#FBFCFC] rounded-2xl shadow-lg border border-[#BCC4C9] p-8 md:p-12 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
        <div className={`grid md:grid-cols-2 gap-12 items-center ${imagePosition === 'right' ? 'md:flex-row-reverse' : ''}`}>
          {imagePosition === 'left' ? (
            <>
              <ImageSection />
              <ContentSection />
            </>
          ) : (
            <>
              <ContentSection />
              <ImageSection />
            </>
          )}
        </div>
      </div>

      <QuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} source={title} />
    </div>
  );
}
