import type en from '@/i18n/locales/en.json';

/** Nested JSON locale file shape (string leaves, object branches). */
export type TranslationNode =
  | string
  | { [key: string]: TranslationNode };

/** Leaf nodes in the translation tree resolve to a dot-notation key. */
type TranslationKeyLeaf<
  Prefix extends string,
> = Prefix extends '' ? never : Prefix;

/** Recursively maps nested JSON to dot-notation keys (e.g. `home.description`). */
export type TranslationKeyOf<
  T,
  Prefix extends string = '',
> = T extends string
  ? TranslationKeyLeaf<Prefix>
  : T extends Record<string, unknown>
    ? {
        [K in keyof T & string]: TranslationKeyOf<
          T[K],
          Prefix extends '' ? K : `${Prefix}.${K}`
        >;
      }[keyof T & string]
    : never;

/** All valid `t('...')` keys — derived from `en.json` (source of truth). */
export type TranslationKey = TranslationKeyOf<typeof en>;

/** Expected shape of every locale file (`en.json`, `pl.json`, …). */
export type TranslationSchema = typeof en;
