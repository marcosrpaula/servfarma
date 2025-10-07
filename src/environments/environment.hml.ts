export const environment = {
  production: true,
  defaultauth: 'keycloak',
  apiBaseUrl: 'https://hml-api.servfarma.com.br',
  keycloak: {
    url: 'https://hml-accounts.servfarma.com.br',
    realm: 'servfarma',
    clientId: 'frontend',
  },
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  },
};
