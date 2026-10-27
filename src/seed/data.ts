/*
 * Dummy content from the approved homepage mockup and banners, with spelling
 * corrected. Brands, case studies and testimonials are placeholders.
 */

export const banners = [
  {
    label: "Performance Marketing",
    headline: "Turn Ad Spend into Measurable Growth",
    highlight: "Measurable Growth",
    text: "Data-driven campaigns that bring more leads, sales, and higher ROI.",
    buttonLabel: "Get a Free Growth Audit",
    buttonLink: "/contact",
    badge: "+3.2x ROI",
    art: "Banner 1 artwork – laptop with ROI chart",
  },
  {
    label: "Social Media Marketing",
    headline: "Build a Stronger Brand & Community Online",
    highlight: "Brand",
    text: "Engaging content, consistent presence and campaigns that drive real business results.",
    buttonLabel: "Get a Free Growth Audit",
    buttonLink: "/contact",
    badge: "1.2K ♥",
    art: "Banner 2 artwork – phone with social icons",
  },
  {
    label: "Website Development",
    headline: "Websites That Turn Visitors Into Customers",
    highlight: "Customers",
    text: "Fast, modern, mobile-friendly websites built to turn more clicks into real business.",
    buttonLabel: "Get a Free Growth Audit",
    buttonLink: "/contact",
    badge: null,
    art: "Banner 3 artwork – laptop with website",
  },
];

export const brands = ["MedCure Hospitals", "Vertex Realty", "BrightLearn Academy", "ShopKart", "UrbanBites"];

export const stats = [
  { value: "100+", label: "Brands Served", icon: "users" },
  { value: "3.5x", label: "Avg. Lead Growth", icon: "trending-up" },
  { value: "₹50 Cr+", label: "Ad Spend Managed", icon: "coins" },
  { value: "98%", label: "Client Satisfaction", icon: "star" },
] as const;

export const services = [
  { title: "Performance Marketing", icon: "bar-chart", featured: true, shortDescription: "Drive qualified leads, sales and higher ROI.", body: "Google Ads, Meta Ads, LinkedIn Ads, YouTube Ads and Bing Ads campaigns managed for measurable returns." },
  { title: "Social Media Marketing", icon: "megaphone", featured: true, shortDescription: "Build brand awareness, engagement and conversions.", body: "Social media creatives, content, influencer collaborations and UGC campaigns that grow your community." },
  { title: "Website Development", icon: "code", featured: true, shortDescription: "Modern, fast and SEO-ready websites that convert visitors into customers.", body: "Corporate websites, landing pages, e-commerce websites and CRO & UX design." },
  { title: "SEO & GEO", icon: "search", featured: false, shortDescription: "Technical, local and content SEO plus AI search visibility.", body: "Technical SEO, local SEO, content SEO, AI search visibility and organic growth." },
  { title: "AI Automation", icon: "bot", featured: false, shortDescription: "AI workflows, customer journeys and marketing automations.", body: "AI workflows, customer journeys, marketing campaign automations and CRM integration." },
  { title: "Analytics & Attribution", icon: "line-chart", featured: false, shortDescription: "Clear tracking and reporting so every rupee is accounted for.", body: "GA4, GTM, Looker Studio, conversion tracking and marketing intelligence." },
  { title: "Strategy & Consulting", icon: "compass", featured: false, shortDescription: "Growth and go-to-market strategy backed by research.", body: "Growth strategy, GTM strategy, market research and competitor analysis." },
] as const;

export const industries = [
  { name: "Healthcare", icon: "heart-pulse", shortDescription: "Healthcare & Wellness" },
  { name: "Real Estate", icon: "building", shortDescription: "Real Estate" },
  { name: "Education", icon: "graduation-cap", shortDescription: "Education & EdTech" },
  { name: "BFSI", icon: "landmark", shortDescription: "Banking, Financial Services & Insurance" },
  { name: "Retail", icon: "shopping-cart", shortDescription: "Retail & E-commerce" },
  { name: "Manufacturing", icon: "factory", shortDescription: "Manufacturing & Industrial" },
  { name: "Hospitality", icon: "bed", shortDescription: "Hospitality & Lifestyle" },
  { name: "Startups", icon: "rocket", shortDescription: "Startups & Small Businesses" },
] as const;

export const whyItems = [
  { title: "AI-Driven Strategy", icon: "cpu" },
  { title: "Faster Execution", icon: "zap" },
  { title: "Outcome Focused", icon: "target" },
  { title: "Dedicated Growth Team", icon: "users-round" },
] as const;

export const caseStudies = [
  {
    title: "MedCure Hospitals",
    industry: "Healthcare",
    headline: "+32% Patient Enquiries in 90 Days",
    metrics: [{ value: "+32%", label: "Enquiries" }, { value: "-38%", label: "Cost per Lead" }, { value: "3.2x", label: "ROI" }],
    summary: "Sample case study: a multi-channel patient acquisition campaign for a hospital group.",
    cover: "Case study cover – hospital",
  },
  {
    title: "Vertex Realty",
    industry: "Real Estate",
    headline: "2.8x Qualified Leads at 42% Lower CPL",
    metrics: [{ value: "2.8x", label: "Leads" }, { value: "-42%", label: "CPL" }, { value: "3.1x", label: "ROI" }],
    summary: "Sample case study: lead generation for residential real estate projects.",
    cover: "Case study cover – real estate",
  },
  {
    title: "BrightLearn Academy",
    industry: "Education",
    headline: "+180% Admissions in One Academic Cycle",
    metrics: [{ value: "+180%", label: "Admissions" }, { value: "3.5x", label: "Lead Conversion" }, { value: "+68%", label: "Revenue" }],
    summary: "Sample case study: admissions campaign for an education institute.",
    cover: "Case study cover – education",
  },
];

export const testimonials = [
  { quote: "AdPulse helped us achieve 3.2x higher leads with a clear strategy and quick execution.", name: "Rohit Varma", role: "Founder", company: "Vertex Realty" },
  { quote: "A result-driven team that truly understands growth. Our admissions increased by 180% in one cycle.", name: "Priya Menon", role: "Marketing Head", company: "BrightLearn" },
];

export const contact = {
  phone: "+91 799 799 1225",
  whatsapp: "917997991225",
  email: "info@adpulsedigital.in",
  address: "Sy No: 11/32 & 11/33, 6th Floor, DGS Prime, Khanamet, Madhapur, Hyderabad, Telangana – 500081",
  hours: "Mon – Sat: 9:00 AM – 6:00 PM",
};

export const quickLinks = [
  { label: "Home", link: "/" },
  { label: "About Us", link: "/about" },
  { label: "Our Approach", link: "/about#approach" },
  { label: "Case Studies", link: "/case-studies" },
  { label: "Careers", link: "/careers" },
  { label: "Contact", link: "/contact" },
];

export const legalLinks = [
  { label: "Privacy Policy", link: "/privacy-policy" },
  { label: "Terms of Service", link: "/terms-of-service" },
  { label: "Cookie Policy", link: "/cookie-policy" },
];
