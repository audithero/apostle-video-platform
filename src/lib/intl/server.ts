import i18next, { type Language, languages } from "./i18n";

export async function getI18n(lng: Language) {
  if (!languages.includes(lng)) {
    lng = "en" as Language;
  }
  if (lng && i18next.resolvedLanguage !== lng) {
    await i18next.changeLanguage(lng);
  }

  return {
    t: i18next.getFixedT(lng),
    i18n: i18next,
  };
}
