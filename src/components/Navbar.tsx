import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { QuoteModal } from './QuoteModal';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <nav className="bg-[#072741] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Arkenix
          </div>

          <div className="hidden md:flex items-center space-x-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            <a href="#home" className="hover:text-[#65C9D4] transition-colors duration-300">
              Home
            </a>
            <a href="#founder" className="hover:text-[#65C9D4] transition-colors duration-300">
              About Me
            </a>
            <a href="#services" className="hover:text-[#65C9D4] transition-colors duration-300">
              Services
            </a>
            <a href="#testimonials" className="hover:text-[#65C9D4] transition-colors duration-300">
              Testimonials
            </a>
            <a href="#contact" className="hover:text-[#65C9D4] transition-colors duration-300">
              Contact
            </a>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#348ADC] hover:bg-[#2a6fb0] px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105">
              Get a Quote
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden mt-4 space-y-4 pb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            <a href="#services" className="block hover:text-[#65C9D4] transition-colors">
              Services
            </a>
            <a href="#testimonials" className="block hover:text-[#65C9D4] transition-colors">
              Testimonials
            </a>
            <a href="#founder" className="block hover:text-[#65C9D4] transition-colors">
              About
            </a>
            <a href="#contact" className="block hover:text-[#65C9D4] transition-colors">
              Contact
            </a>
            <button onClick={() => setIsModalOpen(true)} className="bg-[#348ADC] hover:bg-[#2a6fb0] w-full px-6 py-2 rounded-lg transition-all duration-300">
              Get a Quote
            </button>
          </div>
        )}
      </div>

      <QuoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} source="navbar" />
    </nav>
  );
}
