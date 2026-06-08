"use client";

import { create } from "zustand";
import type { ApifyPlaceResult } from "@/lib/apify";
import type { ThemeKey } from "@/lib/utils";
import type { FontPairingId, SectionId } from "@/lib/ai";
import type { SentimentResult, FAQItem } from "@/lib/ai";

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

interface SiteData {
  scrapedData: ApifyPlaceResult | null;
  editedData: Partial<ApifyPlaceResult>;
  theme: ThemeKey;
  sectionOrder: SectionId[];
  sections: Record<string, { enabled: boolean }>;
  logo: string | null;
  ctaLabel: string;
  ctaUrl: string;
  siteId: string | null;
  subdomain: string | null;
  status: "draft" | "published";
  // AI features
  aiAbout: string;
  aiTagline: string;
  sentiment: SentimentResult | null;
  faqs: FAQItem[];
  // Customization
  fontPairing: FontPairingId;
  customColors: { primary: string; secondary: string; accent: string; bg: string; text: string };
  stickyHeader: boolean;
  darkMode: boolean;
  backgroundPattern: string;
  entranceAnimation: string;
  favicon: string;
  // New sections
  teamMembers: TeamMember[];
  promotions: Promotion[];
  certifications: Certification[];
  beforeAfter: BeforeAfterItem[];
  testimonials: Testimonial[];
  areaServed: string[];
  parkingInfo: string;
  accessibilityInfo: string;
  petFriendly: boolean;
  familyFriendly: boolean;
  // Multi-location
  parentId: string | null;
  childLocations: string[];
}

interface EditorStore extends SiteData {
  setScrapedData: (data: ApifyPlaceResult) => void;
  setEditedData: (data: Partial<ApifyPlaceResult>) => void;
  updateField: (field: string, value: string) => void;
  setTheme: (theme: ThemeKey) => void;
  setSectionOrder: (order: SectionId[]) => void;
  moveSection: (from: number, to: number) => void;
  toggleSection: (section: string) => void;
  setLogo: (url: string | null) => void;
  setCtaLabel: (label: string) => void;
  setCtaUrl: (url: string) => void;
  setSiteId: (id: string) => void;
  setSubdomain: (subdomain: string) => void;
  setStatus: (status: "draft" | "published") => void;
  setAiAbout: (text: string) => void;
  setAiTagline: (text: string) => void;
  setSentiment: (s: SentimentResult) => void;
  setFaqs: (faqs: FAQItem[]) => void;
  setFontPairing: (fp: FontPairingId) => void;
  setCustomColors: (c: Partial<SiteData["customColors"]>) => void;
  setStickyHeader: (v: boolean) => void;
  setDarkMode: (v: boolean) => void;
  setBackgroundPattern: (p: string) => void;
  setEntranceAnimation: (a: string) => void;
  setFavicon: (f: string) => void;
  setTeamMembers: (m: TeamMember[]) => void;
  addTeamMember: (m: TeamMember) => void;
  removeTeamMember: (id: string) => void;
  setPromotions: (p: Promotion[]) => void;
  addPromotion: (p: Promotion) => void;
  removePromotion: (id: string) => void;
  setCertifications: (c: Certification[]) => void;
  addCertification: (c: Certification) => void;
  removeCertification: (id: string) => void;
  setBeforeAfter: (b: BeforeAfterItem[]) => void;
  addBeforeAfter: (b: BeforeAfterItem) => void;
  removeBeforeAfter: (id: string) => void;
  setTestimonials: (t: Testimonial[]) => void;
  addTestimonial: (t: Testimonial) => void;
  removeTestimonial: (id: string) => void;
  setAreaServed: (a: string[]) => void;
  addAreaServed: (a: string) => void;
  removeAreaServed: (a: string) => void;
  setParkingInfo: (p: string) => void;
  setAccessibilityInfo: (a: string) => void;
  setPetFriendly: (v: boolean) => void;
  setFamilyFriendly: (v: boolean) => void;
  setParentId: (id: string | null) => void;
  setChildLocations: (c: string[]) => void;
  reset: () => void;
  getCurrentData: () => ApifyPlaceResult;
}

const defaultSections: Record<SectionId, { enabled: boolean }> = {
  hero: { enabled: true }, about: { enabled: true }, tagline: { enabled: true },
  hours: { enabled: true }, gallery: { enabled: true }, reviews: { enabled: true },
  sentiment: { enabled: true }, services: { enabled: true }, faq: { enabled: true },
  promos: { enabled: false }, team: { enabled: false }, certs: { enabled: false },
  "before-after": { enabled: false }, testimonials: { enabled: false }, area: { enabled: false },
  parking: { enabled: false }, badges: { enabled: true }, location: { enabled: true },
  contact: { enabled: true }, "contact-form": { enabled: true }, "multi-location": { enabled: false }, footer: { enabled: true },
};

const defaultSectionOrder: SectionId[] = [
  "hero", "tagline", "about", "sentiment", "hours", "gallery", "reviews",
  "services", "faq", "promos", "team", "certs", "before-after", "testimonials",
  "area", "parking", "badges", "location", "contact", "contact-form", "multi-location", "footer",
];

const initialState: SiteData = {
  scrapedData: null,
  editedData: {},
  theme: "modern-light",
  sectionOrder: [...defaultSectionOrder],
  sections: { ...defaultSections },
  logo: null,
  ctaLabel: "Get Directions",
  ctaUrl: "",
  siteId: null,
  subdomain: null,
  status: "draft",
  aiAbout: "",
  aiTagline: "",
  sentiment: null,
  faqs: [],
  fontPairing: "inter-system",
  customColors: { primary: "#4361ee", secondary: "#1a1a2e", accent: "#6c8cff", bg: "#ffffff", text: "#0f172a" },
  stickyHeader: true,
  darkMode: false,
  backgroundPattern: "none",
  entranceAnimation: "fade-up",
  favicon: "",
  teamMembers: [],
  promotions: [],
  certifications: [],
  beforeAfter: [],
  testimonials: [],
  areaServed: [],
  parkingInfo: "",
  accessibilityInfo: "",
  petFriendly: false,
  familyFriendly: false,
  parentId: null,
  childLocations: [],
};

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setScrapedData: (data) => set({ scrapedData: data, editedData: {} }),
  setEditedData: (data) => set({ editedData: data }),
  updateField: (field, value) => set((s) => ({ editedData: { ...s.editedData, [field]: value } })),
  setTheme: (theme) => set({ theme }),
  setSectionOrder: (order) => set({ sectionOrder: order }),
  moveSection: (from, to) => set((s) => {
    const order = [...s.sectionOrder];
    const [item] = order.splice(from, 1);
    order.splice(to, 0, item);
    return { sectionOrder: order };
  }),
  toggleSection: (section) => set((s) => ({
    sections: { ...s.sections, [section]: { enabled: !s.sections[section]?.enabled } },
  })),
  setLogo: (url) => set({ logo: url }),
  setCtaLabel: (label) => set({ ctaLabel: label }),
  setCtaUrl: (url) => set({ ctaUrl: url }),
  setSiteId: (id) => set({ siteId: id }),
  setSubdomain: (subdomain) => set({ subdomain }),
  setStatus: (status) => set({ status }),
  setAiAbout: (text) => set({ aiAbout: text }),
  setAiTagline: (text) => set({ aiTagline: text }),
  setSentiment: (s) => set({ sentiment: s }),
  setFaqs: (faqs) => set({ faqs }),
  setFontPairing: (fp) => set({ fontPairing: fp }),
  setCustomColors: (c) => set((s) => ({ customColors: { ...s.customColors, ...c } })),
  setStickyHeader: (v) => set({ stickyHeader: v }),
  setDarkMode: (v) => set({ darkMode: v }),
  setBackgroundPattern: (p) => set({ backgroundPattern: p }),
  setEntranceAnimation: (a) => set({ entranceAnimation: a }),
  setFavicon: (f) => set({ favicon: f }),
  setTeamMembers: (m) => set({ teamMembers: m }),
  addTeamMember: (m) => set((s) => ({ teamMembers: [...s.teamMembers, m] })),
  removeTeamMember: (id) => set((s) => ({ teamMembers: s.teamMembers.filter((m) => m.id !== id) })),
  setPromotions: (p) => set({ promotions: p }),
  addPromotion: (p) => set((s) => ({ promotions: [...s.promotions, p] })),
  removePromotion: (id) => set((s) => ({ promotions: s.promotions.filter((p) => p.id !== id) })),
  setCertifications: (c) => set({ certifications: c }),
  addCertification: (c) => set((s) => ({ certifications: [...s.certifications, c] })),
  removeCertification: (id) => set((s) => ({ certifications: s.certifications.filter((c) => c.id !== id) })),
  setBeforeAfter: (b) => set({ beforeAfter: b }),
  addBeforeAfter: (b) => set((s) => ({ beforeAfter: [...s.beforeAfter, b] })),
  removeBeforeAfter: (id) => set((s) => ({ beforeAfter: s.beforeAfter.filter((b) => b.id !== id) })),
  setTestimonials: (t) => set({ testimonials: t }),
  addTestimonial: (t) => set((s) => ({ testimonials: [...s.testimonials, t] })),
  removeTestimonial: (id) => set((s) => ({ testimonials: s.testimonials.filter((t) => t.id !== id) })),
  setAreaServed: (a) => set({ areaServed: a }),
  addAreaServed: (a) => set((s) => ({ areaServed: [...s.areaServed, a] })),
  removeAreaServed: (a) => set((s) => ({ areaServed: s.areaServed.filter((x) => x !== a) })),
  setParkingInfo: (p) => set({ parkingInfo: p }),
  setAccessibilityInfo: (a) => set({ accessibilityInfo: a }),
  setPetFriendly: (v) => set({ petFriendly: v }),
  setFamilyFriendly: (v) => set({ familyFriendly: v }),
  setParentId: (id) => set({ parentId: id }),
  setChildLocations: (c) => set({ childLocations: c }),
  reset: () => set(initialState),
  getCurrentData: () => {
    const s = get();
    return { ...s.scrapedData, ...s.editedData } as ApifyPlaceResult;
  },
}));
