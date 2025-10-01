// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
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
    url: 'http://localhost:8080',
    realm: 'servfarma',
    clientId: 'frontend',
    initOptions: {
      onLoad: 'login-required',
      checkLoginIframe: false,
      pkceMethod: 'S256'
    }
    },
    apiBaseUrl: 'https://hml-api.servfarma.com.br',
    userManagement: {
      users: '/api/v1/users',
      roles: '/api/v1/roles',
      modules: '/api/v1/modules',
      currentPermissions: '/api/v1/users/current/permissions'
    }
  };

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
