/** How a club looks to players (block52-club#39), as the club service sends it. */
export interface ClubLook {
    logo: string | null;
    primaryColor: string | null;
    accentColor: string | null;
    felt: string;
    cardBack: string;
    language: string;
    socials: string[];
    /** Table radio stations the club chose (block52-club#46). */
    radio: { name: string; url: string }[];
}

/**
 * The service only passes https links and real colours, but these go straight
 * into the page, so the lobby checks again rather than trust another server.
 */
const isHttps = (v: unknown): v is string => typeof v === "string" && /^https:\/\/[^\s"'<>]+$/.test(v);
const isColor = (v: unknown): v is string => typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v);

export function safeLook(raw: Partial<ClubLook> | null | undefined): ClubLook | null {
    if (!raw) return null;
    const named = raw.cardBack === "default" || raw.cardBack === "block52" || raw.cardBack === "custom" || raw.cardBack === "legacy";
    return {
        logo: isHttps(raw.logo) ? raw.logo : null,
        primaryColor: isColor(raw.primaryColor) ? raw.primaryColor : null,
        accentColor: isColor(raw.accentColor) ? raw.accentColor : null,
        felt: raw.felt === "dark" || raw.felt === "logo" ? raw.felt : "classic",
        cardBack: named || isHttps(raw.cardBack) ? (raw.cardBack as string) : "default",
        language: typeof raw.language === "string" ? raw.language : "en",
        socials: Array.isArray(raw.socials) ? raw.socials.filter(isHttps) : [],
        radio: Array.isArray(raw.radio) ? raw.radio.filter(s => s && typeof s.name === "string" && s.name.trim() && isHttps(s.url)).slice(0, 6).map(s => ({ name: s.name.slice(0, 40), url: s.url })) : []
    };
}

/** The table style a club's felt choice maps to. A player can still switch it themselves. */
export const tableStyleFor = (felt: string): "classic" | "modern" => (felt === "classic" ? "classic" : "modern");

/** A social link's short name, from its address. */
export const socialLabel = (url: string): string => {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "t.me" || host.endsWith("telegram.org")) return "Telegram";
    if (host === "x.com" || host === "twitter.com") return "X";
    if (host.endsWith("discord.gg") || host.endsWith("discord.com")) return "Discord";
    return host;
};
