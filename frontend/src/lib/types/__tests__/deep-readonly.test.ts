import { describe, expectTypeOf, it } from "vitest";
import type { DeepReadonly } from "../deep-readonly";
import type { PathKeys } from "../path-keys";

type Sample = {
  id: string;
  nested: { count: number; flag: boolean };
  tags: string[];
  scores: Map<string, { value: number }>;
  unique: Set<{ id: string }>;
  pair: [string, number];
};

describe("DeepReadonly", () => {
  it("makes nested objects, arrays, maps, sets, and tuples readonly", () => {
    type Frozen = DeepReadonly<Sample>;

    expectTypeOf<Frozen["id"]>().toEqualTypeOf<string>();
    expectTypeOf<Frozen["nested"]>().toEqualTypeOf<{
      readonly count: number;
      readonly flag: boolean;
    }>();
    expectTypeOf<Frozen["tags"]>().toEqualTypeOf<readonly string[]>();
    expectTypeOf<Frozen["scores"]>().toEqualTypeOf<
      ReadonlyMap<string, { readonly value: number }>
    >();
    expectTypeOf<Frozen["unique"]>().toEqualTypeOf<
      ReadonlySet<{ readonly id: string }>
    >();
    expectTypeOf<Frozen["pair"]>().toEqualTypeOf<readonly [string, number]>();
  });
});

describe("PathKeys", () => {
  it("produces dot-notation leaf paths", () => {
    type Paths = PathKeys<{ a: { b: string; c: { d: number } } }>;
    expectTypeOf<Paths>().toEqualTypeOf<"a.b" | "a.c.d">();
  });
});
