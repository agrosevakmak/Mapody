import type { ApifyPlaceResult } from "./apify";

// ─── AI About Us Rewriter ───────────────────────────────────────────────────
export function rewriteAboutUs(data: ApifyPlaceResult): string {
  const name = data.name || "This business";
  const cat = data.category || "business";
  const desc = data.description || "";
  const rating = data.rating || 0;
  const reviews = data.totalReviews || 0;
  const addr = data.address || "";
  const hours = data.openingHours || {};
  const isOpen = Object.keys(hours).length > 0;

  const templates = [
    `${name} is a trusted ${cat.toLowerCase()} located in ${addr.split(",").slice(-2).join(",") || "the community"}. ${desc ? `With a focus on quality, ${desc.toLowerCase().slice(0, 100)}` : "Dedicated to serving customers with excellence"}. ${rating >= 4 ? `Rated ${rating}/5 stars by ${reviews}+ happy customers` : `Serving the community with pride`}. ${isOpen ? "Open and ready to serve you" : "Visit us to experience the difference"}.`,
    `Welcome to ${name} — your neighborhood ${cat.toLowerCase()}${addr ? ` at ${addr}` : ""}. ${desc || `We pride ourselves on delivering exceptional service and quality products`}. ${rating >= 4 ? `Our ${rating}-star rating from ${reviews} reviews speaks for itself` : `Join our growing family of satisfied customers`}. We look forward to serving you.`,
    `At ${name}, we believe in ${cat.toLowerCase() === "restaurant" ? "serving fresh, delicious food" : cat.toLowerCase() === "salon" ? "helping you look and feel your best" : cat.toLowerCase() === "gym" ? "helping you achieve your fitness goals" : "providing outstanding service"}. ${desc ? desc.slice(0, 150) : `Located${addr ? ` at ${addr}` : " in the heart of the community"}, we're committed to your satisfaction`}. ${rating >= 4.5 ? `With ${reviews} five-star reviews, our reputation speaks volumes` : ""}.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

// ─── AI Tagline Generator ───────────────────────────────────────────────────
export function generateTagline(data: ApifyPlaceResult): string {
  const cat = (data.category || "").toLowerCase();
  const name = data.name || "We";
  const rating = data.rating || 0;
  const price = data.priceRange || "";

  const taglinesByCategory: Record<string, string[]> = {
    restaurant: ["Where Every Meal Becomes a Memory", "Fresh Ingredients, Bold Flavors", "Taste the Difference", "Dine Well, Live Well", "From Our Kitchen to Your Table"],
    cafe: ["Your Daily Cup of Excellence", "Sip, Savor, Repeat", "Brewing Happiness Since Day One", "Coffee Done Right", "Where Every Cup Tells a Story"],
    "coffee shop": ["Your Daily Cup of Excellence", "Sip, Savor, Repeat", "Brewing Happiness", "Coffee Done Right"],
    salon: ["Look Good, Feel Great", "Style Meets Expertise", "Your Look, Our Passion", "Beauty Redefined", "Where Confidence Begins"],
    gym: ["Strength Starts Here", "Push Your Limits", "Transform Your Life", "Fitness Redefined", "Your Goals, Our Mission"],
    hotel: ["Your Home Away From Home", "Stay in Comfort", "Experience Hospitality", "Where Every Stay Counts", "Rest, Relax, Recharge"],
    store: ["Shop with Confidence", "Quality You Can Trust", "Find What You Love", "Your One-Stop Shop", "Deals That Delight"],
    clinic: ["Your Health, Our Priority", "Caring for You", "Wellness Starts Here", "Expert Care, Compassionate Service", "Healing with Heart"],
    "fitness center": ["Strength Starts Here", "Push Your Limits", "Transform Your Life"],
    beauty: ["Glow From Within", "Beauty Expertise", "Radiance Awaits"],
    spa: ["Relax. Refresh. Renew.", "Pamper Yourself", "Serenity Awaits", "Escape the Everyday"],
  };

  const generic = ["Quality You Can Trust", "Excellence in Every Detail", "Serving You Better", "Your Satisfaction, Our Mission", "Experience the Difference"];

  let pool = taglinesByCategory[cat] || generic;

  if (rating >= 4.5) pool = [...pool, "5-Star Experience Awaits", "Rated Top in the Area"];
  if (price === "$" || price === "$$") pool = [...pool, "Great Value, Great Experience", "Affordable Excellence"];
  if (price === "$$$" || price === "$$$$") pool = [...pool, "Premium Experience", "Luxury Redefined"];

  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Review Sentiment Analysis ───────────────────────────────────────────────
export interface SentimentResult {
  overall: "positive" | "neutral" | "negative";
  score: number;
  highlights: string[];
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
}

const positiveWords = ["great", "excellent", "amazing", "love", "best", "fantastic", "wonderful", "perfect", "awesome", "outstanding", "superb", "brilliant", "delicious", "friendly", "clean", "fast", "helpful", "recommend", "beautiful", "impressed", "quality", "fresh", "professional", "comfortable", "pleasant", "exceptional", "top-notch", "phenomenal", "incredible", "satisfied"];
const negativeWords = ["bad", "terrible", "worst", "hate", "poor", "awful", "horrible", "dirty", "slow", "rude", "expensive", "overpriced", "disappointing", "mediocre", "cold", "stale", "loud", "crowded", "wait", "problem", "complaint", "never", "waste", "broken", "unfriendly"];

export function analyzeSentiment(data: ApifyPlaceResult): SentimentResult {
  const reviews = data.reviews || [];
  if (reviews.length === 0) {
    return { overall: "neutral", score: 0.5, highlights: [], sentimentBreakdown: { positive: 0, neutral: 0, negative: 0 } };
  }

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;
  const wordCounts: Record<string, number> = {};

  for (const review of reviews) {
    const text = (review.text || "").toLowerCase();
    const words = text.split(/\s+/);
    let reviewScore = 0;

    for (const word of words) {
      const clean = word.replace(/[^a-z]/g, "");
      if (positiveWords.includes(clean)) {
        reviewScore++;
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
      if (negativeWords.includes(clean)) {
        reviewScore--;
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    }

    if (reviewScore > 0) positiveCount++;
    else if (reviewScore < 0) negativeCount++;
    else neutralCount++;
  }

  const total = reviews.length;
  const score = (positiveCount / total);
  const highlights = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  return {
    overall: score >= 0.6 ? "positive" : score >= 0.4 ? "neutral" : "negative",
    score,
    highlights,
    sentimentBreakdown: { positive: positiveCount, neutral: neutralCount, negative: negativeCount },
  };
}

// ─── AI FAQ Generator ───────────────────────────────────────────────────────
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQ(data: ApifyPlaceResult): FAQItem[] {
  const faqs: FAQItem[] = [];
  const name = data.name || "We";
  const cat = (data.category || "").toLowerCase();
  const hours = data.openingHours || {};
  const rating = data.rating || 0;
  const reviews = data.totalReviews || 0;
  const price = data.priceRange || "";

  if (Object.keys(hours).length > 0) {
    const weekday = hours.Monday || hours.monday || "";
    const weekend = hours.Saturday || hours.saturday || "";
    if (weekday) faqs.push({ question: "What are your hours?", answer: `${name} is open ${weekday} on weekdays${weekend ? ` and ${weekend} on weekends` : ""}.` });
  }

  if (data.phone) faqs.push({ question: "How can I contact you?", answer: `You can reach ${name} by phone at ${data.phone}${data.website ? ` or visit our website at ${data.website}` : ""}.` });
  if (data.address) faqs.push({ question: "Where are you located?", answer: `${name} is located at ${data.address}.` });
  if (rating > 0) faqs.push({ question: "What do customers say?", answer: `${name} has a ${rating}/5 star rating from ${reviews} reviews. Customers especially love our quality and service.` });

  if (cat.includes("restaurant") || cat.includes("cafe") || cat.includes("coffee")) {
    faqs.push({ question: "Do you offer takeout?", answer: `Yes, ${name} offers takeout. Call ahead to place your order.` });
    if (price) faqs.push({ question: "What are your prices like?", answer: `${name} has a price range of ${price}. We offer great value for the quality we provide.` });
  }

  if (cat.includes("salon") || cat.includes("spa") || cat.includes("beauty")) {
    faqs.push({ question: "Do I need an appointment?", answer: `We recommend booking an appointment at ${name} for the best experience, though walk-ins are welcome when available.` });
  }

  if (cat.includes("gym") || cat.includes("fitness")) {
    faqs.push({ question: "Do you offer a trial?", answer: `${name} offers trial memberships. Contact us to learn about our current promotions.` });
  }

  if (faqs.length < 5) {
    faqs.push({ question: `Why choose ${name}?`, answer: `With ${rating > 0 ? `a ${rating}-star rating and ` : ""}a commitment to excellence, ${name} stands out for quality service and customer satisfaction.` });
    faqs.push({ question: "Do you have parking?", answer: `${name} offers parking for our customers. Check our location page for details.` });
  }

  return faqs.slice(0, 8);
}

// ─── AI Alt-Text Generator ──────────────────────────────────────────────────
export function generateAltText(data: ApifyPlaceResult, imageIndex: number): string {
  const name = data.name || "Business";
  const cat = (data.category || "").toLowerCase();

  const contexts: Record<string, string[]> = {
    restaurant: ["Interior dining area", "Delicious food plating", "Cozy seating area", "Kitchen in action", "Fresh ingredients", "Bar and beverages"],
    cafe: ["Coffee being prepared", "Cozy cafe interior", "Pastry display", "Latte art", "Outdoor seating", "Morning rush"],
    salon: ["Modern salon interior", "Styling station", "Hair products display", "Waiting area", "Treatment room", "Stylist at work"],
    gym: ["Equipment floor", "Group fitness class", "Training area", "Reception desk", "Cardio zone", "Weight room"],
    hotel: ["Lobby and reception", "Guest room interior", "Pool area", "Restaurant dining", "Conference room", "Garden view"],
    store: ["Storefront entrance", "Product display", "Interior layout", "Checkout counter", "Featured products", "Window display"],
  };

  const pool = contexts[cat] || ["Business exterior", "Interior view", "Products and services", "Customer area", "Main entrance", "Service area"];
  const context = pool[imageIndex % pool.length];

  return `${name} - ${context}. ${name} is a ${cat || "local business"} committed to quality.`;
}

// ─── Favicon Generator ──────────────────────────────────────────────────────
export function generateFaviconSVG(name: string, color: string = "#4361ee"): string {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="6" fill="${color}"/>
    <text x="16" y="22" font-family="system-ui,sans-serif" font-size="16" font-weight="700" fill="white" text-anchor="middle">${initials}</text>
  </svg>`;
}

// ─── Font Pairings ──────────────────────────────────────────────────────────
export const FONT_PAIRINGS = [
  { id: "inter-system", name: "Clean Modern", heading: "Inter", body: "Inter", headingWeight: "700", css: "'Inter', system-ui, sans-serif" },
  { id: "playfair-source", name: "Elegant Serif", heading: "Playfair Display", body: "Source Sans 3", headingWeight: "700", css: "'Playfair Display', Georgia, serif" },
  { id: "poppins-roboto", name: "Friendly Tech", heading: "Poppins", body: "Roboto", headingWeight: "600", css: "'Poppins', sans-serif" },
  { id: "montserrat-open", name: "Professional", heading: "Montserrat", body: "Open Sans", headingWeight: "600", css: "'Montserrat', sans-serif" },
  { id: "raleway-lato", name: "Modern Minimal", heading: "Raleway", body: "Lato", headingWeight: "600", css: "'Raleway', sans-serif" },
  { id: "dm-serif-work", name: "Editorial", heading: "DM Serif Display", body: "Work Sans", headingWeight: "400", css: "'DM Serif Display', serif" },
  { id: "space-grotesk", name: "Geometric", heading: "Space Grotesk", body: "Space Grotesk", headingWeight: "600", css: "'Space Grotesk', monospace" },
  { id: "crimson-source", name: "Classic", heading: "Crimson Pro", body: "Source Sans 3", headingWeight: "600", css: "'Crimson Pro', serif" },
] as const;

export type FontPairingId = (typeof FONT_PAIRINGS)[number]["id"];

// ─── Background Patterns ────────────────────────────────────────────────────
export const BACKGROUND_PATTERNS = [
  { id: "none", name: "None", css: "" },
  { id: "dots", name: "Dots", css: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)" },
  { id: "lines", name: "Lines", css: "repeating-linear-gradient(0deg, transparent, transparent 20px, #e2e8f0 20px, #e2e8f0 21px)" },
  { id: "grid", name: "Grid", css: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)" },
  { id: "diagonal", name: "Diagonal", css: "repeating-linear-gradient(45deg, transparent, transparent 10px, #e2e8f0 10px, #e2e8f0 11px)" },
  { id: "zigzag", name: "Zigzag", css: "linear-gradient(135deg, #e2e8f0 25%, transparent 25%) -50px 0, linear-gradient(225deg, #e2e8f0 25%, transparent 25%) -50px 0" },
  { id: "waves", name: "Waves", css: "radial-gradient(circle at 100% 50%, transparent 20%, #e2e8f0 21%, #e2e8f0 34%, transparent 35%, transparent)" },
  { id: "cross", name: "Crosses", css: "linear-gradient(#e2e8f0 2px, transparent 2px), linear-gradient(90deg, #e2e8f0 2px, transparent 2px)" },
] as const;

// ─── Entrance Animations ────────────────────────────────────────────────────
export const ENTRANCE_ANIMATIONS = [
  { id: "none", name: "None", css: "" },
  { id: "fade-up", name: "Fade Up", css: "opacity-0 translateY(20px) -> opacity-1 translateY(0)" },
  { id: "fade-in", name: "Fade In", css: "opacity-0 -> opacity-1" },
  { id: "slide-left", name: "Slide from Left", css: "translateX(-30px) opacity-0 -> translateX(0) opacity-1" },
  { id: "slide-right", name: "Slide from Right", css: "translateX(30px) opacity-0 -> translateX(0) opacity-1" },
  { id: "zoom-in", name: "Zoom In", css: "scale(0.9) opacity-0 -> scale(1) opacity-1" },
  { id: "bounce", name: "Bounce In", css: "scale(0.3) opacity-0 -> scale(1) opacity-1" },
] as const;

// ─── Section Definitions (all 22 sections) ──────────────────────────────────
export const ALL_SECTIONS = [
  { id: "hero", name: "Hero", icon: "🏠" },
  { id: "about", name: "About Us", icon: "📝" },
  { id: "tagline", name: "Tagline", icon: "💬" },
  { id: "hours", name: "Hours", icon: "🕐" },
  { id: "gallery", name: "Gallery", icon: "📷" },
  { id: "reviews", name: "Reviews", icon: "⭐" },
  { id: "sentiment", name: "Sentiment Highlights", icon: "🎯" },
  { id: "services", name: "Services", icon: "🔧" },
  { id: "faq", name: "FAQ", icon: "❓" },
  { id: "promos", name: "Specials & Promotions", icon: "🎉" },
  { id: "team", name: "Team & Staff", icon: "👥" },
  { id: "certs", name: "Certifications & Awards", icon: "🏆" },
  { id: "before-after", name: "Before & After", icon: "🔄" },
  { id: "testimonials", name: "Testimonials", icon: "💬" },
  { id: "area", name: "Area Served", icon: "📍" },
  { id: "parking", name: "Parking & Accessibility", icon: "♿" },
  { id: "badges", name: "Pet & Family Friendly", icon: "🐾" },
  { id: "location", name: "Location Map", icon: "🗺️" },
  { id: "contact", name: "Contact", icon: "📞" },
  { id: "contact-form", name: "Contact Form", icon: "✉️" },
  { id: "multi-location", name: "All Locations", icon: "🏢" },
  { id: "footer", name: "Footer", icon: "📎" },
] as const;

export type SectionId = (typeof ALL_SECTIONS)[number]["id"];

// ─── Shared Types ───────────────────────────────────────────────────────────
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  expiryDate: string;
  active: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  icon: string;
}

export interface BeforeAfterItem {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  caption: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  source: string;
}
