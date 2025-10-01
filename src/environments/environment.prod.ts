export const environment = {
  production: true,
  defaultauth: 'keycloak',
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
  },
  apiBaseUrl: 'https://api.servfarma.com.br',
  userManagement: {
    users: '/api/v1/users',
    roles: '/api/v1/roles',
    modules: '/api/v1/modules',
    currentPermissions: '/api/v1/users/current/permissions'
  }
};
