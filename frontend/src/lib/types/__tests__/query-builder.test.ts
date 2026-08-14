import { describe, expect, expectTypeOf, it } from "vitest";
import { QueryBuilder } from "../query-builder";

interface JobRow {
  id: string;
  title: string;
  status: "draft" | "scheduled" | "completed";
}

describe("QueryBuilder", () => {
  it("narrows selected fields and builds a typed query", () => {
    const result = QueryBuilder.create<JobRow>()
      .select("id", "title", "status")
      .where("status", "eq", "completed")
      .orderBy("title", "asc")
      .limit(10)
      .build();

    expect(result.query).toBe(
      "SELECT id, title, status FROM jobs WHERE status = ? ORDER BY title ASC LIMIT 10",
    );
    expect(result.params).toEqual(["completed"]);
    expectTypeOf(result.query).toEqualTypeOf<
      "SELECT id, title, status FROM jobs WHERE status = ? ORDER BY title ASC LIMIT 10"
    >();
  });
});
