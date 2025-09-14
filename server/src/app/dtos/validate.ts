/**
 * Tiny runtime validation helpers (no external deps).
 * Define a schema with per-field validators and call validate().
 */
export type Validator<T> = (v: any) => { ok: true; val: T } | { ok: false; msg: string };

export const isString: Validator<string> = (v) =>
  (typeof v === 'string' && v.trim().length >= 0) ? { ok: true, val: String(v) } : { ok: false, msg: 'Expected string' };

export const isNonEmptyString: Validator<string> = (v) => {
  if (typeof v !== 'string') return { ok: false, msg: 'Expected string' };
  const val = v.trim();
  return val ? { ok: true, val } : { ok: false, msg: 'Required string' };
};

export const isOptional = <T>(inner: Validator<T>): Validator<T | undefined> => (v) => {
  if (v === undefined || v === null) return { ok: true, val: undefined };
  return inner(v);
};

export const isBoolean: Validator<boolean> = (v) => ({ ok: typeof v === 'boolean', val: !!v } as any);
export const asBoolean: Validator<boolean> = (v) => ({ ok: true, val: String(v).toLowerCase() === 'true' } as any);

export const isNumber: Validator<number> = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? { ok: true, val: n } : { ok: false, msg: 'Expected number' };
};

export const isArrayOf = <T>(inner: Validator<T>): Validator<T[]> => (v) => {
  const arr = Array.isArray(v) ? v : (v === undefined || v === null ? [] : [v]);
  const out: T[] = [];
  for (const item of arr) {
    const r = inner(item);
    if (!r.ok) return { ok: false, msg: r.msg };
    out.push(r.val);
  }
  return { ok: true, val: out };
};

export const validate = <T extends Record<string, any>>(schema: Record<keyof T, Validator<any>>, payload: any) => {
  const errors: Record<string, string> = {};
  const out: any = {};
  for (const key of Object.keys(schema)) {
    const v = (payload as any)[key];
    const res = (schema as any)[key](v);
    if (!res.ok) errors[key] = res.msg;
    else out[key] = res.val;
  }
  const ok = Object.keys(errors).length === 0;
  return { ok, data: ok ? (out as T) : undefined, errors };
};
