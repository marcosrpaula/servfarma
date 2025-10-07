# Padronização de Cadastros e Código Angular 19

## 1) Diagnóstico resumido

| Tela / Feature                    | Divergências identificadas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Laboratórios (lista e formulário) | Listagem mantém labels sem acentuação e filtros `[(ngModel)]` misturados com controles reativos, quebrando consistência e i18n ("Laboratrios", placeholders sem acento). 【F:src/app/feature-module/administration/laboratories/laboratories/laboratories.component.html†L1-L188】 Formulário usa `FormGroup` não tipado, strings sem acento e `*ngIf`, sem mensagens centralizadas ou máscaras. 【F:src/app/feature-module/administration/laboratories/laboratory-upsert/laboratory-upsert.component.ts†L1-L145】【F:src/app/feature-module/administration/laboratories/laboratory-upsert/laboratory-upsert.component.html†L1-L61】                                                                                                                     |
| Unidades de Devolução             | Lista trava paginação quando filtro de laboratório está vazio e mistura `[(ngModel)]` com sinais/comportamento reativo, além de manter labels e títulos sem acentos. 【F:src/app/feature-module/administration/return-units/return-units/return-units.component.ts†L31-L206】【F:src/app/feature-module/administration/return-units/return-units/return-units.component.html†L1-L198】 Formulário replica padrões de laboratório, sem form group tipado, sem diretivas de máscara e com `*ngIf` para mensagens. 【F:src/app/feature-module/administration/return-units/return-unit-upsert/return-unit-upsert.component.ts†L1-L120】【F:src/app/feature-module/administration/return-units/return-unit-upsert/return-unit-upsert.component.html†L1-L141】 |
| Projetos                          | Estrutura semelhante às demais, ainda com `FormGroup` não tipado, `*ngIf`, campos sem máscara ou consistência de labels, além de selects manuais repetidos para laboratórios. 【F:src/app/feature-module/administration/projects/project-upsert/project-upsert.component.ts†L1-L190】【F:src/app/feature-module/administration/projects/project-upsert/project-upsert.component.html†L1-L120】                                                                                                                                                                                                                                                                                                                                                           |
| CRM (Companies / Contacts)        | Usa `UntypedFormBuilder`, acesso direto ao DOM, modais bootstrap e strings em inglês, destoando dos cadastros principais e das diretrizes Angular 19 (standalone, forms tipados, i18n pt-BR). 【F:src/app/pages/crm/companies/companies.component.ts†L1-L198】【F:src/app/pages/crm/contacts/contacts.component.ts†L1-L188】                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Arquitetura global                | App continua baseado em `NgModule`, `provideRouter` ausente, interceptors classe-based com `withInterceptorsFromDi`, sem SSR/hidratação, e estilos globais sem tokens. 【F:src/app/app.module.ts†L1-L85】【F:src/app/app-routing.module.ts†L1-L20】【F:src/main.ts†L1-L14】【F:src/app/core/http/api-feedback.interceptor.ts†L1-L59】【F:src/styles.scss†L1-L50】                                                                                                                                                                                                                                                                                                                                                                                        |

## 2) Padrões propostos

1. **Standalone + Providers centralizados**: substituir `AppModule`/`AppRoutingModule` por `bootstrapApplication` com `provideRouter`, `withComponentInputBinding`, `withViewTransitions` e `provideClientHydration` para SSR-ready. 【F:src/app/app.module.ts†L1-L85】【F:src/app/app-routing.module.ts†L1-L20】【F:src/main.ts†L1-L14】
2. **Form Shell reativo tipado**: usar `FormBuilder.nonNullable` (ou `FormGroup<FormModel>`), validadores reutilizáveis e máscaras via directives para CPF/CNPJ, CEP, telefone; centralizar mensagens via componente único (`FormFieldErrorComponent`). 【F:src/app/feature-module/administration/return-units/return-unit-upsert/return-unit-upsert.component.ts†L31-L118】
3. **Templates com controle estrutural moderno**: substituir `*ngIf/*ngFor` por `@if/@for/@switch`, aplicar `@defer` em grids pesadas e skeletons padronizados (`LoadingState`). 【F:src/app/feature-module/administration/return-units/return-units/return-units.component.html†L97-L199】
4. **Normalização de labels/i18n**: corrigir acentuação e mover textos para chaves `i18n` (`pt-BR`), inclusive breadcrumbs, botões e placeholders. 【F:src/app/feature-module/administration/laboratories/laboratories/laboratories.component.html†L1-L188】
5. **Estados compartilhados e selects reutilizáveis**: extrair combo de laboratórios para componente standalone com `signal` + `@defer`, consumido por Projetos, Unidades e outros cadastros para eliminar duplicações. 【F:src/app/feature-module/administration/projects/project-upsert/project-upsert.component.ts†L88-L189】【F:src/app/feature-module/administration/return-units/return-unit-upsert/return-unit-upsert.component.ts†L68-L120】
6. **Interceptors funcionais + Http util**: migrar interceptors para `provideHttpClient(withInterceptors([...]))`, usando funções puras e `inject(NotificationService)` onde necessário. 【F:src/app/core/http/api-feedback.interceptor.ts†L1-L59】
7. **Tema com tokens SCSS**: definir mapa de cores, spacing, tipografia e aplicar BEM/utilitários consistentes, substituindo regras ad-hoc em `styles.scss`. 【F:src/styles.scss†L1-L50】
8. **Testes mínimos**: configurar `TestBed` sem NgModule, cobrindo validação de forms, serviços HTTP com `HttpClientTesting` e guards/resolvers funcionais.

## 3) Plano de refatoração por feature

| Feature                      | Passos                                                                                                                                                                                                                                                                     | Esforço |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **Bootstrap/Arquitetura**    | 1. Criar `app/app.config.ts` com `provideRouter`, `provideHttpClient`, `provideClientHydration`, `provideStore` etc. 2. Ajustar `main.ts` para `bootstrapApplication(AppComponent, appConfig)`. 3. Converter interceptors para funções e registrar via `withInterceptors`. | Grande  |
| **Laboratórios**             | 1. Extrair `LaboratoryFormShell` standalone usando `FormShellComponent` base. 2. Corrigir i18n/acentos e migrar template para `@if/@for`. 3. Substituir filtros `[(ngModel)]` por signals + `FormControl`. 4. Adicionar testes de validação e estado.                      | Médio   |
| **Unidades de Devolução**    | 1. Reaproveitar `LaboratorySelectComponent`. 2. Normalizar address form com máscara CEP/telefone. 3. Corrigir lógica de filtro (não bloquear sem laboratório). 4. Aplicar `LoadingState` e mensagens padronizadas.                                                         | Médio   |
| **Projetos**                 | 1. Reutilizar shell/form-field components. 2. Separar configurações de estoque em subform tipado. 3. Simplificar toggles com diretivas de acessibilidade.                                                                                                                  | Médio   |
| **CRM (Companies/Contacts)** | 1. Migrar para standalone, forms tipados e `inject()`. 2. Remover `UntypedForm*`, DOM manual e strings em inglês. 3. Avaliar descontinuação se cadastros legacy não forem usados.                                                                                          | Grande  |
| **Tema/CSS**                 | 1. Criar `styles/_tokens.scss` com cores, spacing, sombra, radii. 2. Revisar componentes para usar tokens ou utilitários. 3. Implementar variantes dark/light consistentes.                                                                                                | Médio   |
| **Observabilidade/Estados**  | 1. Avaliar `signal` + `toSignal` para dados HTTP. 2. Centralizar estados transientes (loading/error) no `FormShellComponent`.                                                                                                                                              | Pequeno |

## 4) Exemplos “antes → depois”

### Template (`@if/@for` + `@defer`)

**Antes** (`return-units.component.html`):

```html
<select class="form-select" [(ngModel)]="filtroLaboratorio">
  <option value="">Todos os laboratorios</option>
  @for (lab of labs; track lab.id) {
  <option [value]="lab.id">{{ lab.tradeName }}</option>
  }
</select>
<div class="table-responsive table-card">
  <table class="table align-middle table-nowrap">
    <tbody>
      @for (row of tableData; track row) {
      <tr>
        ...
      </tr>
      } @if (carregando) {
      <tr>
        <td colspan="7">...</td>
      </tr>
      }
    </tbody>
  </table>
</div>
```

**Depois** (sugestão):

```html
<app-laboratory-filter
  [state]="filters().laboratory"
  (stateChange)="updateLaboratory($event)"
></app-laboratory-filter>
@defer (when !loading()) placeholder { <app-loading-state type="table"></app-loading-state> }
@loading { <app-loading-state type="table"></app-loading-state> } @error (let err) {
<app-empty-state i18n-message="returnUnits.error" [message]="err"></app-empty-state> } @placeholder
{ <app-loading-state type="table"></app-loading-state> } @if (tableRows().length) {
<table class="sf-table sf-table--striped">
  <tbody>
    @for (row of tableRows(); track row.id) {
    <tr>
      ...
    </tr>
    }
  </tbody>
</table>
} @else {
<app-empty-state i18n-message="returnUnits.empty"></app-empty-state>
}
```

### Form (`FormBuilder.nonNullable` + mensagens)

**Antes** (`return-unit-upsert.component.ts`): usa `FormGroup` genérico sem typing e validação centralizada. 【F:src/app/feature-module/administration/return-units/return-unit-upsert/return-unit-upsert.component.ts†L31-L118】

**Depois** (sugestão):

```ts
interface ReturnUnitForm {
  laboratoryId: FormControl<string>;
  name: FormControl<string>;
  legalName: FormControl<string>;
  tradeName: FormControl<string>;
  document: FormControl<string>;
  stateRegistration: FormControl<string | null>;
  phone: FormControl<string | null>;
  email: FormControl<string | null>;
  observation: FormControl<string | null>;
  isActive: FormControl<boolean>;
  address: FormGroup<AddressForm>;
}

readonly form = this.fb.nonNullable.group<ReturnUnitForm>({
  laboratoryId: this.fb.nonNullable.control('', Validators.required),
  name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
  legalName: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
  tradeName: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
  document: this.fb.nonNullable.control('', [Validators.required, cnpjValidator()]),
  stateRegistration: this.fb.control<string | null>(null, Validators.maxLength(30)),
  phone: this.fb.control<string | null>(null, phoneValidator()),
  email: this.fb.control<string | null>(null, Validators.email),
  observation: this.fb.control<string | null>(null, Validators.maxLength(1000)),
  isActive: this.fb.nonNullable.control(true),
  address: buildAddressGroup(this.fb),
});
```

### CSS (tokens + utilitários)

**Antes**: estilos dispersos sem tokens e com comentários duplicados. 【F:src/styles.scss†L1-L50】

**Depois**:

```scss
// styles/_tokens.scss
$sf-colors: (
  primary: #2563eb,
  primary-contrast: #ffffff,
  surface: #ffffff,
  surface-alt: #f8fafc,
  border: #dbe2ef,
  danger: #dc2626,
);
$sf-spacing: (
  xs: 0.25rem,
  sm: 0.5rem,
  md: 1rem,
  lg: 1.5rem,
  xl: 2rem,
);

// styles.scss
@use 'styles/tokens' as *;
.sf-card {
  border-radius: map-get($sf-radius, md);
  box-shadow: map-get($sf-shadows, sm);
  background-color: map-get($sf-colors, surface);
}
```

### Router/Providers (`app.config.ts`)

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(),
    provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, apiFeedbackInterceptor])),
    provideStore(),
    provideEffects(),
    provideAnimations(),
  ],
};
```

### Interceptor funcional

```ts
export const apiFeedbackInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);
  if (isMutation(req)) {
    notification.clearValidationErrors();
  }
  return next(req).pipe(
    tap((event) => maybeNotifySuccess(event, req, notification)),
    catchError((error: HttpErrorResponse) => {
      if (req.context.get(SKIP_ERROR_TOAST)) {
        return throwError(() => error);
      }
      const normalized = notification.handleHttpError(error);
      return throwError(() => normalized);
    }),
  );
};
```

## 5) Diffs sugeridos

```patch
*** a/src/main.ts
--- b/src/main.ts
@@
-import { enableProdMode } from '@angular/core';
-import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
-
-import { AppModule } from './app/app.module';
-import { environment } from './environments/environment';
-
-if (environment.production) {
-  enableProdMode();
-}
-
-platformBrowserDynamic().bootstrapModule(AppModule)
-  .catch(err => console.error(err));
+import { bootstrapApplication } from '@angular/platform-browser';
+import { AppComponent } from './app/app.component';
+import { appConfig } from './app/app.config';
+
+bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
```

```patch
*** /dev/null
--- b/src/app/app.config.ts
+import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
+import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
+import { provideClientHydration } from '@angular/platform-browser';
+import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
+import { appRoutes } from './app.routes';
+import { apiFeedbackInterceptor } from './core/http/api-feedback.interceptor';
+import { authInterceptor } from './auth/keycloak/token.interceptor';
+
+export const appConfig: ApplicationConfig = {
+  providers: [
+    provideZoneChangeDetection({ eventCoalescing: true }),
+    provideClientHydration(),
+    provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
+    provideHttpClient(withFetch(), withInterceptors([authInterceptor, apiFeedbackInterceptor])),
+  ],
+};
```

```patch
*** a/src/app/core/http/api-feedback.interceptor.ts
--- b/src/app/core/http/api-feedback.interceptor.ts
@@
-import { Injectable } from '@angular/core';
-import {
-  HttpErrorResponse,
-  HttpEvent,
-  HttpHandler,
-  HttpInterceptor,
-  HttpRequest,
-  HttpResponse,
-} from '@angular/common/http';
-import { Observable, catchError, tap, throwError } from 'rxjs';
-import { NotificationService } from '../notifications/notification.service';
-import { SKIP_ERROR_TOAST, SKIP_SUCCESS_TOAST, SUCCESS_MESSAGE } from './http-context.tokens';
-
-@Injectable()
-export class ApiFeedbackInterceptor implements HttpInterceptor {
-  private readonly mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
-
-  constructor(private readonly notification: NotificationService) {}
-
-  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
-    const method = req.method.toUpperCase();
-    if (this.mutationMethods.has(method)) {
-      this.notification.clearValidationErrors();
-    }
-
-    return next.handle(req).pipe(
-      tap(event => {
-        if (event instanceof HttpResponse && this.shouldNotifySuccess(method, req, event)) {
-          const message = this.resolveSuccessMessage(method, req, event);
-          this.notification.clearValidationErrors();
-          this.notification.success(message);
-        }
-      }),
-      catchError((error: HttpErrorResponse) => {
-        if (req.context.get(SKIP_ERROR_TOAST)) {
-          return throwError(() => error);
-        }
-        const normalized = this.notification.handleHttpError(error);
-        return throwError(() => normalized);
-      })
-    );
-  }
+import { inject } from '@angular/core';
+import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
+import { catchError, tap, throwError } from 'rxjs';
+import { NotificationService } from '../notifications/notification.service';
+import { SKIP_ERROR_TOAST, SKIP_SUCCESS_TOAST, SUCCESS_MESSAGE } from './http-context.tokens';
+
+const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
+
+export const apiFeedbackInterceptor: HttpInterceptorFn = (req, next) => {
+  const notification = inject(NotificationService);
+  const method = req.method.toUpperCase();
+
+  if (MUTATION_METHODS.has(method)) {
+    notification.clearValidationErrors();
+  }
+
+  return next(req).pipe(
+    tap((event) => {
+      if (event instanceof HttpResponse && shouldNotifySuccess(method, req, event)) {
+        const message = resolveSuccessMessage(method, req, event);
+        notification.clearValidationErrors();
+        notification.success(message);
+      }
+    }),
+    catchError((error: HttpErrorResponse) => {
+      if (req.context.get(SKIP_ERROR_TOAST)) {
+        return throwError(() => error);
+      }
+      const normalized = notification.handleHttpError(error);
+      return throwError(() => normalized);
+    })
+  );
+};
```

## 6) Snippets reutilizáveis

### `FormShellComponent`

```ts
@Component({
  selector: 'app-form-shell',
  standalone: true,
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
      <ng-content></ng-content>
      <div class="sf-form__actions">
        <button type="button" class="btn btn-outline-secondary" (click)="cancel.emit()">
          {{ cancelLabel }}
        </button>
        @if (!readonly()) {
          <button type="submit" class="btn btn-primary" [disabled]="loading() || form.invalid">
            {{ loading() ? loadingLabel : submitLabel }}
          </button>
        }
      </div>
    </form>
  `,
  imports: [ReactiveFormsModule],
})
export class FormShellComponent<T extends AbstractControl> {
  readonly form = input.required<FormGroup<T>>();
  readonly loading = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly submitLabel = input('Salvar');
  readonly loadingLabel = input('Salvando...');
  readonly cancelLabel = input('Cancelar');
  readonly submitted = signal(false);
  readonly cancel = output<void>();
  readonly submit = output<FormGroup<T>>();

  onSubmit(): void {
    this.submitted.set(true);
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }
    this.submit.emit(this.form());
  }
}
```

### `FormFieldErrorComponent`

```ts
@Component({
  selector: 'app-form-field-error',
  standalone: true,
  template: `
    @if (control().invalid && (control().dirty || control().touched || submitted())) {
      <p class="sf-form-field__error" id="{{ for }}-error">
        {{ resolveMessage() }}
      </p>
    }
  `,
})
export class FormFieldErrorComponent {
  readonly control = input.required<AbstractControl>();
  readonly for = input.required<string>();
  readonly submitted = input<boolean>(false);
  readonly messages = input<Record<string, string>>({ required: $localize`Campo obrigatório.` });

  resolveMessage(): string {
    const errors = this.control().errors ?? {};
    const key = Object.keys(errors)[0];
    return this.messages()[key] ?? $localize`Campo inválido.`;
  }
}
```

### `HttpErrorInterceptor` funcional

```ts
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notifications.error(resolveErrorMessage(error));
      return throwError(() => error);
    }),
  );
};
```

### `LoadingState`

```ts
@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    @switch (type()) {
      @case ('table') {
        <div class="sf-skeleton sf-skeleton--table"></div>
      }
      @case ('form') {
        <div class="sf-skeleton sf-skeleton--form"></div>
      }
      @default {
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Carregando...</span>
        </div>
      }
    }
  `,
})
export class LoadingStateComponent {
  readonly type = input<'table' | 'form' | 'inline'>('inline');
}
```

### `useCrudResource<T>()`

```ts
export function useCrudResource<T>(fetcher: () => Observable<T[]>) {
  const loading = signal(true);
  const error = signal<string | null>(null);
  const data = signal<T[]>([]);

  const refresh = () => {
    loading.set(true);
    error.set(null);
    fetcher().subscribe({
      next: (items) => {
        data.set(items);
        loading.set(false);
      },
      error: (err) => {
        error.set(err?.message ?? 'Erro ao carregar dados.');
        loading.set(false);
      },
    });
  };

  refresh();
  return { data, loading, error, refresh };
}
```

## 7) Riscos / Observações

- **Migração para standalone** exige revisar módulos third-party (`ng-bootstrap`, `ngx-pipes`, `primeng`). Confirmar se oferecem providers standalone ou avaliar lazy providers separados. 【F:src/app/app.module.ts†L1-L85】
- **SSR/Hidratação**: validar compatibilidade de bibliotecas que manipulam `window/document` (ex.: `ngx-csv`, `sweetalert2`) e aplicar `isPlatformBrowser` quando necessário.
- **Máscaras/validações**: caso não exista biblioteca atual, considerar diretivas customizadas para CPF/CNPJ/CEP antes de adicionar dependências.
- **Estado legado NgRx**: ajustar bootstrap via `provideStore`/`provideEffects` mantendo slices existentes.
- **Internacionalização**: revisar `TranslateModule` para inicializar via `provideTranslate` (ou alternativa) sem `NgModule`.

## 8) Checklist final

- [ ] Standalone + `bootstrapApplication` configurados.
- [ ] Rotas tipadas com `provideRouter` e view transitions.
- [ ] Forms de cadastros usando `FormShellComponent`, `FormFieldErrorComponent` e validação consistente.
- [ ] Campos com labels, placeholders e mensagens acentuados e traduzidos.
- [ ] Componentes de filtro/lista com `@if/@for`, `@defer` e estados padronizados (`LoadingState`).
- [ ] Interceptors funcionais registrados via `provideHttpClient(withInterceptors)`.
- [ ] Tokens de design (`styles/_tokens.scss`) aplicados.
- [ ] Testes unitários para forms, services e rotas atualizados para standalone.
