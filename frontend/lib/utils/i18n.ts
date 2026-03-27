import type { Lang, CopyPair } from "@/lib/types/i18n";

export function t(copy: CopyPair, lang: Lang) {
  return copy[lang];
}

export function isRTL(lang: Lang) {
  return lang === "ar";
}
