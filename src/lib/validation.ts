import { z } from "zod";

export const EmailSchema = z.string().email("Invalid email address").max(255);

export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const SignupSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export const ResetPasswordSchema = z.object({
  email: EmailSchema,
  code: z.string().length(6, "Verification code must be 6 digits"),
  newPassword: PasswordSchema,
});

export const ContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: EmailSchema,
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

export const ScrapeSchema = z.object({
  url: z.string().url("Invalid URL").refine(
    (u) => u.includes("google.com/maps") || u.includes("goo.gl/maps") || u.includes("maps.app.goo.gl"),
    "URL must be a Google Maps link"
  ),
});

export const BulkImportSchema = z.object({
  urls: z
    .array(z.string().url("Invalid URL"))
    .min(1, "At least one URL required")
    .max(50, "Maximum 50 URLs per import"),
});

export const PlaceDataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  totalScore: z.number().optional(),
  reviewsCount: z.number().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  openingHours: z
    .array(
      z.object({
        day: z.string(),
        hours: z.string(),
      })
    )
    .optional(),
  reviews: z
    .array(
      z.object({
        text: z.string().optional(),
        stars: z.number().optional(),
        authorName: z.string().optional(),
      })
    )
    .optional(),
  photos: z.array(z.string()).optional(),
  url: z.string().optional(),
});

export const SiteCreateSchema = z.object({
  name: z.string().min(1, "Site name is required").max(100),
  description: z.string().max(500).optional(),
  placeData: PlaceDataSchema.optional(),
});

export const SiteUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  placeData: PlaceDataSchema.optional(),
});

export const PageCreateSchema = z.object({
  templateIds: z.array(z.string()).min(1, "At least one template required"),
});

export const PageUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(50000).optional(),
  templateId: z.string().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const UserProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: EmailSchema.optional(),
});

export const UserPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: PasswordSchema,
});

export const ThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color").optional(),
  fontFamily: z.string().max(100).optional(),
  borderRadius: z.string().max(20).optional(),
  preset: z.enum(["default", "ocean", "forest", "sunset", "minimal", "bold"]).optional(),
});

export const TrackingSchema = z.object({
  siteId: z.string().min(1, "Site ID is required"),
  pageId: z.string().optional(),
  event: z.string().min(1, "Event is required"),
  data: z.record(z.string(), z.unknown()).optional(),
  referrer: z.string().url().optional().or(z.literal("")),
  userAgent: z.string().max(500).optional(),
});

export const AnalyticsQuerySchema = z.object({
  siteId: z.string().min(1, "Site ID is required"),
  range: z.enum(["24h", "7d", "30d", "90d"]).optional().default("30d"),
});

export const UploadSchema = z.object({
  image: z.string().min(1, "Image data is required").refine(
    (s) => s.startsWith("data:image/"),
    "Invalid image format"
  ),
  filename: z.string().min(1, "Filename is required").max(200),
});

export const ExportSchema = z.object({
  html: z.string().min(1, "HTML content is required").max(500000),
});

export const AnalyticsPostSchema = z.object({
  siteId: z.string().min(1, "Site ID is required"),
  event: z.string().min(1, "Event is required"),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const UserProfileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  company: z.string().max(100).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

export const UserPreferencesSchema = z.object({
  darkMode: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  defaultTheme: z.string().max(50).optional(),
  layoutDensity: z.enum(["compact", "comfortable", "spacious"]).optional(),
  fontSize: z.enum(["small", "medium", "large", "xlarge"]).optional(),
  language: z.string().max(10).optional(),
});

export const VerifyConfirmSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export const SitePageCreateSchema = z.object({
  templateIds: z.array(z.string()).min(1, "At least one template required").max(3, "Maximum 3 pages at once"),
});

export const SitePageUpdateSchema = z.object({
  name: z.string().max(100).optional(),
  slug: z.string().max(100).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  sectionOrder: z.array(z.string()).optional(),
  sections: z.record(z.string(), z.unknown()).optional(),
  enabled: z.boolean().optional(),
});

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): { data: T; error?: never } | { data?: never; error: string } {
  const result = schema.safeParse(body);
  if (result.success) {
    return { data: result.data };
  }
  const errors = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  return { error: errors };
}
