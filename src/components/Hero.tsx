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

  const featureImages = [
    "/data.gif",
    "/content.gif",
    "/automation.gif",
    "/campaign.gif",
  ];

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-gradient-to-br from-[#072741] to-[#0a3d5c] text-white pt-12 pb-20 md:pt-16 md:pb-24"
    >
      {/* Background glows */}
      <div className="absolute top-24 right-16 w-72 h-72 bg-[#348ADC]/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-20px] left-[-20px] w-72 h-72 bg-[#65C9D4]/10 rounded-full blur-2xl"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
            }`}
          >
            <h1
              className="text-4xl md:text-5xl font-semibold mb-6 leading-tight"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              <span className="text-[#65C9D4]">
                Marketing doesn’t fail because of ideas.
              </span>
              <br />
              <span className="text-white">
                It fails because of inefficient execution.
              </span>
            </h1>

            <p
              className="text-lg text-gray-300 mb-4 leading-relaxed font-normal"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Arkenix handles the entire backend of your marketing - your data,
              your content, your automations, and your campaigns, so everything
              runs smoothly.
            </p>

            <p
              className="text-lg text-gray-300 mb-8 leading-relaxed font-semibold"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              You bring the vision. We will make it happen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#348ADC] hover:bg-[#2a6fb0] text-white px-6 py-3 rounded-lg text-base font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get a Quote
                <ArrowRight size={18} />
              </button>

              <button className="border border-white/70 hover:bg-white hover:text-[#072741] px-6 py-3 rounded-lg text-base font-medium transition-all duration-300">
                Explore Services
              </button>
            </div>
          </div>





          {/* RIGHT SIDE – 2×2 GRID WITH TIGHTER WRAPPER (Option A) */}
          <div
            className={`
              grid grid-cols-2 gap-4
              w-[350px] md:w-[420px]
              ml-12                     /* <-- MOVE BASKET RIGHT */
              transition-all duration-1000 delay-300
              ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}
            `}
          >

            {featureImages.map((src, i) => (
              <div
                key={i}
                className={`
                  aspect-square
                  flex items-center justify-center
                  transition-all duration-700 ease-out
                  ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                `}
                style={{ transitionDelay: `${300 + i * 150}ms` }}
              >
                {/* WRAPPER */}
                <div
                  className="
                    w-[130px] h-[130px] md:w-[155px] md:h-[155px]
                    rounded-2xl
                    border border-[#4aa5ff]/40
                    bg-white/5
                    backdrop-blur-sm
                    shadow-[0_0_12px_2px_rgba(80,180,255,0.25)]
                    flex items-center justify-center
                  "
                >
                  {/* INNER WHITE BOX */}
                  <div
                    className="
                      w-[100px] h-[100px] md:w-[120px] md:h-[120px]
                      bg-white 
                      rounded-xl
                      shadow-sm
                      flex items-center justify-center
                    "
                  >
                    <img
                      src={src}
                      alt='feature'
                      className="w-[85px] h-[85px] md:w-[100px] md:h-[100px] object-contain"
                    />
                  </div>
                </div>
              </div>
            ))}
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
