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
  }
};
