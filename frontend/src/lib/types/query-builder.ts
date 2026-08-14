type Operator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte";

type SqlOperator<Op extends Operator> = Op extends "eq"
  ? "="
  : Op extends "neq"
    ? "!="
    : Op extends "gt"
      ? ">"
      : Op extends "gte"
        ? ">="
        : Op extends "lt"
          ? "<"
          : Op extends "lte"
            ? "<="
            : never;

type JoinFields<T extends readonly string[]> = T extends readonly [
  infer F extends string,
]
  ? F
  : T extends readonly [infer F extends string, ...infer R extends string[]]
    ? `${F}, ${JoinFields<R>}`
    : never;

const SQL_OPERATORS = {
  eq: "=",
  neq: "!=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
} as const;

type AndWhere<
  Query extends string,
  HasWhere extends boolean,
  Clause extends string,
> = HasWhere extends true ? `${Query} AND ${Clause}` : `${Query} WHERE ${Clause}`;

type WithOrder<
  Query extends string,
  HasOrder extends boolean,
  Clause extends string,
> = HasOrder extends true
  ? `${Query}, ${Clause}`
  : `${Query} ORDER BY ${Clause}`;

export interface BuiltQuery<Query extends string> {
  query: Query;
  params: unknown[];
}

/**
 * Fluent query builder that narrows selected fields at the type level.
 * The generated SQL string is a template-literal type, so callers can
 * inspect the exact query shape without runtime parsing.
 */
export class QueryBuilder<
  T extends Record<string, unknown>,
  Selected extends keyof T & string = keyof T & string,
  Query extends string = "SELECT * FROM jobs",
  HasWhere extends boolean = false,
  HasOrder extends boolean = false,
> {
  private constructor(
    private readonly fields: readonly Selected[],
    private readonly params: unknown[],
    private readonly sql: Query,
  ) {}

  static create<T extends Record<string, unknown>>(): QueryBuilder<T> {
    return new QueryBuilder<T>([], [], "SELECT * FROM jobs");
  }

  select<
    const Fields extends readonly [keyof T & string, ...(keyof T & string)[]],
  >(
    ...fields: Fields
  ): QueryBuilder<
    T,
    Fields[number],
    `SELECT ${JoinFields<Fields>} FROM jobs`,
    false,
    false
  > {
    const joined = fields.join(", ");
    const sql = `SELECT ${joined} FROM jobs` as `SELECT ${JoinFields<Fields>} FROM jobs`;
    return new QueryBuilder<
      T,
      Fields[number],
      `SELECT ${JoinFields<Fields>} FROM jobs`,
      false,
      false
    >(fields, [], sql);
  }

  where<K extends Selected, Op extends Operator>(
    field: K,
    op: Op,
    value: T[K],
  ): QueryBuilder<
    T,
    Selected,
    AndWhere<Query, HasWhere, `${K} ${SqlOperator<Op>} ?`>,
    true,
    HasOrder
  > {
    const sqlOp = SQL_OPERATORS[op];

    const clause = `${String(field)} ${sqlOp} ?`;
    const nextSql = (
      this.sql.includes(" WHERE ")
        ? `${this.sql} AND ${clause}`
        : `${this.sql} WHERE ${clause}`
    ) as AndWhere<Query, HasWhere, `${K} ${SqlOperator<Op>} ?`>;

    return new QueryBuilder(this.fields, [...this.params, value], nextSql);
  }

  orderBy<K extends Selected>(
    field: K,
    direction: "asc" | "desc",
  ): QueryBuilder<
    T,
    Selected,
    WithOrder<Query, HasOrder, `${K} ${Uppercase<typeof direction>}`>,
    HasWhere,
    true
  > {
    const clause = `${String(field)} ${direction.toUpperCase()}`;
    const nextSql = (
      this.sql.includes(" ORDER BY ")
        ? `${this.sql}, ${clause}`
        : `${this.sql} ORDER BY ${clause}`
    ) as WithOrder<Query, HasOrder, `${K} ${Uppercase<typeof direction>}`>;

    return new QueryBuilder(this.fields, this.params, nextSql);
  }

  limit<N extends number>(
    count: N,
  ): QueryBuilder<T, Selected, `${Query} LIMIT ${N}`, HasWhere, HasOrder> {
    const nextSql = `${this.sql} LIMIT ${count}` as `${Query} LIMIT ${N}`;
    return new QueryBuilder(this.fields, this.params, nextSql);
  }

  build(): BuiltQuery<Query> {
    return { query: this.sql, params: this.params };
  }
}
