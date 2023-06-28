import { EnvironmentPlugin } from 'webpack';
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  plugins: [
    new EnvironmentPlugin(['AUTH_REDIRECT_URI', 'AUTH_CLIENT_ID', 'AUTH_SDK_URL']),
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
