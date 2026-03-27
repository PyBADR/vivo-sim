import type { Lang, CopyPair } from "@/lib/types/i18n";

/**
 * Resolve a bilingual copy pair to the active language.
 * Falls back to English if the requested language key is missing.
 */
export function t(copy: CopyPair, lang: Lang): string {
  return copy[lang] ?? copy.en;
}

/**
 * Returns true when the active language is right-to-left.
 */
export function isRTL(lang: Lang): boolean {
  return lang === "ar";
}

/**
 * Returns the dir attribute value for the active language.
 */
export function dir(lang: Lang): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}

/**
 * Simple template interpolation for copy strings.
 * Replaces {key} tokens with values from the params object.
 *
 * Example: interpolate("Affects {count} systems", { count: "5" }) → "Affects 5 systems"
 */
export function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    template,
  );
}
