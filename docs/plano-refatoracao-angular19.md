# Plano de Padronização Angular 19

## 1) **Diagnóstico resumido**
| Tela / Domínio | Principais divergências |
| --- | --- |
| `account/register` (Cadastro de usuário) | Usa `UntypedFormGroup` e `UntypedFormBuilder`; sem standalone; campos sem máscaras/validações coerentes; mensagens duplicadas e em inglês; submissão ignora estado inválido. 【F:src/app/account/register/register.component.ts†L1-L96】 |
| `pages/ecommerce/add-product` (Cadastro de produto) | Template extensivo com inputs soltos, sem formulário reativo, sem acessibilidade ou i18n; mistura `ngbNav` e componentes externos sem lazy; campos e textos em inglês. 【F:src/app/pages/ecommerce/add-product/add-product.component.html†L1-L200】 |
| `feature/administration/laboratories/laboratory-upsert` | Apesar de standalone, mantém strings sem acento ("Laboratorio"), validação duplicada e sem tipos estritos; falta componetização para estados e mensagens. 【F:src/app/feature-module/administration/laboratories/laboratory-upsert/laboratory-upsert.component.ts†L1-L170】 |
| `feature/administration/projects/project-upsert` | Estrutura semelhante, porém textos divergentes e sem i18n; ausência de máscaras e validações específicas por campo; ordenação de campos difere de laboratórios. 【F:src/app/feature-module/administration/projects/project-upsert/project-upsert.component.ts†L1-L200】 |
| `feature/administration/return-units/return-unit-upsert` | Campos endereços sem máscaras, estados carregados manualmente, mensagens hardcoded; ordem de campos difere das demais telas; títulos sem acentuação. 【F:src/app/feature-module/administration/return-units/return-unit-upsert/return-unit-upsert.component.ts†L1-L200】 |
| Listagens relacionadas (`projects`, `return-units`) | Filtros `[(ngModel)]` misturados com forms reativos; duplicação de select de laboratórios; colunas com acentuação incorreta ("Laboratorio"). 【F:src/app/feature-module/administration/projects/projects/projects.component.html†L43-L113】【F:src/app/feature-module/administration/return-units/return-units/return-units.component.html†L43-L113】 |
| Global (`styles.scss`, roteamento, interceptors) | SCSS com estilos soltos, sem tokens; `AppModule` ainda presente; interceptors classe-based com DI tradicional; ausência de `provideRouter` com rotas tipadas; problemas de acentuação em breadcrumbs ("Laboratrios"). 【F:src/styles.scss†L1-L76】【F:src/app/app.module.ts†L1-L104】【F:src/app/layouts/sidebar/menu.ts†L22-L35】【F:src/app/feature-module/administration/laboratories/laboratories/laboratories.component.html†L1-L9】

## 2) **Padrões propostos**
1. **Arquitetura standalone**: migrar `AppModule`/`feature-module` para `app.config.ts` com `provideRouter`, `withComponentInputBinding`, `withViewTransitions`, SSR (`provideClientHydration`) e `provideHttpClient(withInterceptors([...]))` com interceptors funcionais.
2. **Camada de formulários**: adotar `FormBuilder.nonNullable`, `FormGroup` tipados (`type FormModel = ReturnType<...>`), validações centralizadas e mensagens via `FormFieldErrorComponent` reutilizável.
3. **Fluxo de template**: substituir `*ngIf/*ngFor` por `@if/@for`, usar `@defer` para grids, centralizar estados (loading/empty/error) em `LoadingStateComponent`.
4. **Design tokens**: definir `tokens.scss` com cores/tipografia/spacing; componentes usam BEM (`.form-shell__actions`).
5. **i18n e acentuação**: textos em pt-BR via `i18n` pipe (`{{ 'cadastro.produto.titulo' | i18n }}`) e correção de caracteres.
6. **Serviços/HTTP**: converter interceptors para funções (`export const httpErrorInterceptor = (req, next) => ...`), consolidar `useCrudResource<T>()` com sinais e `HttpClient` tipado.
7. **Padronização de cadastros**: componentes `FormShellComponent` e `FormFieldComponent` (label + input + hint + erro), ações fixas (Salvar/Cancelar) com ícones.
8. **Testes mínimos**: `*.spec.ts` com `TestBed` standalone, validando formulários e interceptors.

## 3) **Plano de refatoração por feature**
1. **Base do app (Grande)**
   - Criar `app.config.ts` com `provideRouter`, interceptors funcionais e `provideClientHydration`.
   - Remover `AppModule`, migrar providers e bootstrap via `bootstrapApplication`.
   - Configurar `prettier` + `lint-staged` e scripts (`format`, `lint`).
2. **Design System (Médio)**
   - Criar `src/app/shared/ui/form-shell` com tokens SCSS e componentes reutilizáveis.
   - Normalizar `styles.scss` para importar tokens/utilitários.
3. **Cadastros Administração (Grande)**
   - `Laboratory`, `Project`, `ReturnUnit`: alinhar estrutura de formulário (ordem, labels, validações), i18n e uso de `FormShellComponent`; extrair selects compartilhados (laboratory combo) para componente.
   - Ajustar listagens para usar componentes de estado e `@defer`.
4. **Cadastros Ecommerce/Account (Médio)**
   - Reescrever `register`, `add-product` com forms reativos tipados, i18n e padronização de mensagens.
   - Criar máscara directives (CPF/CNPJ, CEP, telefone) reutilizáveis.
5. **Services/Interceptors (Médio)**
   - Converter interceptors para funções, eliminar `HTTP_INTERCEPTORS` array.
   - Implementar `useCrudResource<T>()` para encapsular chamadas e sinais (loading/error/data).
6. **Automação/Testes (Pequeno)**
   - Adicionar testes unitários para formulários (validadores) e interceptors funcionais.
   - Configurar Git hooks via Husky (opcional) para format/lint.

## 4) **Exemplos “antes → depois”**
### Template (`laboratory-upsert`)
- **Antes**
  ```html
  <h5 class="card-title mb-0">Lista de Laboratrios</h5>
  <button type="button" class="btn btn-success" (click)="save()">Salvar</button>
  ```
- **Depois**
  ```html
  <app-form-shell title="{{ 'laboratory.form.title' | i18n }}" [loading]="loading()">
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      @for (field of fields; track field.controlName) {
        <app-form-field [config]="field"></app-form-field>
      }
      <app-form-shell-actions (cancel)="onCancel()"></app-form-shell-actions>
    </form>
  </app-form-shell>
  ```

### Form (`register.component.ts`)
- **Antes**
  ```ts
  this.signupForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required]],
    password: ['', Validators.required],
  });
  ```
- **Depois**
  ```ts
  type RegisterFormModel = {
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
  };

  readonly form = this.fb.nonNullable.group<RegisterFormModel>({
    name: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    email: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.email],
    }),
    password: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(8)],
    }),
  });
  ```

### CSS / Tokens
- **Antes**
  ```scss
  .card-title {
    color: #3577f1;
  }
  ```
- **Depois**
  ```scss
  @use 'src/styles/tokens' as tokens;

  .form-shell {
    &__title {
      color: tokens.$color-primary-600;
      margin-bottom: tokens.$space-6;
    }
  }
  ```

### Router / Providers
- **Antes**
  ```ts
  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
  })
  export class AppRoutingModule {}
  ```
- **Depois**
  ```ts
  export const appConfig: ApplicationConfig = {
    providers: [
      provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
      provideClientHydration(),
      provideHttpClient(withInterceptors([authInterceptor, httpErrorInterceptor])),
    ],
  };
  ```

### Interceptor funcional
- **Antes**
  ```ts
  @Injectable()
  export class ApiFeedbackInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<unknown>, next: HttpHandler) {
      return next.handle(req).pipe(tap({ error: (err) => notify(err) }));
    }
  }
  ```
- **Depois**
  ```ts
  export const apiFeedbackInterceptor: HttpInterceptorFn = (req, next) =>
    next(req).pipe(
      tap({
        error: (error) => inject(NotificationService).error(mapHttpError(error)),
      })
    );
  ```

## 5) **Diffs sugeridos**
```patch
*** a/src/app/account/register/register.component.ts
--- b/src/app/account/register/register.component.ts
@@
-import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
+import { FormBuilder, FormControl, Validators } from '@angular/forms';
@@
-  signupForm!: UntypedFormGroup;
+  readonly form = this.fb.nonNullable.group({
+    name: this.fb.nonNullable.control('', {
+      validators: [Validators.required, Validators.maxLength(120)],
+    }),
+    email: this.fb.nonNullable.control('', {
+      validators: [Validators.required, Validators.email],
+    }),
+    password: this.fb.nonNullable.control('', {
+      validators: [Validators.required, Validators.minLength(8)],
+    }),
+  });
@@
-    this.authenticationService.register(this.f['email'].value, this.f['name'].value, this.f['password'].value)
+    if (this.form.invalid) {
+      this.form.markAllAsTouched();
+      return;
+    }
+
+    const { email, name, password } = this.form.getRawValue();
+    this.authenticationService.register(email, name, password)
       .pipe(first())
       .subscribe({
         next: () => this.router.navigate(['/auth/login']),
-        error: (error: any) => {
-          this.error = error ? error : '';
-        }
+        error: (error: any) => (this.error = error ?? ''),
       });
```

```patch
*** a/src/app/pages/ecommerce/add-product/add-product.component.html
--- b/src/app/pages/ecommerce/add-product/add-product.component.html
@@
-    <form>
-        <div class="card">
-            <div class="card-body">
-                <div class="mb-3">
-                    <label class="form-label" for="product-title-input">Product Title</label>
-                    <input type="text" class="form-control" id="product-title-input" placeholder="Enter product title">
-                </div>
-                <div>
-                    <label>Product Description</label>
-                    <ckeditor [editor]="Editor" data="..."></ckeditor>
-                </div>
-            </div>
-        </div>
-        <!-- ... -->
-    </form>
+    <app-form-shell
+      title="{{ 'ecommerce.product.create.title' | i18n }}"
+      subtitle="{{ 'ecommerce.product.create.subtitle' | i18n }}"
+      [loading]="loading()"
+    >
+      <form [formGroup]="form" (ngSubmit)="onSubmit()" autocomplete="off">
+        @for (section of sections; track section.id) {
+          <app-form-section [config]="section"></app-form-section>
+        }
+        <app-form-shell-actions (cancel)="onCancel()"></app-form-shell-actions>
+      </form>
+    </app-form-shell>
```

```patch
*** a/src/app/app.module.ts
--- /dev/null
@@
-@NgModule({
-  declarations: [AppComponent],
-  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
-  providers: [
-    { provide: HTTP_INTERCEPTORS, useClass: AccessControlInterceptor, multi: true },
-    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
-    provideHttpClient(withInterceptorsFromDi()),
-  ],
-  bootstrap: [AppComponent],
-})
-export class AppModule {}
```

```patch
*** /dev/null
--- b/src/app/app.config.ts
@@
+import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
+import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
+import { provideClientHydration } from '@angular/platform-browser';
+import { provideHttpClient, withInterceptors } from '@angular/common/http';
+import { appRoutes } from './app.routes';
+import { authInterceptor } from './core/http/auth.interceptor';
+import { apiFeedbackInterceptor } from './core/http/api-feedback.interceptor';
+
+export const appConfig: ApplicationConfig = {
+  providers: [
+    provideZoneChangeDetection({ eventCoalescing: true }),
+    provideRouter(appRoutes, withComponentInputBinding(), withViewTransitions()),
+    provideClientHydration(),
+    provideHttpClient(withInterceptors([authInterceptor, apiFeedbackInterceptor])),
+  ],
+};
```

## 6) **Snippets reutilizáveis**
```ts
// form-shell.component.ts
@Component({
  selector: 'app-form-shell',
  standalone: true,
  templateUrl: './form-shell.component.html',
  styleUrls: ['./form-shell.component.scss'],
})
export class FormShellComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input() loading = false;
}
```

```ts
// form-field-error.component.ts
@Component({
  selector: 'app-form-field-error',
  standalone: true,
  template: `
    @if (control.invalid && (control.dirty || control.touched)) {
      <ul class="form-field-error" role="alert" [attr.aria-live]="'polite'">
        @for (error of errors(); track error) {
          <li>{{ error | i18n }}</li>
        }
      </ul>
    }
  `,
})
export class FormFieldErrorComponent {
  private i18n = inject(I18nService);
  @Input({ required: true }) control!: AbstractControl;
  errors = computed(() => this.i18n.resolveErrors(this.control.errors));
}
```

```ts
// http-error.interceptor.ts
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      inject(NotificationService).error(mapHttpError(error));
      return throwError(() => error);
    })
  );
```

```ts
// loading-state.component.ts
@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    @switch (state()) {
      @case ('loading') { <app-skeleton></app-skeleton> }
      @case ('error') {
        <div class="state state--error">
          {{ message | i18n }}
          <button type="button" class="btn btn-link" (click)="retry.emit()">{{ 'acoes.tentarNovamente' | i18n }}</button>
        </div>
      }
      @case ('empty') { <div class="state state--empty">{{ emptyMessage | i18n }}</div> }
    }
  `,
})
export class LoadingStateComponent {
  state = signal<'loading' | 'error' | 'empty' | 'content'>('content');
  @Input() message = 'estado.erro.generico';
  @Input() emptyMessage = 'estado.vazio.generico';
  @Output() retry = new EventEmitter<void>();
}
```

```ts
// use-crud-resource.ts
export function useCrudResource<T>(source: () => Observable<T>) {
  const data = signal<T | null>(null);
  const loading = signal(false);
  const error = signal<unknown>(null);

  const refresh = () => {
    loading.set(true);
    error.set(null);
    source()
      .pipe(finalize(() => loading.set(false)))
      .subscribe({
        next: (value) => data.set(value),
        error: (err) => error.set(err),
      });
  };

  return { data: readonlySignal(data), loading: readonlySignal(loading), error: readonlySignal(error), refresh };
}
```

## 7) **Riscos / observações**
- Migração para standalone exige atualizar todos os imports/rotas; planejar sprint específica.
- Interceptores funcionais dependem do Angular 16+; confirmar versão real do projeto antes da migração.
- `ckeditor`, `dropzone`, `flatpickr` precisam de wrappers compatíveis com SSR e `@defer`.
- Possível impacto nos testes E2E devido a novos componentes/layout.
- Charsets: garantir `meta charset="utf-8"` e que arquivos estejam em UTF-8; revisar dados vindos da API (ex.: labels "Laboratórios").

## 8) **Checklist final**
- [ ] App configurado via `app.config.ts` com providers modernos.
- [ ] Formulários reescritos com `FormShellComponent` + mensagens padronizadas.
- [ ] Campos e mensagens revisados com i18n pt-BR e acentuação correta.
- [ ] Interceptores funcionais registrados com `provideHttpClient(withInterceptors([...]))`.
- [ ] Estados de loading/erro/vazio unificados (`LoadingStateComponent`).
- [ ] Scripts `format`/`lint` com Prettier executando no CI.
- [ ] Testes unitários mínimos para formulários e interceptors.
