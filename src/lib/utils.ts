import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateSubdomain(name: string): string {
  const base = slugify(name).slice(0, 30);
  const suffix = crypto.randomBytes(4).toString("hex");
  return `${base}-${suffix}`;
}

export function formatHours(hours: Record<string, string> | null | undefined) {
  if (!hours) return [];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days.map((day) => ({
    day,
    hours: hours[day] || hours[day.toLowerCase()] || "Closed",
  }));
}

export function isOpenNow(hours: Record<string, string> | null | undefined): boolean | null {
  if (!hours) return null;
  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = dayNames[now.getDay()];
  const todayHours = hours[today] || hours[today.toLowerCase()];
  if (!todayHours || todayHours === "Closed") return false;
  const [timeRange] = todayHours.split(",").map((s) => s.trim());
  if (!timeRange) return false;
  const match = timeRange.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  const [_, openH, openM, openAMPM, closeH, closeM, closeAMPM] = match;
  const openMinutes = toMinutes(parseInt(openH), parseInt(openM), openAMPM.toUpperCase() === "PM");
  const closeMinutes = toMinutes(parseInt(closeH), parseInt(closeM), closeAMPM.toUpperCase() === "PM");
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

function toMinutes(h: number, m: number, pm: boolean): number {
  if (h === 12) h = 0;
  if (pm) h += 12;
  return h * 60 + m;
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function getGoogleMapsEmbedUrl(lat: number, lng: number): string {
  const key = process.env.GOOGLE_MAPS_API_KEY || "";
  return `https://www.google.com/maps/embed/v1/view?key=${key}&center=${lat},${lng}&zoom=15`;
}

export const THEMES = {
  "modern-light": {
    name: "Modern Light",
    primary: "bg-white",
    text: "text-gray-900",
    accent: "text-mapody-600",
    accentBg: "bg-mapody-600",
    accentHover: "hover:bg-mapody-700",
    sectionBg: "bg-gray-50",
    cardBg: "bg-white",
    border: "border-gray-200",
    heading: "text-gray-900",
    body: "text-gray-600",
    btn: "bg-mapody-600 text-white hover:bg-mapody-700",
    btnOutline: "border-mapody-600 text-mapody-600 hover:bg-mapody-50",
    star: "text-yellow-400",
    font: "font-sans",
  },
  "modern-dark": {
    name: "Modern Dark",
    primary: "bg-gray-900",
    text: "text-gray-100",
    accent: "text-mapody-400",
    accentBg: "bg-mapody-500",
    accentHover: "hover:bg-mapody-600",
    sectionBg: "bg-gray-800",
    cardBg: "bg-gray-800",
    border: "border-gray-700",
    heading: "text-white",
    body: "text-gray-300",
    btn: "bg-mapody-500 text-white hover:bg-mapody-600",
    btnOutline: "border-mapody-500 text-mapody-400 hover:bg-gray-800",
    star: "text-yellow-400",
    font: "font-sans",
  },
  "clean-white": {
    name: "Clean White",
    primary: "bg-white",
    text: "text-gray-800",
    accent: "text-emerald-600",
    accentBg: "bg-emerald-600",
    accentHover: "hover:bg-emerald-700",
    sectionBg: "bg-gray-50",
    cardBg: "bg-white",
    border: "border-gray-200",
    heading: "text-gray-900",
    body: "text-gray-600",
    btn: "bg-emerald-600 text-white hover:bg-emerald-700",
    btnOutline: "border-emerald-600 text-emerald-600 hover:bg-emerald-50",
    star: "text-yellow-500",
    font: "font-sans",
  },
  "warm-earth": {
    name: "Warm Earthy",
    primary: "bg-amber-50",
    text: "text-stone-800",
    accent: "text-orange-600",
    accentBg: "bg-orange-600",
    accentHover: "hover:bg-orange-700",
    sectionBg: "bg-amber-50/50",
    cardBg: "bg-white",
    border: "border-stone-200",
    heading: "text-stone-900",
    body: "text-stone-600",
    btn: "bg-orange-600 text-white hover:bg-orange-700",
    btnOutline: "border-orange-600 text-orange-600 hover:bg-orange-50",
    star: "text-amber-400",
    font: "font-serif",
  },
  "bold-accent": {
    name: "Bold Accent",
    primary: "bg-white",
    text: "text-gray-900",
    accent: "text-violet-600",
    accentBg: "bg-violet-600",
    accentHover: "hover:bg-violet-700",
    sectionBg: "bg-violet-50",
    cardBg: "bg-white",
    border: "border-violet-100",
    heading: "text-gray-900",
    body: "text-gray-600",
    btn: "bg-violet-600 text-white hover:bg-violet-700",
    btnOutline: "border-violet-600 text-violet-600 hover:bg-violet-50",
    star: "text-yellow-400",
    font: "font-sans",
  },
} as const;

export type ThemeKey = keyof typeof THEMES;
