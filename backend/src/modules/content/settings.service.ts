import { validate } from "../../lib/validate.js";
import { Setting } from "./content.models.js";
import { SETTING_KEYS, settingSchemas, type SettingKey, type Settings } from "./settings.schema.js";

/**
 * Settings are read on almost every request (prices, delivery fees …), so each server
 * instance keeps them in memory for a short time. Saving clears this instance's copy at
 * once; other instances pick the change up within CACHE_MS.
 */
const CACHE_MS = 30_000;
let cache: { settings: Settings; loadedAt: number } | null = null;

/** Saved values merged over the defaults; a broken saved value falls back to the defaults. */
function parseGroup(key: SettingKey, saved: unknown) {
  const schema = settingSchemas[key];
  const result = schema.safeParse(saved ?? {});
  return result.success ? result.data : schema.parse({});
}

/** `fresh: true` skips the cache (checkout uses it, so a just-disabled payment method is respected). */
export async function getSettings({ fresh = false } = {}): Promise<Settings> {
  if (!fresh && cache && Date.now() - cache.loadedAt < CACHE_MS) return cache.settings;

  const rows = await Setting.find();
  const saved = new Map(rows.map((row) => [row.key, row.value]));
  const settings = Object.fromEntries(SETTING_KEYS.map((key) => [key, parseGroup(key, saved.get(key))])) as Settings;

  cache = { settings, loadedAt: Date.now() };
  return settings;
}

/** Replaces one settings group after checking it against its schema. */
export async function saveSettingsGroup<K extends SettingKey>(key: K, input: unknown): Promise<Settings[K]> {
  const value = validate(settingSchemas[key], input) as Settings[K];
  await Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
  cache = null;
  return value;
}

export function clearSettingsCache() {
  cache = null;
}
