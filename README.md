# Starter: Eniblock SDK with Angular

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

## Integrate the SDK into an Angular Application

Before we start, make sure you have a basic understanding of Angular and have set up your development environment properly.

### Configuration

To integrate the Eniblock SDK into your project, you need to customize the [Webpack configuration](https://cli.vuejs.org/guide/browser-compatibility.html#usebuiltins-usage) and add some [polyfills](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill). These steps ensure the SDK works with Angular 16.

1. **Install the necessary dependencies**:

  ```console
  npm i --save-dev webpack@5.76.1 @angular-builders/custom-webpack
  npm i @eniblock/sdk buffer crypto-browserify stream-browserify node-polyfill-webpack-plugin core-js
    ```

2. **Create a `polyfills.ts` file** in `src`.

  This file includes polyfills that provide modern functionality on older browsers that do not natively support it.

  ```ts
  import 'core-js';
  import 'regenerator-runtime';
  import 'zone.js';

  (window as any).global = window;
  ```

3. **Modify `tsconfig.app.json`** to include the path of the `polyfills.ts` file:

  ```json
  {
    "files": [
      "src/polyfills.ts"
    ]
  }
    ```

4. **Create a customized Webpack configuration file** (`custom-webpack.config.ts`) in the root of your project:

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

5. **Update your `angular.json` file**

    * Change the builders in the following locations:

      - `/projects/<name-of-your-project>/architect/build/builder` (default `@angular-devkit/build-angular:browser`)

        ```JSON
        "builder": "@angular-builders/custom-webpack:browser",
        ```

      - `/projects/<name-of-your-project>/architect/serve/builder` (default `@angular-devkit/build-angular:dev-server`)

        ```JSON
        "builder": "@angular-builders/custom-webpack:dev-server",
        ```

      - `/projects/<name-of-your-project>/architect/test/builder` (default `@angular-devkit/build-angular:karma`)

        ```JSON
        "builder": "@angular-builders/custom-webpack:karma",
        ```

    * Add the path of your `polyfills.ts` file previously created to the following paths in `angular.json`:

      - `/projects/<name-of-your-project>/architect/build/options/polyfills`
      - `/projects/<name-of-your-project>/test/options/polyfills`

        ```JSON
        "polyfills": [
          "src/polyfills.ts"
        ]
        ```

    * Add the path of your customized Webpack configuration file to `/projects/<name-of-your-project>/architect/build/options/customWebpackConfig`:

        ```JSON
        "customWebpackConfig": {
          "path": "./custom-webpack.config.ts"
        }
        ```
