/** Simple helpers to convert between camelCase <-> snake_case recursively */

const toCamel = (s: string) => s.replace(/[_-](\w)/g, (_, c) => (c ? c.toUpperCase() : ''));

export const toSnakeCase = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();

export function keysToCamelCase<T = any>(input: any): T {
  if (Array.isArray(input)) return input.map(keysToCamelCase) as any;
  if (
    input !== null &&
    typeof input === 'object' &&
    !(input instanceof Date) &&
    !(input instanceof File)
  ) {
    const result: any = {};
    Object.keys(input).forEach((k) => {
      const v = (input as any)[k];
      result[toCamel(k)] = keysToCamelCase(v);
    });
    return result;
  }
  return input;
}

export function keysToSnakeCase<T = any>(input: any): T {
  if (Array.isArray(input)) return input.map(keysToSnakeCase) as any;
  if (
    input !== null &&
    typeof input === 'object' &&
    !(input instanceof Date) &&
    !(input instanceof File)
  ) {
    const result: any = {};
    Object.keys(input).forEach((k) => {
      const v = (input as any)[k];
      result[toSnakeCase(k)] = keysToSnakeCase(v);
    });
    return result;
  }
  return input;
}
