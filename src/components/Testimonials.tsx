import { useEffect, useRef, useState } from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  country: string;
  flag: string;
  quote: string;
  image: string;
}

export function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Chen',
      role: 'VP of Marketing',
      company: 'TechFlow Inc',
      country: 'United States',
      flag: '🇺🇸',
      quote: 'Arkenix transformed our marketing operations. What used to take weeks now happens in days. Their data infrastructure setup alone saved us 20+ hours per month.',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'James Mitchell',
      role: 'Founder & CEO',
      company: 'GrowthLabs',
      country: 'United Kingdom',
      flag: '🇬🇧',
      quote: 'The attention to detail in their campaign execution is remarkable. Every email template is pixel-perfect, and our deliverability has never been better.',
      image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Priya Sharma',
      role: 'Marketing Director',
      company: 'Innovate Digital',
      country: 'India',
      flag: '🇮🇳',
      quote: 'Working with Arkenix feels like having an entire marketing ops team on retainer. They handle everything from data cleaning to performance analytics flawlessly.',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      name: 'Marcus Weber',
      role: 'Head of Growth',
      company: 'ScaleUp GmbH',
      country: 'Germany',
      flag: '🇩🇪',
      quote: 'Professional, reliable, and always ahead of schedule. Their monthly optimization reports have been instrumental in improving our campaign performance by 40%.',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  return (
    <section id="testimonials" ref={sectionRef} className="py-20 bg-[#FBFCFC]">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <h2
            className="text-4xl md:text-5xl font-bold text-[#072741] mb-4"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Trusted by Marketing Leaders Worldwide
          </h2>
          <p
            className="text-xl text-[#072741] opacity-90 max-w-3xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            See what our clients say about working with Arkenix
          </p>
        </div>

        <div className="overflow-x-auto pb-8 -mx-6 px-6">
          <div className="flex gap-6 min-w-max">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`flex-shrink-0 w-96 bg-white rounded-2xl shadow-lg border border-[#BCC4C9] p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <Quote className="text-[#65C9D4] mb-4" size={40} />
                <p
                  className="text-[#072741] opacity-90 mb-6 leading-relaxed"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className="text-[#072741] font-semibold"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {testimonial.name}
                      </h4>
                      <span className="text-xl">{testimonial.flag}</span>
                    </div>
                    <p
                      className="text-[#BCC4C9] text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
