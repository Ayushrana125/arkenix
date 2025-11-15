import { ServicePillar } from './ServicePillar';
import { Database, Palette, Send, TrendingUp } from 'lucide-react';

export function ServicesSection() {
  const pillars = [
    {
      icon: Database,
      title: 'Build Your Data Foundation',
      subtitle: 'Clean, organized, enriched, ready to use.',
      services: [
        'Data extraction (forms/CRM/scrapers)',
        'Data merging & standardization',
        'Cleaning (duplicates, broken fields, formatting)',
        'Unified CRM management',
        'AI enrichment (industry tagging, grouping)',
        'Smart segments for outreach',
      ],
      color: '#348ADC',
      imagePosition: 'left' as const,
    },
    {
      icon: Palette,
      title: 'Write. Design. Brand.',
      subtitle: 'Messaging that feels human and looks premium.',
      services: [
        'Email copywriting',
        'WhatsApp copywriting',
        'Product announcements',
        'Campaign updates',
        'Launch emails',
        'Festive campaigns',
        'A/B copy variations',
        'Branded HTML email creation',
        'Template library setup',
      ],
      color: '#FF8C42',
      imagePosition: 'right' as const,
    },
    {
      icon: Send,
      title: 'Launch Without Limitations',
      subtitle: 'We handle delivery so campaigns never get stuck.',
      services: [
        'Mailgun setup',
        'Domain warm-up & deliverability',
        'n8n or Python automation',
        'Triggering campaigns',
        'Managing audiences',
        'Monitoring bounce/spam',
        'Running nurture flows',
      ],
      color: '#9B59B6',
      imagePosition: 'left' as const,
    },
    {
      icon: TrendingUp,
      title: 'Improve What Matters',
      subtitle: 'Clarity on performance, confidence in decisions.',
      services: [
        'Bounce report',
        'Delivery stats',
        'Open/click insights',
        'Performance summary',
        'Segment comparisons',
        'Copy comparisons',
        'Monthly optimization',
        'Recommendations',
      ],
      color: '#2ECC71',
      imagePosition: 'right' as const,
    },
  ];

  return (
    <section id="services" className="py-20 bg-[#DADFE4]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold text-[#072741] mb-4"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Four Pillars of Marketing Excellence
          </h2>
          <p
            className="text-xl text-[#072741] opacity-90 max-w-3xl mx-auto"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            A complete framework for modern marketing operations
          </p>
        </div>

        <div className="space-y-24">
          {pillars.map((pillar, index) => (
            <ServicePillar key={index} {...pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
