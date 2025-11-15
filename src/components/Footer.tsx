import { Mail, Linkedin, Twitter, Github } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#072741] text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3
              className="text-2xl font-bold mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Arkenix
            </h3>
            <p
              className="text-gray-400 leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Your modern marketing backend partner. Enterprise-grade marketing operations,
              simplified.
            </p>
          </div>

          <div>
            <h4
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Services
            </h4>
            <ul className="space-y-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              <li>
                <a href="#services" className="text-gray-400 hover:text-[#65C9D4] transition-colors">
                  Data Infrastructure
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-400 hover:text-[#65C9D4] transition-colors">
                  Creative & Messaging
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-400 hover:text-[#65C9D4] transition-colors">
                  Campaign Execution
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-400 hover:text-[#65C9D4] transition-colors">
                  Analytics & Optimization
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Company
            </h4>
            <ul className="space-y-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              <li>
                <a href="#founder" className="text-gray-400 hover:text-[#65C9D4] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-400 hover:text-[#65C9D4] transition-colors">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-[#65C9D4] transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#65C9D4] transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Connect
            </h4>
            <div className="flex gap-4 mb-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-[#348ADC] p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-[#348ADC] p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:hello@arkenix.co"
                className="bg-white/10 hover:bg-[#348ADC] p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
              >
                <Mail size={20} />
              </a>
            </div>
            <p
              className="text-gray-400 text-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              hello@arkenix.co
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center">
          <p
            className="text-gray-400"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            © {currentYear} Arkenix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
