import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { FullServiceCTA } from './components/FullServiceCTA';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Founder } from './components/Founder';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-[#DADFE4]">
      <Navbar />
      <Hero />
      <ServicesSection />
      <FullServiceCTA />
      <Testimonials />
      <Contact />
      <Founder />
      <Footer />
    </div>
  );
}

export default App;
