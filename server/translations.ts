import { overwriteInjectionTarget, TranslationStore } from "framework";
import { TranslationEntity } from "../framework/tools/translations/translation.entity.ts";

const data = [
  { key: "name", code: "de", text: "Name" },
  { key: "name", code: "en", text: "Name" },
  { key: "email", code: "de", text: "Email" },
  { key: "email", code: "en", text: "Email" },
  { key: "password", code: "de", text: "Passwort" },
  { key: "password", code: "en", text: "Password" },
  { key: "password_repeat", code: "de", text: "Passwort wiederholen" },
  { key: "password_repeat", code: "en", text: "repeat Password" },
  { key: "register", code: "de", text: "Registrieren" },
  { key: "register", code: "en", text: "Register" },
  { key: "login", code: "de", text: "Anmelden" },
  { key: "login", code: "en", text: "Login" },
  { key: "login_data", code: "de", text: "Anmeldedaten" },
  { key: "login_data", code: "en", text: "Logindata" },
];

export const TRANSLATION_STORE_TOKEN = "_translations_";

export async function setupTranslations() {
  const store = new TranslationStore(true);
  overwriteInjectionTarget(TRANSLATION_STORE_TOKEN, store);
  await store.saveTranslations(
    data.map((d) => {
      const entity = new TranslationEntity();
      entity.key = d.key;
      entity.code = d.code;
      entity.text = d.text;
      return entity;
    })
  );
}
