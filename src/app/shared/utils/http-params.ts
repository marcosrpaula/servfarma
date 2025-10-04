import { HttpParams } from '@angular/common/http';

type Primitive = string | number | boolean | null | undefined;
type ParamValue = Primitive | Primitive[];

export type QueryParams = Record<string, ParamValue>;

export function buildHttpParams(params: QueryParams): HttpParams {
  let httpParams = new HttpParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null || item === '') {
          return;
        }
        httpParams = httpParams.append(key, String(item));
      });
      return;
    }

    httpParams = httpParams.append(key, String(value));
  });

  return httpParams;
}
