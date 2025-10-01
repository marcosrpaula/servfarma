import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionService } from 'src/app/core/services/permission.service';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnDestroy {
  private requiredPermissions: string | string[] | undefined;
  private subscription = new Subscription();

  constructor(
    private permissionService: PermissionService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {
    this.subscription.add(
      this.permissionService.permissions$.subscribe(() => this.updateView())
    );
    this.subscription.add(this.permissionService.ensurePermissionsLoaded().subscribe(() => this.updateView()));
  }

  @Input()
  set appHasPermission(required: string | string[] | undefined) {
    this.requiredPermissions = required;
    this.updateView();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateView(): void {
    if (!this.requiredPermissions || this.permissionService.hasPermission(this.requiredPermissions)) {
      if (this.viewContainer.length === 0) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
      return;
    }

    this.viewContainer.clear();
  }
}
