export interface PageTemplate {
  id: string;
  name: string;
  icon: string;
  defaultSections: string[];
  description: string;
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  { id: 'home', name: 'Home', icon: '🏠', defaultSections: ['hero', 'about', 'tagline', 'services', 'gallery', 'reviews', 'contact', 'footer'], description: 'Main landing page' },
  { id: 'about', name: 'About Us', icon: '📝', defaultSections: ['hero', 'about', 'team', 'certs', 'testimonials', 'footer'], description: 'About the business' },
  { id: 'services', name: 'Services', icon: '🔧', defaultSections: ['hero', 'services', 'promos', 'faq', 'contact', 'footer'], description: 'Services and pricing' },
  { id: 'gallery', name: 'Gallery', icon: '📷', defaultSections: ['hero', 'gallery', 'before-after', 'testimonials', 'footer'], description: 'Photo showcase' },
  { id: 'contact', name: 'Contact', icon: '📞', defaultSections: ['hero', 'location', 'contact', 'contact-form', 'hours', 'footer'], description: 'Contact information' },
  { id: 'menu', name: 'Menu', icon: '🍽️', defaultSections: ['hero', 'services', 'promos', 'gallery', 'reviews', 'footer'], description: 'Menu / products' },
  { id: 'booking', name: 'Booking', icon: '📅', defaultSections: ['hero', 'services', 'team', 'testimonials', 'contact-form', 'footer'], description: 'Appointment booking' },
];

export interface SitePage {
  id: string;
  templateId: string;
  name: string;
  slug: string;
  data: Record<string, unknown>;
  sectionOrder: string[];
  sections: Record<string, boolean>;
  enabled: boolean;
}

export function getTemplateById(id: string): PageTemplate | undefined {
  return PAGE_TEMPLATES.find(t => t.id === id);
}

export function createPageFromTemplate(templateId: string, pageId: string): SitePage {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template "${templateId}" not found`);
  }

  return {
    id: pageId,
    templateId: template.id,
    name: template.name,
    slug: template.id === 'home' ? '/' : `/${template.id}`,
    data: {},
    sectionOrder: [...template.defaultSections],
    sections: Object.fromEntries(template.defaultSections.map(s => [s, true])),
    enabled: true,
  };
}

export function generatePageId(): string {
  return `page_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
