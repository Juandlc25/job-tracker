type Primitive = string | number | boolean | bigint | symbol | undefined | null;

type IsLeaf<T> = T extends Primitive
  ? true
  : T extends Date | RegExp | ((...args: never[]) => unknown)
    ? true
    : T extends readonly unknown[]
      ? true
      : T extends Map<unknown, unknown> | Set<unknown> | ReadonlyMap<unknown, unknown> | ReadonlySet<unknown>
        ? true
        : false;

/**
 * Union of every dot-notation path that reaches a leaf property of `T`.
 *
 * @example
 * PathKeys<{ a: { b: string; c: { d: number } } }>
 * // => "a.b" | "a.c.d"
 */
export type PathKeys<T> = {
  [K in keyof T & string]: IsLeaf<NonNullable<T[K]>> extends true
    ? K
    : NonNullable<T[K]> extends object
      ? `${K}.${PathKeys<NonNullable<T[K]>>}`
      : K;
}[keyof T & string];
