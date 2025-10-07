import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccessControlService } from './access-control.service';
import { PermissionInput } from './access-control.types';

@Directive({ selector: '[appHasPermission]', standalone: true })
export class HasPermissionDirective implements OnDestroy {
  private permission: PermissionInput | undefined;
  private subscription?: Subscription;
  private isVisible = false;

  constructor(
    private readonly templateRef: TemplateRef<unknown>,
    private readonly viewContainer: ViewContainerRef,
    private readonly access: AccessControlService,
  ) {}

  @Input()
  set appHasPermission(value: PermissionInput) {
    this.permission = value;
    this.applyPermission();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private applyPermission(): void {
    this.subscription?.unsubscribe();
    const requirements = this.permission;
    if (requirements === undefined || requirements === null) {
      this.show();
      return;
    }

    this.subscription = this.access.watch(requirements).subscribe((can) => {
      if (can) {
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
