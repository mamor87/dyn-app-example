import { Store } from "framework";
import { TranslationEntity } from "./translation.entity.ts";

type TranslationData = { [key: string]: string };

export class TranslationStore extends Store {
  private readonly cache: Record<string, TranslationEntity> = {};

  constructor(reset = false) {
    super("_translations_", [TranslationEntity], reset);
  }

  async saveTranslations(instances: TranslationEntity[]): Promise<TranslationEntity[]> {
    const result = await this.save(TranslationEntity, instances);
    for (const r of result) {
      this.cache[this.getKey(r)] = r;
    }
    return result;
  }

  async getTranslation(
    language: string,
    key: string,
    data: TranslationData | null = null
  ) {
    const cacheKey = this.getKey({code: language, key});
    let target: TranslationEntity | null = null;
    if (this.cache[cacheKey]) {
      target = this.cache[cacheKey];
    } else {
      const targets = await this.find(TranslationEntity, { code: language, key });
      if (targets.length < 1) {
        return `[translation not found]: ${key} (${language})`;
      }
      target = targets[0];
    }
    
    let result = target.text;
    if (data) {
      for (const dataKey of Object.keys(data)) {
        result = result.replaceAll(`$(${dataKey})`, data[dataKey]);
      }
    }
    return result;
  }

  async mapObject<T extends {[key: string]: string}>(target: T, language: string, data: Record<string, TranslationData> = {}) {
    const result: Record<string, string> = {};
    for (const targetKey of Object.keys(target)) {
      const translationKey = target[targetKey];
      const translationData = data[targetKey] ?? null;
      result[targetKey] = await this.getTranslation(language, translationKey, translationData);
    }
    return result as T;
  }

  private getKey(translation: {code: string, key: string}): string {
    return `${translation.code}_${translation.key}`;
  }
}
