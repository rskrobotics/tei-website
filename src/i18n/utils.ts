import pl from "./pl.json";
import en from "./en.json";

export const ui = {
  pl,
  en,
} as const;

export type Language = keyof typeof ui;

export function useTranslations(lang: Language) {
  return function t(key: string): string {
    const keys = key.split(".");
    let value: any = ui[lang];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key;
  };
}
