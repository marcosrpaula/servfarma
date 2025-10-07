# Padronização de Cadastros ServFarma

## 1) **Diagnóstico resumido**
| Tela | Divergências principais |
| --- | --- |
| Laboratórios – cadastrar/editar (`laboratory-upsert`) | Uso de `*ngIf`/`*ngFor` ao invés de `@if/@for`; ausência de `novalidate`; mensagens de erro locais duplicadas; título/status sem i18n e campos sem máscara/validação específica de CPF/CNPJ; loading apenas em botão sem feedback global. |
| Transportadoras – cadastrar/editar (`courier-company-upsert`) | Tratamento manual de estados/cidades com subscribe sem `takeUntil`; botão "Salvar" alterna texto manualmente; validações opcionais inconsistentes; layout do endereço com labels diferentes; exibe mensagem de erro inline distinta das demais. |
| Usuários – cadastrar/editar (`user-upsert`) | Mistura Bootstrap + Angular Material; tabela de permissões com `*ngFor`; ausência de read-only/view; validação custom sem mensagem centralizada; loading apenas em botão; sem `novalidate`; strings com acentuação corrompida no TS. |

Outros cadastros seguem padrões semelhantes com variação de labels, ordem de campos e estados de loading.

## 2) **Padrões propostos**
1. **Arquitetura Angular 19**: migrar para `bootstrapApplication` com `provideRouter` (rotas tipadas, `withComponentInputBinding`, `withViewTransitions`) e remover NgModules.
2. **Form Shell unificado**: componente standalone `FormShellComponent` com slots (header, body, footer) e sinais (`loading`, `readOnly`, `error`).
3. **Controle de fluxo declarativo**: substituir `*ngIf/*ngFor` por `@if/@for/@switch`; usar `@defer` para grids/listas pesadas.
4. **Estados de requisição padronizados**: serviço/utilitário `useCrudResource<T>()` expondo `status` (`idle | loading | success | error`) + componente `LoadingStateComponent` com spinner/skeleton.
5. **Formulários reativos tipados**: `FormBuilder.nonNullable`, DTOs tipados, máscaras via directives (`documentMaskDirective`, `phoneMaskDirective`).
6. **Mensagens e i18n**: centralizar strings em arquivo `i18n/pt-BR.json`, usar pipe `i18n` nos templates e componente `FormFieldErrorComponent` para mensagens.
7. **Design tokens/CSS**: definir tokens SCSS (`$spacing-`, `$color-`) e aplicar BEM (`form-shell__header`, etc.), remover Angular Material em cadastros para manter Bootstrap custom.
8. **HTTP**: `provideHttpClient(withInterceptors([ ... ]))` com interceptores funcionais (`httpErrorInterceptor`), tratar snakeCase no adapter em vez de interceptor OO.
9. **SSR & zoneless**: habilitar `provideClientHydration()`, avaliar `provideZoneChangeDetection({ eventCoalescing: true })`, usar sinais em vez de Subjects.

## 3) **Plano de refatoração por feature**
### Core (App bootstrap) – Esforço: Grande
1. Criar `main.ts` com `bootstrapApplication(AppComponent, appConfig)`.
2. Definir `app.config.ts` com `provideRouter(routes, withComponentInputBinding(), withViewTransitions())`, `provideHttpClient(withInterceptors([...]))`, `provideClientHydration()`.
3. Migrar interceptors OO para funções puras.

### Shared – Esforço: Médio
1. Criar `FormShellComponent`, `LoadingStateComponent`, `FormFieldErrorComponent` standalone.
2. Extrair `useCrudResource` (signals + fetch/post/put/delete) no diretório `shared/utils`.
3. Centralizar tokens SCSS em `styles/_tokens.scss` e mixins `styles/_form.scss`.

### Administração > Cadastros – Esforço: Grande
1. Reorganizar por feature `feature/administration/laboratories/{form,list,details}` etc.
2. Refatorar formulários para `FormBuilder.nonNullable`, tipagem (`LaboratoryFormModel`).
3. Aplicar `FormShellComponent` com `LoadingStateComponent` e mensagens padronizadas.
4. Implementar `@if`/`@for` nos templates; adicionar `@defer` para tabelas.
5. Normalizar labels/ordem de campos (dados básicos → contato → endereço → status).
6. Incluir diretivas de máscara (`documentMaskDirective`, `zipCodeMaskDirective`).

### Serviços HTTP – Esforço: Médio
1. Adotar `inject(HttpClient)` + `firstValueFrom` dentro de `useCrudResource` ou manter Observables convertidos para sinais.
2. Criar adapters para DTO ↔ ViewModel (snakeCase ↔ camelCase).

### Testes – Esforço: Médio
1. Criar `*.spec.ts` para `FormShellComponent` (render + slots).
2. Tests de formulário: `LaboratoryFormComponent` – required + validators.
3. Http: mock interceptors com `provideHttpClientTesting()`.
4. Router: rotas com `provideRouter` + `TestBed`.

## 4) **Exemplos “antes → depois”**
### Template (`laboratory-upsert.component.html`)
```patch
@@
-<form [formGroup]="form" (ngSubmit)="save()">
-  <div class="card">
-    <div class="card-header">...</div>
-    <div class="card-body">...</div>
-    <div class="card-footer">...</div>
-  </div>
-</form>
+<app-form-shell
+  [title]="title() | i18n"
+  [subtitle]="'laboratory.form.subtitle' | i18n"
+  [readOnly]="isReadOnly()"
+  [status]="status()"
+  (submitted)="onSubmit()"
+>
+  <ng-container formShellBody>
+    <section class="form-grid">
+      @for (field of laboratoryFields; track field.id) {
+        <app-form-field [config]="field"></app-form-field>
+      }
+    </section>
+  </ng-container>
+  <ng-container formShellFooter>
+    <app-form-actions (cancelled)="onCancel()" />
+  </ng-container>
+</app-form-shell>
```

### Form (`laboratory-upsert.component.ts`)
```patch
@@
-import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
+import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
+import { LaboratoryFormModel } from './laboratory.form-model';
@@
-  form: FormGroup = this.fb.group({
-    tradeName: ['', [Validators.required, Validators.maxLength(100)]],
-    legalName: ['', [Validators.required, Validators.maxLength(100)]],
-    document: ['', [Validators.required]],
-    observation: ['', [Validators.maxLength(1000)]],
-    isActive: [true],
-  });
+  private readonly fb = inject(FormBuilder).nonNullable;
+  readonly form = this.fb.group<LaboratoryFormModel>({
+    tradeName: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)] }),
+    legalName: this.fb.control('', { validators: [Validators.required, Validators.maxLength(100)] }),
+    document: this.fb.control('', { validators: [Validators.required, cnpjOrCpfValidator] }),
+    observation: this.fb.control('', { validators: [Validators.maxLength(1000)] }),
+    isActive: this.fb.control(true),
+  });
@@
-    this.api.update(this.id()!, dto).subscribe({
-      next: (updated) => {
-        this.laboratoriesState.upsert(updated);
-        this.laboratoriesState.updateListItem(updated);
-        navigateToList();
-      },
-      error: failure,
-    });
+    await this.resource.update(dto);
```

### CSS (`laboratory-upsert.component.scss`)
```patch
@@
-.card-body .row.g-3 {
-  margin-bottom: 1rem;
-}
+@use 'src/styles/tokens' as tokens;
+
+.form-grid {
+  display: grid;
+  gap: tokens.$spacing-16;
+  grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
+}
+
+.form-shell__status-toggle {
+  display: flex;
+  align-items: center;
+  gap: tokens.$spacing-8;
+}
```

### Router (`app.config.ts`)
```patch
+import { ApplicationConfig, provideHttpClient } from '@angular/core';
+import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
+import { provideClientHydration } from '@angular/platform-browser';
+import { routes } from './app.routes';
+import { withInterceptors } from '@angular/common/http';
+import { httpErrorInterceptor } from './core/http/http-error.interceptor';
+
+export const appConfig: ApplicationConfig = {
+  providers: [
+    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
+    provideHttpClient(withInterceptors([httpErrorInterceptor])),
+    provideClientHydration(),
+  ],
+};
```

### Interceptor funcional
```patch
+export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
+  next(req).pipe(
+    tap({
+      error: (error) => notificationService().error(mapError(error)),
+    }),
+  );
```

## 5) **Diffs propostos por arquivo**
- `src/app/feature-module/administration/laboratories/laboratory-upsert/laboratory-upsert.component.html`
- `src/app/feature-module/administration/laboratories/laboratory-upsert/laboratory-upsert.component.ts`
- `src/app/feature-module/administration/laboratories/laboratory-upsert/laboratory-upsert.component.scss`
- `src/app/app.config.ts`
- `src/app/core/http/http-error.interceptor.ts`

*(Ver patches ilustrativos acima.)*

## 6) **Snippets reutilizáveis**
### FormShellComponent
```ts
@Component({
  selector: 'app-form-shell',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingStateComponent],
  templateUrl: './form-shell.component.html',
  styleUrls: ['./form-shell.component.scss'],
})
export class FormShellComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  readOnly = input(false);
  status = input<'idle' | 'loading' | 'error' | 'success'>('idle');
  submitted = output<void>();
  cancelled = output<void>();
}
```

### FormFieldErrorComponent
```ts
@Component({
  selector: 'app-form-field-error',
  standalone: true,
  template: `@if (error()) { <p class="form-field-error">{{ error() | i18n }}</p> }`,
})
export class FormFieldErrorComponent {
  private control = input.required<AbstractControl>();
  readonly error = computed(() => mapErrorsToMessage(this.control()));
}
```

### HttpErrorInterceptor funcional
```ts
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    tap({
      error: (err) => inject(NotificationService).error(resolveMessage(err)),
    }),
  );
```

### LoadingState
```ts
@Component({
  selector: 'app-loading-state',
  standalone: true,
  template: `
    @switch (state()) {
      @case ('loading') { <div class="spinner" aria-live="polite"></div> }
      @case ('error') { <div class="alert alert-danger">{{ message() }}</div> }
      @case ('empty') { <p class="text-muted">{{ emptyLabel() | i18n }}</p> }
    }
  `,
  styleUrls: ['./loading-state.component.scss'],
})
export class LoadingStateComponent {
  state = input<'idle' | 'loading' | 'error' | 'empty'>('idle');
  message = input('');
  emptyLabel = input('common.empty');
}
```

### useCrudResource
```ts
export function useCrudResource<T>(options: CrudResourceOptions<T>) {
  const status = signal<ResourceStatus>('idle');
  const error = signal<string | null>(null);

  const run = async <R>(operation: () => Promise<R>) => {
    status.set('loading');
    error.set(null);
    try {
      const result = await operation();
      status.set('success');
      return result;
    } catch (err) {
      status.set('error');
      error.set(resolveMessage(err));
      throw err;
    }
  };

  return {
    status: computed(() => status()),
    error: computed(() => error()),
    async create(dto: T) {
      return run(() => options.create(dto));
    },
    async update(id: string, dto: T) {
      return run(() => options.update(id, dto));
    },
    async remove(id: string) {
      return run(() => options.remove(id));
    },
  };
}
```

## 7) **Riscos/observações**
- Migração para Angular 19 exige atualização de dependências (Angular Material/B. modules) e pode impactar temas existentes.
- Interceptores funcionais dependem do Angular >= 15; validar compatibilidade com bibliotecas externas (Keycloak, PrimeNG).
- SSR/hidratação requer verificação de libs que acessam `window` (Keycloak, charts) – usar `isPlatformBrowser`.
- Remoção de NgRx não prevista; avaliar coexistência com sinais.

## 8) **Checklist final**
- [ ] Ordem dos campos alinhada entre cadastros
- [ ] Labels, placeholders e mensagens centralizadas
- [ ] Validações e máscaras normalizadas
- [ ] Ações Salvar/Cancelar com layout padronizado
- [ ] Estados de loading/erro/sucesso reutilizando componentes padrões
- [ ] Responsividade com grid consistente
- [ ] Acessibilidade (labels/aria) revisada
- [ ] Testes de formulário/serviço/rota implementados
