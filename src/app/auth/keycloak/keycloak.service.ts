import { Injectable } from '@angular/core';
import Keycloak, { KeycloakConfig, KeycloakInitOptions, KeycloakTokenParsed } from 'keycloak-js';
import { environment } from '../../config/environment';

export type AuthStateCallback = () => void;

@Injectable({ providedIn: 'root' })
export class KeycloakAuthService {
  private keycloak: any = null;
  private readonly authListeners: Set<AuthStateCallback> = new Set();

  init = async (): Promise<boolean> => {
    const config: KeycloakConfig = {
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId,
    };
    const kc = this.keycloak ?? (this.keycloak = new (Keycloak as any)(config));

    const initOptions: KeycloakInitOptions = {
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256',
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
    };

    try {
      const authenticated = await kc.init(initOptions as any);
      this.registerKeycloakEvents(kc);
      this.emitAuthStateChanged();
      return authenticated as boolean;
    } catch (err) {
      console.error('Keycloak init error', err);
      this.emitAuthStateChanged();
      return false;
    }
  };

  login(options?: string | { redirectUri?: string; prompt?: string }) {
    if (!this.keycloak) return;
    if (typeof options === 'string' || !options) {
      const redirectUri = typeof options === 'string' ? options : undefined;
      this.keycloak.login(redirectUri ? { redirectUri } : undefined);
      return;
    }
    this.keycloak.login(options);
  }

  logout(redirectUri?: string) {
    this.keycloak?.logout({ redirectUri });
  }

  getToken(): Promise<string | undefined> {
    return new Promise(async (resolve, reject) => {
      try {
        const kc = this.keycloak;
        if (!kc) return resolve(undefined);
        if (kc.isTokenExpired(10)) {
          await kc.updateToken(30);
          this.emitAuthStateChanged();
        }
        resolve(kc.token as string | undefined);
      } catch (e) {
        reject(e);
      }
    });
  }

  isLoggedIn(): boolean {
    return !!this.keycloak?.authenticated;
  }

  hasRole(role: string): boolean {
    const kc: any = this.keycloak;
    return (
      !!kc?.realmAccess?.roles?.includes(role) ||
      !!kc?.resourceAccess?.[environment.keycloak.clientId]?.roles?.includes(role)
    );
  }

  getRoles(): string[] {
    const kc: any = this.keycloak;
    if (!kc) return [];
    const realmRoles: string[] = kc?.realmAccess?.roles ?? [];
    const clientRoles: string[] = kc?.resourceAccess?.[environment.keycloak.clientId]?.roles ?? [];
    return Array.from(new Set([...(realmRoles ?? []), ...(clientRoles ?? [])]));
  }

  getTokenPayload(): KeycloakTokenParsed | undefined {
    return this.keycloak?.tokenParsed as KeycloakTokenParsed | undefined;
  }

  onAuthStateChanged(callback: AuthStateCallback): () => void {
    this.authListeners.add(callback);
    return () => this.authListeners.delete(callback);
  }

  private registerKeycloakEvents(kc: any) {
    const notify = () => this.emitAuthStateChanged();
    kc.onReady = notify;
    kc.onAuthSuccess = notify;
    kc.onAuthRefreshSuccess = notify;
    kc.onAuthRefreshError = notify;
    kc.onAuthLogout = notify;
    kc.onAuthError = notify;
    kc.onTokenExpired = async () => {
      try {
        await kc.updateToken(20);
      } catch (error) {
        console.error('Token refresh failed', error);
      }
      notify();
    };
  }

  private emitAuthStateChanged() {
    this.authListeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Auth state listener error', err);
      }
    });
  }
}
