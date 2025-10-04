import {
  Directive,
  Input,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { AccessControlService } from './access-control.service';
import { PermissionRequirement } from './access-control.types';

@Directive({ selector: '[appHasReadOnlyPermission]', standalone: true })
export class HasReadOnlyPermissionDirective implements OnDestroy {
  private moduleName?: string;
  private subscription?: Subscription;
  private isVisible = false;

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainer: ViewContainerRef,
    private readonly access: AccessControlService
  ) {}

  @Input()
  set appHasReadOnlyPermission(value: string | PermissionRequirement | undefined) {
    this.moduleName = this.extractModule(value);
    this.applyPermission();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private extractModule(
    value: string | PermissionRequirement | undefined
  ): string | undefined {
    if (!value) return undefined;
    if (typeof value === 'string') {
      const normalized = value.trim();
      return normalized ? normalized : undefined;
    }
    const normalized = (value.module || '').trim();
    return normalized ? normalized : undefined;
  }

  private applyPermission(): void {
    this.subscription?.unsubscribe();

    const module = this.moduleName;
    if (!module) {
      this.hide();
      return;
    }

    this.subscription = combineLatest([
      this.access.watch({ module, level: 'read' }),
      this.access.watch({ module, level: 'write' }),
    ]).subscribe(([canRead, canWrite]) => {
      if (canRead && !canWrite) {
        this.show();
      } else {
        this.hide();
      }
    });
  }

  private show(): void {
    if (!this.isVisible) {
      this.viewContainer.clear();
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.isVisible = true;
    }
  }

  private hide(): void {
    if (this.isVisible) {
      this.viewContainer.clear();
      this.isVisible = false;
    }
  }
}
