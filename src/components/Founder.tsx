import { Linkedin } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function Founder() {
  const [isVisible, setIsVisible] = useState(false);
  const founderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (founderRef.current) {
      observer.observe(founderRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="founder" ref={founderRef} className="py-20 bg-[#FBFCFC]">
      <div className="max-w-5xl mx-auto px-6">
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <h2
            className="text-4xl md:text-5xl font-bold text-[#072741] mb-4"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Meet the Founder
          </h2>
        </div>

        <div
          className={`bg-white rounded-2xl shadow-lg border border-[#BCC4C9] p-8 md:p-12 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#348ADC] to-[#65C9D4] rounded-full blur-xl opacity-30"></div>
                <img
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Ayush Rana"
                  className="relative w-64 h-64 rounded-full object-cover border-4 border-white shadow-xl"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <h3
                className="text-3xl font-bold text-[#072741] mb-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Ayush Rana
              </h3>
              <p
                className="text-xl text-[#65C9D4] mb-6"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Founder & CEO
              </p>
              <p
                className="text-[#072741] opacity-90 leading-relaxed mb-6"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                With over a decade of experience in marketing technology and operations,
                Ayush founded Arkenix to solve a problem he saw repeatedly: talented marketing
                teams held back by technical complexity. His vision is to make enterprise-grade
                marketing infrastructure accessible to companies of all sizes through a
                service-first approach.
              </p>
              <p
                className="text-[#072741] opacity-90 leading-relaxed mb-8"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Before Arkenix, Ayush led marketing operations for multiple high-growth startups
                and built automation systems that processed millions of marketing touchpoints.
                He believes that great marketing should be measured by impact, not by the
                complexity of the tools behind it.
              </p>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#348ADC] hover:bg-[#2a6fb0] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                <Linkedin size={20} />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
