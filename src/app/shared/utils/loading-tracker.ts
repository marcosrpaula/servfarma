import { Signal, computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

export interface LoadingTracker {
  readonly isLoading: Signal<boolean>;
  track<T>(source: Observable<T>): Observable<T>;
  begin(): void;
  end(): void;
}

export function createLoadingTracker(): LoadingTracker {
  const pending = signal(0);
  const isLoading = computed(() => pending() > 0);

  const begin = () => {
    pending.update((count) => count + 1);
  };

  const end = () => {
    pending.update((count) => (count > 0 ? count - 1 : 0));
  };

  const track = <T>(source: Observable<T>): Observable<T> => {
    begin();
    return source.pipe(finalize(end));
  };

  return { isLoading, track, begin, end };
}
