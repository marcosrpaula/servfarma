import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GlobalLoaderService {
  private readonly visibility$ = new BehaviorSubject<boolean>(false);
  private pending = 0;

  readonly isVisible$ = this.visibility$.asObservable();

  show(): void {
    this.pending++;
    if (!this.visibility$.value) {
      this.visibility$.next(true);
    }
  }

  hide(): void {
    if (this.pending > 0) {
      this.pending--;
    }
    if (this.pending === 0 && this.visibility$.value) {
      this.visibility$.next(false);
    }
  }

  track<T>(source$: Observable<T>): Observable<T> {
    this.show();
    return source$.pipe(finalize(() => this.hide()));
  }
}
