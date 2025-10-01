import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

declare const Keycloak: any;

interface KeycloakInitOptions {
  onLoad?: 'login-required' | 'check-sso' | string;
  checkLoginIframe?: boolean;
  pkceMethod?: 'S256' | 'S128' | string;
  silentCheckSsoRedirectUri?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private keycloakAuth: any;
  private scriptLoading?: Promise<void>;

  init(): Promise<boolean> {
    if (environment.defaultauth !== 'keycloak') {
      return Promise.resolve(true);
    }

    return this.loadKeycloakScript()
      .then(() => {
        const { url, realm, clientId, initOptions } = environment.keycloak;
        this.keycloakAuth = new Keycloak({ url, realm, clientId });

        const options: KeycloakInitOptions = {
          ...(initOptions ?? {}),
        };

        if (!options.onLoad) {
          options.onLoad = 'check-sso';
        }

        if (options.checkLoginIframe === undefined) {
          options.checkLoginIframe = false;
        }

        if (!options.pkceMethod) {
          options.pkceMethod = 'S256';
        }

        return this.keycloakAuth.init(options).then(async (authenticated: boolean) => {
          if (authenticated) {
            await this.persistUserSession();
          }
          return authenticated;
        });
      })
      .catch((error) => {
        console.error('Keycloak initialization failed', error);
        return Promise.reject(error);
      });
  }

  isLoggedIn(): boolean {
    return !!this.keycloakAuth?.authenticated;
  }

  login(options?: any): Promise<void> {
    if (!this.keycloakAuth) {
      return Promise.reject('Keycloak is not initialized');
    }
    return this.keycloakAuth.login(options);
  }

  logout(redirectUri?: string): Promise<void> {
    if (!this.keycloakAuth) {
      return Promise.resolve();
    }
    return this.keycloakAuth.logout({ redirectUri });
  }

  getToken(): Promise<string> {
    if (!this.keycloakAuth) {
      return Promise.reject('Keycloak is not initialized');
    }

    return this.keycloakAuth
      .updateToken(30)
      .catch(() => this.keycloakAuth.login())
      .then(async () => {
        await this.persistToken();
        return this.keycloakAuth.token;
      });
  }

  getUsername(): string | undefined {
    return this.keycloakAuth?.tokenParsed?.preferred_username;
  }

  loadUserProfile(): Promise<any> {
    if (!this.keycloakAuth) {
      return Promise.reject('Keycloak is not initialized');
    }
    return this.keycloakAuth.loadUserProfile();
  }

  private loadKeycloakScript(): Promise<void> {
    if ((window as any).Keycloak) {
      return Promise.resolve();
    }

    if (this.scriptLoading) {
      return this.scriptLoading;
    }

    this.scriptLoading = new Promise((resolve, reject) => {
      const existingScript = document.getElementById('keycloak-js');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', (error) => reject(error));
        return;
      }

      const script = document.createElement('script');
      script.id = 'keycloak-js';
      script.src = `${environment.keycloak.url}/js/keycloak.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.body.appendChild(script);
    });

    return this.scriptLoading;
  }

  private async persistUserSession(): Promise<void> {
    try {
      const profile = await this.keycloakAuth.loadUserProfile();
      const userData = {
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        token: this.keycloakAuth.token,
      };
      sessionStorage.setItem('currentUser', JSON.stringify(userData));
      await this.persistToken();
    } catch (error) {
      console.error('Failed to load Keycloak user profile', error);
    }
  }

  private async persistToken(): Promise<void> {
    if (this.keycloakAuth?.token) {
      sessionStorage.setItem('token', this.keycloakAuth.token);
    }
  }
}
