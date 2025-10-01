import { isArray, isDate, isObject, transform } from 'lodash';

type AnyRecord = Record<string, unknown>;

type TransformKeyFn = (key: string) => string;

type JsonValue = AnyRecord | AnyRecord[] | string | number | boolean | null | Date | undefined;

function toSnake(value: string): string {
  return value
    .replace(/([A-Z]+)/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
    .replace(/^_/, '');
}

function toCamel(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-](\w)/g, (_, c: string) => c.toUpperCase());
}

function transformKeys<T extends JsonValue>(value: T, transformer: TransformKeyFn): T {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (isDate(value)) {
    return value;
  }

  if (isArray(value)) {
    return value.map((item) => transformKeys(item, transformer)) as T;
  }

  if (!isObject(value)) {
    return value;
  }

  const output = transform(value as AnyRecord, (result: AnyRecord, val: unknown, key: string) => {
    const transformedKey = transformer(key);
    result[transformedKey] = transformKeys(val as JsonValue, transformer);
  }, {} as AnyRecord);

  return output as T;
}

export function keysToSnakeCase<T extends JsonValue>(value: T): T {
  return transformKeys(value, toSnake);
}

export function keysToCamelCase<T extends JsonValue>(value: T): T {
  return transformKeys(value, toCamel);
}

export function normalizeHttpParams(params: AnyRecord): AnyRecord {
  return transformKeys(params, toSnake);
}
