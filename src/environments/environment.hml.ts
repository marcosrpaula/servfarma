export const environment = {
  production: true,
  defaultauth: 'fakebackend',
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
  apiBaseUrl: 'https://hml-api.servfarma.com.br',
  userManagement: {
    users: '/api/v1/users',
    roles: '/api/v1/roles',
    modules: '/api/v1/modules',
    currentPermissions: '/api/v1/users/current/permissions'
  }
};
