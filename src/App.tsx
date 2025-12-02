import { Routes, Route, useNavigate } from 'react-router-dom';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { FullServiceCTA } from './components/FullServiceCTA';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Founder } from './components/Founder';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { Waitlist } from "./components/Waitlist";
import { WebPortal } from './components/WebPortal';

function App() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/web-portal');
  };

  function HomePage() {
    return (
      <div className="min-h-screen bg-[#DADFE4] w-full max-w-full overflow-x-hidden">
        <Navbar onLoginSuccess={handleLoginSuccess} />
        <Hero />
        <Waitlist />
        {/* <ServicesSection />
        <FullServiceCTA />
        <Testimonials />
        <Contact />
        <Founder />
        <Footer /> */}
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/web-portal" 
        element={<WebPortal />} 
      />
    </Routes>
  );
}





export default App;
