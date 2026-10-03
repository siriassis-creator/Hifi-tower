import { defaults } from "./default-content";
import { publicSupabase } from "./supabase-config";
import { contactChannels } from "./contact-channels";
import type { ContactChannel, HomeContent } from "./content-types";

const baseUrl = process.env.SUPABASE_URL || publicSupabase.url;
const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY || publicSupabase.publishableKey;

async function read<T>(table: string, query: string): Promise<T[]> {
  const response = await fetch(`${baseUrl}/rest/v1/${table}?${query}`, {
    headers: { apikey: publicKey },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`HiFi content request failed: ${table} (${response.status})`);
  const rows: unknown = await response.json();
  if (!Array.isArray(rows)) throw new Error(`Invalid HiFi content response: ${table}`);
  return rows as T[];
}

export async function getHomeContent(): Promise<HomeContent> {
  try {
    const [settings, brands, categories, navigation, marketing] = await Promise.all([
      read<HomeContent["settings"]>("hifi_site_settings", "select=*&id=eq.home"),
      read<HomeContent["brands"][number]>("hifi_brands", "select=slug,name,sort_order,published&published=eq.true&order=sort_order.asc"),
      read<HomeContent["categories"][number]>("hifi_categories", "select=slug,name,description,image_url,image_crop,href,sort_order,published&published=eq.true&order=sort_order.asc"),
      read<HomeContent["navigation"][number]>("hifi_navigation", "select=slug,label,href,sort_order,published&published=eq.true&order=sort_order.asc"),
      read<{ content: HomeContent["marketing"] }>("hifi_pages", "select=content&slug=eq.home-marketing&published=eq.true").catch(() => []),
    ]);
    if (!settings[0]) throw new Error("Missing HiFi home settings");
    return { settings: settings[0], brands, categories, navigation, marketing: marketing[0]?.content ?? defaults.marketing };
  } catch (error) {
    // Preserve the approved homepage during a temporary database outage.
    console.error("HiFi Tower is using its content snapshot", error instanceof Error ? error.message : "Unknown content error");
    return defaults;
  }
}

export function safeHref(value: string): string {
  if (value.startsWith("#") || (value.startsWith("/") && !value.startsWith("//"))) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch { /* Reject unsupported URLs. */ }
  return "#";
}

export function imageBackground(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? `url(${JSON.stringify(url.href)})` : undefined;
  } catch { return undefined; }
}

export async function getContactChannels(): Promise<ContactChannel[]> {
  try {
    const pages = await read<{ content: { channels: ContactChannel[] } }>("hifi_pages", "select=content&slug=eq.contact-channels&published=eq.true");
    const channels = pages[0]?.content.channels;
    if (!Array.isArray(channels) || channels.length !== 4) return contactChannels;
    return channels.map(channel => ({ ...channel, href: /^(https:\/\/|mailto:|tel:)/i.test(channel.href) ? channel.href : "#" }));
  } catch { return contactChannels; }
}
