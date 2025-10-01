# servfarma

## Autenticação com Keycloak

O projeto está configurado para utilizar o Keycloak como provedor de autenticação.

### Pré-requisitos

1. Um servidor Keycloak acessível a partir da aplicação Angular.
2. Um **Realm** e um **Client** configurados para o front-end do Servfarma.

### Configuração

Edite os arquivos `src/environments/environment.ts` e `src/environments/environment.prod.ts` para informar a URL do servidor, o realm e o client ID gerado no Keycloak:

```ts
export const environment = {
  production: false,
  defaultauth: 'keycloak',
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'servfarma',
    clientId: 'servfarma-frontend',
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256'
    }
  }
};
```

### Executando

1. Inicie o servidor Keycloak.
2. `npm install`
3. `npm start`

A aplicação irá redirecionar automaticamente para a tela de login do Keycloak quando o usuário não estiver autenticado e reaproveitará o token em todas as requisições HTTP.
