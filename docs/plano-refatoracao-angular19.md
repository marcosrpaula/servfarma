# Plano de padronização e refatoração Angular 19

## 1) Diagnóstico resumido

| Tela / Feature                                                  | Divergências principais                                                                                                                                                                                                                                   |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bancos – Cadastro (`bank-upsert`)                               | Formulário não tipado (`FormGroup` genérico), mensagens de validação duplicadas por campo, uso de `*ngIf/*ngFor`, ausência de máscaras e tokens de estilo compartilhados.                                                                                 |
| Transportadoras – Cadastro (`courier-company-upsert`)           | Estrutura de endereço diferente das demais telas (campos opcionais obrigatórios na prática), validações inconsistentes (CEP sem máscara, ausência de mensagens), mistura de controle de fluxo novo/antigo, carregamento de listas sem estados de loading. |
| Laboratórios – Cadastro (`laboratory-upsert`)                   | Sem reaproveitamento de componente de erros, não utiliza `formControlName` camelCase alinhado, faltam máscaras de documento e mensagens padrão.                                                                                                           |
| Unidades – Cadastro (`unit-upsert`)                             | Apenas validação requerida, sem feedback de erro, não aplica helpers de acessibilidade (`aria-*`), mantém layout distinto (sem grid 12 colunas nos campos secundários).                                                                                   |
| App shell (`main.ts`, `app.module.ts`, `app-routing.module.ts`) | Arquitetura baseada em NgModule, roteamento sem `provideRouter`/view transitions, interceptors orientados a classe, ausência de SSR/hidratação e form shell reutilizável.                                                                                 |
| Styles globais (`styles.scss`)                                  | Não há design tokens centralizados (cores, tipografia, espaçamento), mix de estilos específicos com bootstrap puro, ausência de convenção BEM/utilitários.                                                                                                |

## 2) Padrões propostos

1. **Arquitetura Angular 19** – Migrar bootstrap para `bootstrapApplication` com `provideRouter` (rotas tipadas, `withComponentInputBinding`, `withViewTransitions`) e `provideClientHydration`.
2. **Form Shell Standalone** – Criar `FormShellComponent` com header, estado `@if (isSaving())`, slots para ações e uso uniforme em cadastros.
3. **Forms Reativos Tipados** – Usar `FormBuilder.nonNullable` + tipos inferidos (`type BankForm = ReturnType<typeof bankFormFactory>`), máscaras via directives dedicadas.
4. **Controle de Fluxo Moderno** – Substituir `*ngIf/*ngFor` por `@if/@for` e `@switch`; aplicar `@defer` para tabelas e combos pesados.
5. **Estado & Mensagens** – Centralizar mensagens (erro, sucesso, vazio) em componente `FormFieldErrorComponent` + serviço `NotificationService` com sinais.
6. **Design Tokens SCSS** – Definir mapa de cores, tipografia, espaçamentos e radius em `_tokens.scss`, usar mixins/utilitários BEM (ex.: `.form-shell__footer`).
7. **HTTP Funcional** – Converter interceptors para funções (`provideHttpClient(withInterceptors([...]))`), incluir `HttpErrorInterceptor` com normalização.
8. **A11y & i18n** – Labels com `for/id`, `aria-invalid`, `aria-describedby`, textos via `i18n` pipe e assets `pt-BR`.
9. **Testes** – Implementar testes unitários para forms (validadores), services (HTTP + interceptores) e rotas (guards/resolvers) usando `TestBed` standalone.

## 3) Plano de refatoração por feature

### 3.1 Administração / Bancos (Esforço: Médio)

1. Criar `bank.routes.ts` com `provideState` e lazy `@defer` para listagem.
2. Extrair `bankFormFactory` tipado com `FormBuilder.nonNullable`.
3. Substituir mensagens inline por `<app-form-field-error>`, aplicar máscaras (código numérico) e tokens de layout.
4. Cobrir com testes de validação e service mockado.

### 3.2 Administração / Transportadoras (Esforço: Grande)

1. Normalizar endereço com `AddressFormGroup` compartilhado.
2. Implementar carregamento de estados/cidades com `@defer` + `LoadingState` skeleton.
3. Padronizar ações (Salvar/Cancelar) no `FormShellComponent` e mensagens centralizadas.
4. Adicionar máscaras para CEP e documento, diretrizes `aria-live` para erros.
5. Testes para resolver dependências (`locations` fetcher) e comportamento do formulário.

### 3.3 Administração / Laboratórios (Esforço: Médio)

1. Aplicar form tipado e máscara de CNPJ/CPF via directive.
2. Reutilizar `FormShellComponent` com tokens.
3. Adotar mensagens padronizadas e `@if` no template.
4. Criar testes para validar campos obrigatórios e interceptar HTTP.

### 3.4 Administração / Unidades (Esforço: Pequeno)

1. Reutilizar form shell com grid 12 colunas.
2. Adicionar mensagens de erro e validação mínima/máxima.
3. Garantir acessibilidade (`aria-invalid`, foco em erro).
4. Teste simples de formulário.

### 3.5 App Shell e Core (Esforço: Grande)

1. Migrar `main.ts` para `bootstrapApplication`, remover `AppModule`.
2. Definir `app.config.ts` com providers: `provideRouter`, `provideHttpClient(withInterceptors([...]))`, `provideClientHydration`, guards funcionais.
3. Converter interceptors (`TokenInterceptor`, `AccessControlInterceptor`, `SnakeCaseInterceptor`, `ApiFeedbackInterceptor`) para funções puras.
4. Criar roteamento por feature (`feature/administration/banks/routes.ts`, etc.) com `withComponentInputBinding`.
5. Configurar SSR (Angular Universal) e avaliar modo zoneless + sinais.

### 3.6 Design System (Esforço: Médio)

1. Criar pasta `src/styles/tokens/` com `_colors.scss`, `_spacing.scss`, `_typography.scss`.
2. Implementar utilitários (mixins BEM) e substituir classes custom inline.
3. Padronizar `status-toggle` como componente com tokens.
4. Testar contraste (WCAG AA) e ajustar.

## 4) Exemplos “antes → depois”

### 4.1 Template (`bank-upsert.component.html`)

```patch
@@
-        <div class="card-body">
-          <div class="row g-3">
-            <div class="col-md-6">
-              <label class="form-label">Nome <span class="text-danger">*</span></label>
-              <input
-                formControlName="name"
-                type="text"
-                class="form-control"
-                placeholder="Nome do banco"
-                [readonly]="isReadOnly()"
-                [class.is-invalid]="showInvalid('name')"
-              />
-              <div class="invalid-feedback d-block" *ngFor="let message of controlMessages('name')">
-                {{ message }}
-              </div>
-            </div>
+        <div class="card-body form-shell__body">
+          <div class="row g-3">
+            <div class="col-12 col-md-6">
+              <app-form-field
+                fieldId="bank-name"
+                label="{{ 'administration.banks.fields.name' | i18n }}"
+                required
+                [control]="form.controls.name"
+                [readonly]="isReadOnly()"
+              />
             </div>
@@
-            <div class="alert alert-danger mt-3" *ngIf="formLevelMessages().length">
-              <ul class="mb-0 ps-3">
-                <li *ngFor="let message of formLevelMessages()">{{ message }}</li>
-              </ul>
-            </div>
+            @if (formShellState.formErrors().length) {
+              <app-form-messages [messages]="formShellState.formErrors()" tone="error" />
+            }
         </div>
@@
-        <div class="card-footer d-flex justify-content-end gap-2 flex-wrap">
-          <button type="button" class="btn btn-outline-secondary" (click)="cancel()">Voltar</button>
-          <button
-            *ngIf="!isReadOnly()"
-            type="submit"
-            class="btn btn-primary"
-            [disabled]="isSaving() || form.invalid"
-          >
-            Salvar
-          </button>
-        </div>
+        <app-form-shell-footer
+          primaryLabel="{{ 'common.save' | i18n }}"
+          secondaryLabel="{{ 'common.cancel' | i18n }}"
+          [isPrimaryDisabled]="form.invalid || isSaving()"
+          [isReadOnly]="isReadOnly()"
+          (secondaryAction)="cancel()"
+        />
```

### 4.2 Form tipado (`bank-upsert.component.ts`)

```patch
@@
-import { Component, OnInit, computed, inject, signal } from '@angular/core';
-import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
+import { Component, OnInit, computed, inject, signal } from '@angular/core';
+import { FormBuilder, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
@@
-  readonly form: FormGroup = this.fb.group({
-    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
-    bankCode: ['', [Validators.required, Validators.maxLength(10)]],
-    isActive: [true],
-  });
+  private readonly fb = inject(NonNullableFormBuilder);
+
+  readonly form = this.fb.group({
+    name: this.fb.control('', { validators: [Validators.required, Validators.minLength(2), Validators.maxLength(80)] }),
+    bankCode: this.fb.control('', { validators: [Validators.required, Validators.maxLength(10)] }),
+    isActive: this.fb.control(true),
+  });
+
+  readonly formShellState = injectFormShellState(this.form);
@@
-    if (this.form.invalid) {
-      this.form.markAllAsTouched();
-      return;
-    }
+    if (this.form.invalid) {
+      this.formShellState.touchAll();
+      return;
+    }
```

### 4.3 CSS (`_form-shell.scss`)

```patch
+@use 'sass:map';
+@use '../tokens/colors' as colors;
+@use '../tokens/spacing' as spacing;
+
+.form-shell {
+  &__body {
+    padding: map.get(spacing.$scale, md);
+  }
+
+  &__footer {
+    display: flex;
+    justify-content: flex-end;
+    gap: map.get(spacing.$scale, sm);
+    padding: map.get(spacing.$scale, md);
+    background-color: colors.token(surface-subtle);
+  }
+}
```

### 4.4 Router / Providers (`app.config.ts`)

```patch
+import { ApplicationConfig } from '@angular/core';
+import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
+import { provideHttpClient, withInterceptors } from '@angular/common/http';
+import { appRoutes } from './app.routes';
+import { provideClientHydration } from '@angular/platform-browser';
+import { tokenInterceptor, snakeCaseInterceptor, accessControlInterceptor, apiFeedbackInterceptor } from './core/http/interceptors';
+
+export const appConfig: ApplicationConfig = {
+  providers: [
+    provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
+    provideHttpClient(withInterceptors([tokenInterceptor, snakeCaseInterceptor, accessControlInterceptor, apiFeedbackInterceptor])),
+    provideClientHydration(),
+  ],
+};
```

### 4.5 Interceptor funcional (`token.interceptor.ts`)

```patch
-import { Injectable } from '@angular/core';
-import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
-import { Observable } from 'rxjs';
-import { AuthService } from '../auth.service';
-
-@Injectable()
-export class TokenInterceptor implements HttpInterceptor {
-  constructor(private readonly auth: AuthService) {}
-
-  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
-    const token = this.auth.getToken();
-    if (!token) {
-      return next.handle(req);
-    }
-    const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
-    return next.handle(cloned);
-  }
-}
+import { HttpInterceptorFn } from '@angular/common/http';
+import { inject } from '@angular/core';
+import { AuthService } from '../auth.service';
+
+export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
+  const auth = inject(AuthService);
+  const token = auth.getToken();
+  if (!token) {
+    return next(req);
+  }
+  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
+};
```

## 5) Diffs por arquivo

- `src/app/feature-module/administration/banks/bank-upsert/bank-upsert.component.html` – ver Diff 4.1.
- `src/app/feature-module/administration/banks/bank-upsert/bank-upsert.component.ts` – ver Diff 4.2.
- `src/styles/components/_form-shell.scss` – ver Diff 4.3.
- `src/app/app.config.ts` – ver Diff 4.4.
- `src/app/auth/keycloak/token.interceptor.ts` – ver Diff 4.5.

## 6) Snippets reutilizáveis

### 6.1 `FormShellComponent`

```ts
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
  contentChildren,
  TemplateRef,
  QueryList,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-shell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-shell.component.html',
  styleUrls: ['./form-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormShellComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() busy = false;
  @Input() readOnly = false;
  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
}
```

### 6.2 `FormFieldErrorComponent`

```ts
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  template: `
    @if (messages().length) {
      <ul class="form-field-error" role="alert" aria-live="assertive">
        @for (msg of messages(); track msg) {
          <li>{{ msg }}</li>
        }
      </ul>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldErrorComponent {
  @Input({ required: true }) control!: AbstractControl | null;
  readonly messages = toSignal(
    this.control?.statusChanges.pipe(map(() => this.resolveMessages(this.control))) ?? [],
    { initialValue: this.resolveMessages(this.control) },
  );

  private resolveMessages(control: AbstractControl | null): string[] {
    if (!control || !(control.dirty || control.touched) || !control.errors) {
      return [];
    }
    const mapErrors: Record<string, string> = {
      required: $localize`Campo obrigatório`,
      email: $localize`E-mail inválido`,
      minlength: $localize`Quantidade mínima não atendida`,
      maxlength: $localize`Quantidade máxima excedida`,
    };
    return Object.entries(control.errors).map(
      ([key, value]) => mapErrors[key] ?? value?.message ?? value,
    );
  }
}
```

### 6.3 `HttpErrorInterceptor`

```ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationService } from '../notifications/notification.service';

export const httpErrorInterceptor: HttpInterceptorFn = async (req, next) => {
  try {
    return await next(req);
  } catch (error: any) {
    const notifications = inject(NotificationService);
    notifications.error(error?.message ?? $localize`Erro inesperado`);
    throw error;
  }
};
```

### 6.4 `LoadingState`

```ts
import { signal } from '@angular/core';

export function createLoadingState() {
  const isLoading = signal(false);
  const withLoading = async <T>(operation: () => Promise<T>) => {
    isLoading.set(true);
    try {
      return await operation();
    } finally {
      isLoading.set(false);
    }
  };
  return { isLoading, withLoading };
}
```

### 6.5 `useCrudResource<T>()`

```ts
import { computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export function useCrudResource<T>(initialValue?: T) {
  const router = inject(Router);
  const entity = signal<T | null>(initialValue ?? null);
  const isNew = computed(() => !entity());

  const set = (value: T | null) => entity.set(value);
  const navigateBack = (url: string) => router.navigate([url]);

  return { entity, isNew, set, navigateBack };
}
```

## 7) Riscos e observações

- Migração para Angular 19 exige atualização de dependências e possíveis ajustes em libs terceiras (ex.: Keycloak, componentes Bootstrap customizados).
- Ativar SSR/hidratação implica revisar chamadas diretas ao `window/history` (presentes em diversas telas) para garantir execução apenas no browser.
- Uso de modo zoneless requer avaliar dependências que ainda assumem Zone.js; iniciar por módulos isolados.
- Manter compatibilidade com API atual – qualquer ajuste em payload (ex.: normalização de endereço) deve ser pactuado com backend.

## 8) Checklist final

- [ ] Form shell unificado aplicado.
- [ ] Forms tipados com máscaras e validações padronizadas.
- [ ] Mensagens e estados centralizados (`FormFieldError`, `LoadingState`).
- [ ] Router configurado com `provideRouter`, `withComponentInputBinding`, `withViewTransitions`.
- [ ] Interceptores funcionais registrados via `provideHttpClient(withInterceptors)`.
- [ ] Tokens de design SCSS criados e aplicados.
- [ ] Testes unitários para forms, serviços e rotas implantados.
- [ ] SSR/hidratação e (opcional) modo zoneless avaliados.
