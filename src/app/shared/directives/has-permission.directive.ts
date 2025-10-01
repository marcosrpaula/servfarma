import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionExpression, PermissionService } from '../../core/services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnDestroy {
  private subscription?: Subscription;
  private expression?: PermissionExpression | PermissionExpression[];
  private hasView = false;

  constructor(
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainer: ViewContainerRef,
    private readonly permissionService: PermissionService
  ) { }

  @Input()
  set appHasPermission(value: PermissionExpression | PermissionExpression[]) {
    this.expression = value;
    this.subscribe();
  }

  private subscribe(): void {
    this.subscription?.unsubscribe();

    if (!this.expression) {
      this.render(true);
      return;
    }

    this.subscription = this.permissionService.observeAccess(this.expression).subscribe(canDisplay => {
      this.render(canDisplay);
    });
  }

  private render(canDisplay: boolean): void {
    if (canDisplay && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!canDisplay && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
