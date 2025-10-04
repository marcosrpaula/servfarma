import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { AuthenticationService } from "../../core/services/auth.service";
import { Router } from "@angular/router";
import { TokenStorageService } from "../../core/services/token-storage.service";
import { KeycloakAuthService } from "../../auth/keycloak/keycloak.service";

@Component({
    selector: "app-topbar",
    templateUrl: "./topbar.component.html",
    styleUrls: ["./topbar.component.scss"],
    standalone: false
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Output() mobileMenuButtonClicked = new EventEmitter<void>();
  element: HTMLElement | null = null;
  userName = '';
  userInitial = '?';
  userRoleLabel = 'User';
  userAvatarUrl: string | null = null;
  showInitials = false;
  readonly defaultAvatarUrl = 'assets/images/users/avatar-1.jpg';
  private detachAuthListener?: () => void;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthenticationService,
    private router: Router,
    private tokenStorage: TokenStorageService,
    private keycloak: KeycloakAuthService
  ) {}

  ngOnInit(): void {
    this.element = this.document.documentElement;
    this.updateFromStoredUser();
    this.detachAuthListener = this.keycloak.onAuthStateChanged(() =>
      this.updateFromKeycloak()
    );
    this.updateFromKeycloak();
  }

  ngOnDestroy(): void {
    this.detachAuthListener?.();
  }

  private updateFromStoredUser(): void {
    const user = this.tokenStorage.getUser();
    this.applyUserProfile(user);
  }

  private updateFromKeycloak(): void {
    const payload = this.keycloak.getTokenPayload();
    if (!payload) {
      this.updateFromStoredUser();
      return;
    }
    const roles = this.keycloak.getRoles();
    const compositeUser = { ...payload, roles };
    this.applyUserProfile(compositeUser);
  }

  private applyUserProfile(user: any): void {
    const resolvedName = this.resolveUserName(user);
    const resolvedAvatar = this.resolveUserAvatar(user);
    this.userName = resolvedName;
    this.userRoleLabel = this.resolveUserRole(user);
    if (resolvedAvatar) {
      this.userAvatarUrl = resolvedAvatar;
      this.showInitials = false;
    } else if (resolvedName) {
      this.userAvatarUrl = null;
      this.showInitials = true;
    } else {
      this.userAvatarUrl = this.defaultAvatarUrl;
      this.showInitials = false;
    }
    this.userInitial = this.resolveUserInitial(resolvedName);
  }

  private resolveUserName(user: any): string {
    if (!user) {
      return '';
    }
    if (user.fullName) {
      return user.fullName;
    }
    const nameParts = [user.first_name, user.last_name].filter(Boolean);
    if (nameParts.length) {
      return nameParts.join(' ');
    }
    if (user.name) {
      return user.name;
    }
    if (user.preferred_username) {
      return user.preferred_username;
    }
    if (user.username) {
      return user.username;
    }
    if (user.given_name) {
      return user.given_name;
    }
    if (user.email) {
      return String(user.email).split('@')[0];
    }
    return '';
  }

  private resolveUserInitial(name: string): string {
    const trimmed = (name ?? '').trim();
    if (!trimmed) {
      return '?';
    }
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    const first = parts[0].charAt(0).toUpperCase();
    const last = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first}${last}`;
  }

  private resolveUserRole(user: any): string {
    if (!user) {
      return 'User';
    }
    if (user.role) {
      return user.role;
    }
    if (Array.isArray(user.roles) && user.roles.length) {
      return user.roles[0];
    }
    const realmRoles = user.realm_access?.roles;
    if (Array.isArray(realmRoles) && realmRoles.length) {
      return realmRoles[0];
    }
    if (user.resource_access) {
      const entries = Object.values(user.resource_access) as any[];
      for (const entry of entries) {
        if (entry && Array.isArray(entry.roles) && entry.roles.length) {
          return entry.roles[0];
        }
      }
    }
    return 'User';
  }

  private resolveUserAvatar(user: any): string | null {
    if (!user) {
      return null;
    }

    const directCandidates = [
      user.avatar,
      user.avatarUrl,
      user.avatarURL,
      user.photo,
      user.photoUrl,
      user.photoURL,
      user.picture,
      user.profilePicture,
      user.profile_picture,
      user.image,
      user.imageUrl,
      user.imageURL,
    ];

    for (const candidate of directCandidates) {
      if (typeof candidate === 'string' && candidate.trim().length) {
        return candidate.trim();
      }
    }

    const attributes = user.attributes;
    if (attributes) {
      const attributeCandidates = [
        attributes.picture,
        attributes.avatar,
        attributes.photo,
        attributes.photoUrl,
        attributes.photoURL,
      ];

      for (const attr of attributeCandidates) {
        if (Array.isArray(attr) && attr.length && typeof attr[0] === 'string' && attr[0].trim().length) {
          return attr[0].trim();
        }
        if (typeof attr === 'string' && attr.trim().length) {
          return attr.trim();
        }
      }
    }

    return null;
  }

  toggleMobileMenu(event: Event): void {
    event.preventDefault();
    this.document.querySelector('.hamburger-icon')?.classList.toggle('open');
    this.mobileMenuButtonClicked.emit();
  }

  fullscreen(): void {
    this.document.body.classList.toggle('fullscreen-enable');
    const docEl: any = this.element;

    if (!this.document.fullscreenElement && !docEl?.mozFullScreenElement && !docEl?.webkitFullscreenElement) {
      if (docEl?.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl?.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl?.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl?.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if ((this.document as any).mozCancelFullScreen) {
        (this.document as any).mozCancelFullScreen();
      } else if ((this.document as any).webkitExitFullscreen) {
        (this.document as any).webkitExitFullscreen();
      } else if ((this.document as any).msExitFullscreen) {
        (this.document as any).msExitFullscreen();
      }
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/auth/login"]);
  }

  windowScroll(): void {
    const backToTop = this.document.getElementById("back-to-top");
    if (this.document.body.scrollTop > 100 || this.document.documentElement.scrollTop > 100) {
      if (backToTop) {
        backToTop.style.display = "block";
      }
      this.document.getElementById('page-topbar')?.classList.add('topbar-shadow');
    } else {
      if (backToTop) {
        backToTop.style.display = "none";
      }
      this.document.getElementById('page-topbar')?.classList.remove('topbar-shadow');
    }
  }
}


