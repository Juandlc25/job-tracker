/**
 * Recursively marks every property of `T` as readonly.
 *
 * Depth is bounded (`D`) so TypeScript cannot recurse indefinitely on
 * cyclical object graphs. Primitives, functions, and well-known built-ins
 * (Date, RegExp) are treated as leaves.
 */
type Leaf =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | undefined
  | null
  | ((...args: never[]) => unknown)
  | Date
  | RegExp
  | Error;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export type DeepReadonly<T, D extends number = 10> = D extends never
  ? T
  : T extends Leaf
    ? T
    : T extends Map<infer K, infer V>
      ? ReadonlyMap<DeepReadonly<K, Prev[D]>, DeepReadonly<V, Prev[D]>>
      : T extends ReadonlyMap<infer K, infer V>
        ? ReadonlyMap<DeepReadonly<K, Prev[D]>, DeepReadonly<V, Prev[D]>>
        : T extends Set<infer V>
          ? ReadonlySet<DeepReadonly<V, Prev[D]>>
          : T extends ReadonlySet<infer V>
            ? ReadonlySet<DeepReadonly<V, Prev[D]>>
            : T extends readonly unknown[]
              ? { readonly [K in keyof T]: DeepReadonly<T[K], Prev[D]> }
              : T extends object
                ? { readonly [K in keyof T]: DeepReadonly<T[K], Prev[D]> }
                : T;
