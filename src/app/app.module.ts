import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NgPipesModule } from 'ngx-pipes';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutsModule } from './layouts/layouts.module';
import { PagesModule } from './pages/pages.module';

import { KeycloakAuthService } from './auth/keycloak/keycloak.service';
import { TokenInterceptor } from './auth/keycloak/token.interceptor';
import { AccessControlInterceptor } from './core/access-control/access-control.interceptor';
import { SnakeCaseInterceptor } from './core/http/snake-case.interceptor';
import { ApiFeedbackInterceptor } from './core/http/api-feedback.interceptor';
import { environment } from '../environments/environment';

// Store
import { rootReducer } from './store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { EcommerceEffects } from './store/Ecommerce/ecommerce_effect';
import { ProjectEffects } from './store/Project/project_effect';
import { TaskEffects } from './store/Task/task_effect';
import { CRMEffects } from './store/CRM/crm_effect';
import { CryptoEffects } from './store/Crypto/crypto_effect';
import { InvoiceEffects } from './store/Invoice/invoice_effect';
import { TicketEffects } from './store/Ticket/ticket_effect';
import { FileManagerEffects } from './store/File Manager/filemanager_effect';
import { TodoEffects } from './store/Todo/todo_effect';
import { ApplicationEffects } from './store/Jobs/jobs_effect';
import { ApikeyEffects } from './store/APIKey/apikey_effect';
import { AuthenticationEffects } from './store/Authentication/authentication.effects';

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export function initializeKeycloak(auth: KeycloakAuthService): () => Promise<boolean> {
  return () => auth.init();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    LayoutsModule,
    StoreModule.forRoot(rootReducer),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
    EffectsModule.forRoot([
      AuthenticationEffects,
      EcommerceEffects,
      ProjectEffects,
      TaskEffects,
      CRMEffects,
      CryptoEffects,
      InvoiceEffects,
      TicketEffects,
      FileManagerEffects,
      TodoEffects,
      ApplicationEffects,
      ApikeyEffects,
    ]),
    PagesModule,
    ToastModule,
    NgPipesModule,
  ],
  providers: [
    MessageService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakAuthService],
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: AccessControlInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SnakeCaseInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ApiFeedbackInterceptor, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
