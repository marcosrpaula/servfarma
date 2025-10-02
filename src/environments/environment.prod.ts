export const environment = {
  production: true,
  defaultauth: 'keycloak',
  keycloak: {
    url: 'https://keycloak.example.com',
    realm: 'servfarma',
    clientId: 'servfarma-frontend',
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256'
    }
  },
  apiBaseUrl: 'https://api.servfarma.com.br'
};
