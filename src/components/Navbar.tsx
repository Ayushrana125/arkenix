import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { QuoteModal } from './QuoteModal';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <nav className="bg-white text-[#333] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          
          {/* Brand */}
          <div 
            className="text-3xl font-bold"
            style={{ fontFamily: 'Poppins, sans-serif', color: '#072741' }}
          >
            Arkenix
          </div>

          {/* Desktop Menu */}
          <div
            className="hidden md:flex items-center space-x-10 text-[16px] font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <a href="#home" className="hover:text-[#65C9D4] transition-colors duration-300">
              Home
            </a>
            <a href="#Waitlist" className="hover:text-[#65C9D4] transition-colors duration-300">
              About Us
            </a>
            <a href="#Waitlist" className="hover:text-[#65C9D4] transition-colors duration-300">
              Services
            </a>
            <a href="#Waitlist" className="hover:text-[#65C9D4] transition-colors duration-300">
              Testimonials
            </a>
            <a href="#Waitlist" className="hover:text-[#65C9D4] transition-colors duration-300">
              Contact
            </a>

            {/* Presento-style CTA button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#348ADC] hover:bg-[#2a6fb0] px-6 py-2 rounded-md text-white transition-all duration-300"
            >
              Get a Quote
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu (FULL, identical to desktop) */}
        {isOpen && (
          <div
            className="md:hidden mt-4 pb-6 pt-2 space-y-6 border-t border-gray-200 text-[16px] font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <a href="#home" className="block hover:text-[#65C9D4] transition-colors">
              Home
            </a>
            <a href="#Waitlist" className="block hover:text-[#65C9D4] transition-colors">
              About Us
            </a>
            <a href="#Waitlist" className="block hover:text-[#65C9D4] transition-colors">
              Services
            </a>
            <a href="#Waitlist" className="block hover:text-[#65C9D4] transition-colors">
              Testimonials
            </a>
            <a href="#Waitlist" className="block hover:text-[#65C9D4] transition-colors">
              Contact
            </a>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#348ADC] hover:bg-[#2a6fb0] w-full px-6 py-2 rounded-md text-white transition-all duration-300"
            >
              Get a Quote
            </button>
          </div>
        )}
      </div>

      <QuoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        source="navbar"
      />
    </nav>
  );
}
