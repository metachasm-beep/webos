export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  prompt: string;
  style: 'dark-saas' | 'clean-minimal';
  framework: 'PAS' | 'AIDA' | 'BAB';
}

export const BUSINESS_TEMPLATES: Template[] = [
  // Professional Services
  { id: 'law-firm', name: 'Elite Legal Group', category: 'Legal', description: 'Trustworthy and authoritative design for law firms.', prompt: 'Modern law firm specializing in corporate litigation and intellectual property.', style: 'dark-saas', framework: 'PAS' },
  { id: 'consulting', name: 'Strategic Growth', category: 'Consulting', description: 'Clean, professional design for business consultants.', prompt: 'B2B strategic consulting for Fortune 500 companies.', style: 'clean-minimal', framework: 'AIDA' },
  { id: 'accounting', name: 'Precision Tax', category: 'Finance', description: 'Reliable and clear layout for accounting services.', prompt: 'Tax preparation and financial planning for small businesses.', style: 'clean-minimal', framework: 'BAB' },
  { id: 'marketing-agency', name: 'Vibe Marketing', category: 'Marketing', description: 'Bold and creative design for agencies.', prompt: 'Full-stack digital marketing agency focused on viral growth.', style: 'dark-saas', framework: 'AIDA' },
  
  // Tech & SaaS
  { id: 'saas-cloud', name: 'CloudSync AI', category: 'Tech', description: 'Sleek SaaS landing page for cloud infrastructure.', prompt: 'Cloud storage and AI-powered file organization for developers.', style: 'dark-saas', framework: 'PAS' },
  { id: 'cybersecurity', name: 'Sentinel Shield', category: 'Tech', description: 'High-security aesthetic for cyber firms.', prompt: 'Enterprise-grade cybersecurity monitoring and threat detection.', style: 'dark-saas', framework: 'BAB' },
  { id: 'mobile-app', name: 'Flow Mobile', category: 'Tech', description: 'Vibrant app landing page.', prompt: 'Task management mobile app for high-performance teams.', style: 'clean-minimal', framework: 'AIDA' },
  { id: 'blockchain', name: 'Ether Nexus', category: 'Tech', description: 'Futuristic design for crypto projects.', prompt: 'Decentralized finance platform for secure asset swapping.', style: 'dark-saas', framework: 'PAS' },

  // Health & Wellness
  { id: 'gym', name: 'Iron Core Fitness', category: 'Health', description: 'High-energy layout for fitness centers.', prompt: '24/7 high-performance gym with personal training and elite equipment.', style: 'dark-saas', framework: 'AIDA' },
  { id: 'yoga', name: 'Zen Flow Studio', category: 'Health', description: 'Calm and minimalist yoga studio design.', prompt: 'Mindful yoga and meditation classes for stress relief.', style: 'clean-minimal', framework: 'BAB' },
  { id: 'clinic', name: 'Wellness Med', category: 'Health', description: 'Professional and clean medical clinic page.', prompt: 'Modern medical clinic offering holistic and traditional treatments.', style: 'clean-minimal', framework: 'PAS' },
  { id: 'spa', name: 'Azure Spa', category: 'Health', description: 'Luxurious design for wellness retreats.', prompt: 'Luxury spa and wellness center specializing in organic therapies.', style: 'clean-minimal', framework: 'AIDA' },

  // E-commerce
  { id: 'fashion', name: 'Vogue Edge', category: 'E-commerce', description: 'Minimalist fashion store layout.', prompt: 'Sustainable high-fashion brand for the modern urbanite.', style: 'clean-minimal', framework: 'AIDA' },
  { id: 'electronics', name: 'Tech Hive', category: 'E-commerce', description: 'Gear-focused e-commerce design.', prompt: 'Premium headphones and audio gear for audiophiles.', style: 'dark-saas', framework: 'PAS' },
  { id: 'home-decor', name: 'Luxe Living', category: 'E-commerce', description: 'Elegant home interior store.', prompt: 'Handcrafted artisan furniture and minimalist home decor.', style: 'clean-minimal', framework: 'BAB' },
  { id: 'pet-store', name: 'Paws & Play', category: 'E-commerce', description: 'Friendly and colorful pet supply store.', prompt: 'Organic pet food and innovative toys for happy pets.', style: 'clean-minimal', framework: 'AIDA' },

  // Hospitality & Food
  { id: 'restaurant', name: 'The Bistro Table', category: 'Food', description: 'Mouth-watering restaurant landing page.', prompt: 'Farm-to-table fine dining experience with a seasonal menu.', style: 'dark-saas', framework: 'AIDA' },
  { id: 'coffee-shop', name: 'Brew & Bean', category: 'Food', description: 'Cozy and warm cafe design.', prompt: 'Artisanal coffee roastery and community gathering spot.', style: 'clean-minimal', framework: 'BAB' },
  { id: 'bakery', name: 'Golden Crust', category: 'Food', description: 'Sweet and simple bakery layout.', prompt: 'Fresh daily sourdough and French pastries in the heart of the city.', style: 'clean-minimal', framework: 'PAS' },
  { id: 'bar-lounge', name: 'Neon Nights', category: 'Food', description: 'Moody and atmospheric cocktail bar.', prompt: 'Speakeasy-style cocktail bar with live jazz and craft spirits.', style: 'dark-saas', framework: 'AIDA' },

  // Real Estate & Construction
  { id: 'real-estate', name: 'Horizon Reality', category: 'Real Estate', description: 'Professional property listing agent.', prompt: 'Luxury real estate agency specializing in waterfront properties.', style: 'clean-minimal', framework: 'AIDA' },
  { id: 'architecture', name: 'Structure Labs', category: 'Architecture', description: 'Bold architecture firm portfolio.', prompt: 'Sustainable and modern architectural design for smart cities.', style: 'dark-saas', framework: 'BAB' },
  { id: 'construction', name: 'Reliant Build', category: 'Construction', description: 'Sturdy and professional construction firm.', prompt: 'Commercial and residential construction with a focus on durability.', style: 'dark-saas', framework: 'PAS' },
  { id: 'interior-design', name: 'Inner Space', category: 'Design', description: 'Creative interior design studio.', prompt: 'Bespoke interior design for luxury residences and boutiques.', style: 'clean-minimal', framework: 'AIDA' },

  // Education & Learning
  { id: 'online-course', name: 'Skill Master', category: 'Education', description: 'Conversion-focused course page.', prompt: 'Mastering Full-Stack Development: A comprehensive 12-week bootcamp.', style: 'clean-minimal', framework: 'AIDA' },
  { id: 'language-school', name: 'Linguistics Pro', category: 'Education', description: 'Friendly language learning center.', prompt: 'Learn Spanish and French with native speakers online.', style: 'clean-minimal', framework: 'BAB' },
  { id: 'tutoring', name: 'Academic Edge', category: 'Education', description: 'Trustworthy private tutoring.', prompt: 'Personalized math and science tutoring for high school students.', style: 'clean-minimal', framework: 'PAS' },
  { id: 'music-lessons', name: 'Sonic Academy', category: 'Education', description: 'Rhythmic music school design.', prompt: 'Private piano and guitar lessons for all age groups.', style: 'dark-saas', framework: 'AIDA' },

  // Logistics & Automotive
  { id: 'logistics', name: 'Swift Move', category: 'Logistics', description: 'Fast and reliable shipping firm.', prompt: 'Global logistics and freight forwarding for e-commerce brands.', style: 'dark-saas', framework: 'PAS' },
  { id: 'car-rental', name: 'Drive Elite', category: 'Automotive', description: 'Premium car rental landing page.', prompt: 'Luxury and exotic car rentals for business and leisure.', style: 'dark-saas', framework: 'AIDA' },
  { id: 'auto-repair', name: 'Precision Motors', category: 'Automotive', description: 'Reliable auto repair shop.', prompt: 'Full-service auto repair specializing in German engineering.', style: 'clean-minimal', framework: 'BAB' },
  { id: 'moving-company', name: 'Easy Relocate', category: 'Logistics', description: 'Stress-free moving services.', prompt: 'Professional residential and office moving across the country.', style: 'clean-minimal', framework: 'AIDA' },

  // Creative & Media
  { id: 'photography', name: 'Lens Focus', category: 'Creative', description: 'Stunning photography portfolio.', prompt: 'Wedding and portrait photography capturing timeless moments.', style: 'clean-minimal', framework: 'AIDA' },
  { id: 'videography', name: 'Frame Story', category: 'Creative', description: 'Dynamic video production house.', prompt: 'Cinematic brand storytelling and high-impact commercial video.', style: 'dark-saas', framework: 'BAB' },
  { id: 'graphic-design', name: 'Pixel Perfect', category: 'Creative', description: 'Modern design studio portfolio.', prompt: 'Logo design, branding, and digital illustration for startups.', style: 'clean-minimal', framework: 'PAS' },
  { id: 'event-planning', name: 'Grand Gala', category: 'Creative', description: 'Elegant event management.', prompt: 'Bespoke wedding and corporate event planning.', style: 'clean-minimal', framework: 'AIDA' },

  // Non-Profit & Community
  { id: 'charity', name: 'Hope Foundation', category: 'Impact', description: 'Inspiring non-profit landing page.', prompt: 'Providing clean water and education to underserved communities.', style: 'clean-minimal', framework: 'PAS' },
  { id: 'animal-rescue', name: 'Safe Haven', category: 'Impact', description: 'Friendly animal shelter design.', prompt: 'Rescuing and rehoming abandoned pets in the local area.', style: 'clean-minimal', framework: 'BAB' },
  { id: 'eco-friendly', name: 'Green Path', category: 'Impact', description: 'Sustainability-focused initiative.', prompt: 'Promoting zero-waste living and local composting programs.', style: 'clean-minimal', framework: 'AIDA' },
  { id: 'church', name: 'Unity Chapel', category: 'Community', description: 'Welcoming community church page.', prompt: 'A diverse and inclusive community sharing faith and love.', style: 'clean-minimal', framework: 'PAS' },

  // Specialized Services
  { id: 'gardening', name: 'Emerald Lawn', category: 'Services', description: 'Vibrant landscaping and garden care.', prompt: 'Residential landscaping and periodic garden maintenance.', style: 'clean-minimal', framework: 'BAB' },
  { id: 'cleaning', name: 'Sparkle Clean', category: 'Services', description: 'Trustworthy house cleaning services.', prompt: 'Eco-friendly residential and commercial cleaning services.', style: 'clean-minimal', framework: 'AIDA' },
  { id: 'plumbing', name: 'Flow Masters', category: 'Services', description: 'Reliable emergency plumbing.', prompt: '24/7 plumbing repairs and installation for homes.', style: 'clean-minimal', framework: 'PAS' },
  { id: 'electrician', name: 'Volt Expert', category: 'Services', description: 'Safe and certified electrical work.', prompt: 'Residential electrical inspections, wiring, and repairs.', style: 'clean-minimal', framework: 'BAB' },

  // Miscellaneous
  { id: 'gaming-clan', name: 'Apex Raiders', category: 'Entertainment', description: 'High-octane gaming community.', prompt: 'Competitive eSports team and content creation collective.', style: 'dark-saas', framework: 'AIDA' },
  { id: 'podcast', name: 'Deep Talk', category: 'Media', description: 'Engaging podcast landing page.', prompt: 'Weekly interviews with industry leaders and innovative thinkers.', style: 'dark-saas', framework: 'BAB' },
  { id: 'travel-blog', name: 'Nomad Soul', category: 'Travel', description: 'Adventurous travel blog.', prompt: 'Sharing hidden gems and travel guides from around the world.', style: 'clean-minimal', framework: 'PAS' },
  { id: 'coworking', name: 'Hive Hub', category: 'Business', description: 'Professional coworking space.', prompt: 'Modern shared workspaces for freelancers and startups.', style: 'clean-minimal', framework: 'AIDA' },
  { id: 'personal-trainer', name: 'Coach Alex', category: 'Health', description: 'Personal branding for trainers.', prompt: 'Transform your body and mind with 1-on-1 coaching.', style: 'dark-saas', framework: 'PAS' },
  { id: 'barber-shop', name: 'Sharp Cut', category: 'Services', description: 'Classic and cool barber shop.', prompt: 'Premium haircuts and traditional hot towel shaves.', style: 'dark-saas', framework: 'AIDA' },
];

export const SECTION_TEMPLATES = {
  HERO: [
    { id: 'hero-standard', icon: 'Layout', name: 'Standard Hero', type: 'hero', heading: 'Transform Your Digital Matrix', subheading: 'High-performance synthesis for the modern enterprise.', ctaText: 'Deploy Now' },
    { id: 'hero-neon', icon: 'Zap', name: 'Neon Variant', type: 'hero', variant: 'neon', heading: 'Genesis Synthesis', subheading: 'Boutique aesthetics for high-fidelity brands.', ctaText: 'Synthesize' },
    { id: 'hero-minimal', icon: 'Type', name: 'Clean Minimal', type: 'hero', heading: 'Pure Design', subheading: 'Less complexity, more impact.', ctaText: 'Explore' }
  ],
  SERVICES: [
    { id: 'services-grid', icon: 'Layers', name: 'Service Grid', type: 'service', heading: 'Strategic Solutions', subheading: 'High-fidelity execution across all vectors.' },
    { id: 'features-standard', icon: 'CheckCircle2', name: 'Feature Set', type: 'features', heading: 'Core Capabilities', subheading: 'Engineered for exponential growth.' }
  ],
  ABOUT: [
    { id: 'about-testimonial', icon: 'Users', name: 'Client Proof', type: 'testimonial', quote: 'WebOS has revolutionized our conversion matrix.', author: 'Sarah Jenkins', role: 'CTO' },
    { id: 'about-service', icon: 'Globe', name: 'Global Impact', type: 'service', heading: 'Founded on Innovation', subheading: 'Pioneering the future of digital architecture.' }
  ],
  PRICING: [
    { id: 'pricing-tiered', icon: 'ShieldCheck', name: 'Tiered Matrix', type: 'pricing', heading: 'Scale Your Success', subheading: 'Transparent synthesis for every stage.' },
    { id: 'pricing-smart', icon: 'Sparkles', name: 'Smart Pricing', type: 'smart-pricing', featured: true, heading: 'Strategic Synthesis Pricing', subheading: 'Transparent scaling for the next generation.' }
  ],
  CONTACT: [
    { id: 'contact-standard', icon: 'Send', name: 'Contact Form', type: 'contact', heading: 'Initiate Link', subheading: 'Our neural core is ready to process your request.' },
    { id: 'contact-magnet', icon: 'Sparkles', name: 'Lead Magnet', type: 'lead-magnet', heading: 'Join the Vanguard', subheading: 'Get exclusive strategic updates.' }
  ],
  BENTO: [
    { id: 'bento-standard', icon: 'Layout', name: 'Bento Grid', type: 'bento', heading: 'The Bento Matrix', subheading: 'High-fidelity modular grid orchestration.' },
    { id: 'bento-features', icon: 'Layers', name: 'Feature Bento', type: 'bento', heading: 'Core Capabilities', subheading: 'Premium non-uniform grid layout.' }
  ],
  COLLECTION: [
    { id: 'collection-team', icon: 'Users', name: 'The Team', type: 'team', heading: 'The Vanguard Team', subheading: 'Engineered for high-fidelity execution.' },
    { id: 'collection-portfolio', icon: 'Globe', name: 'Portfolio Grid', type: 'portfolio', heading: 'Our Work', subheading: 'High-fidelity case studies and outcomes.' }
  ]
};
