export const environment = {
  production: true,
  defaultauth: 'keycloak',
  api: {
    baseUrl: 'https://hml-api.servfarma.com.br',
    version: '/api/v1',
    endpoints: {
      users: '/users',
      roles: '/roles',
      permissions: '/permissions',
      currentUserPermissions: '/users/me/permissions'
    },
    defaultPageSize: 10
  },
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  },
  keycloak: {
    url: 'https://keycloak.example.com',
    realm: 'servfarma',
    clientId: 'servfarma-frontend',
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256'
    }
  }
};
