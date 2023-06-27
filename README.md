# DemoSdkAngular

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## SDK integration for Angular 16
### Requirements
To integrate the Eniblock SDK into your project, you will have to customize the [Webpack configuration](https://cli.vuejs.org/guide/browser-compatibility.html#usebuiltins-usage) to add some [polyfills](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill).
Here are the requirements to use the Eniblock SDK:
- install the following dependencies:
   ```console
   npm i --save-dev webpack@5.76.1 @angular-builders/custom-webpack
   npm i @eniblock/sdk buffer crypto-browserify stream-browserify node-polyfill-webpack-plugin core-js
   ```
- create a polyfills.ts file in src
  ```ts
  import 'core-js';
  import 'regenerator-runtime';
  import 'zone.js';

  (window as any).global = window;
  ```
- modify tsconfig.app.json to add the path of the polyfills.ts file:
  ```json
  {
    "files": [
      "src/polyfills.ts"
    ]
  }
  ```
- create the customized Webpack configuration file (custom-webpack.config.ts) in the root of your project:
  ```ts
  const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

  module.exports = {
      plugins: [
          new NodePolyfillPlugin(),
      ],
      resolve: {
          extensions: ['.ts', '.js'],
          modules: ['src', 'node_modules'],
          fallback: {
              crypto: require.resolve('crypto-browserify'),
              stream: require.resolve('stream-browserify'),
              buffer: require.resolve('buffer')
          }
      }
  };

  ```
- update your angular.json file :
  - change the builders:
    - in /projects/<name-of-your-project>/architect/build/builder (default `@angular-devkit/build-angular:browser`)
      ```
      "builder": "@angular-builders/custom-webpack:browser",
      ```
    - in /projects/<name-of-your-project>/architect/serve/builder (default `@angular-devkit/build-angular:dev-server`)
      ```
      "builder": "@angular-builders/custom-webpack:dev-server",
      ```
    - in /projects/<name-of-your-project>/architect/test/builder (default `@angular-devkit/build-angular:karma`)
      ```
      "builder": "@angular-builders/custom-webpack:karma",
      ```
  - add the path of your polyfills.ts file previously created to the following paths of angular.json:
    ```
    "polyfills": [
      "src/polyfills.ts"
    ]
    ```
    - /projects/<name-of-your-project>/architect/build/options/polyfills
    - /projects/<name-of-your-project>/test/options/polyfills
  - add the path of your customized Webpack configuration file in /projects/<name-of-your-project>/architect/build/options/customWebpackConfig:
    ```
    "customWebpackConfig": {
      "path": "./custom-webpack.config.ts"
    }
    ``` 
