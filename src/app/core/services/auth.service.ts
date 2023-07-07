import axios from "axios";
import {Eniblock, UnsafeStorage} from "@eniblock/sdk";
import {generateChallenge, generateVerifier} from "../../utils/pkce";
import {Injectable} from "@angular/core";

/**
 * Here is an implementation of the Authorization code flow as shown here https://www.ory.sh/docs/oauth2-oidc/authorization-code-flow.
 * Many libraries exist (https://www.npmjs.com/package/oidc-client-ts, https://www.npmjs.com/package/@auth0/auth0-spa-js ...), , you can check on https://www.npmjs.com/
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // You could pass these parameters in your environment variables
  private readonly redirectUri = 'https://localtest.me:8888/check';
  private readonly clientId = 'a8318224-46c1-4c29-9289-367c00b8f115';
  private readonly oauth2SdkUrl = 'https://optimistic-napier-bhcg1o7lwy.projects.oryapis.com';

  // Method to initiate login process
  login() {
    const verifier = generateVerifier();
    const challenge = generateChallenge(verifier);
    const state = generateVerifier();

    // Save the verifier, challenge and state in local storage for later use
    localStorage.setItem('starter_sdk_angular_pkce_verifier', verifier);
    localStorage.setItem('starter_sdk_angular_pkce_state', state);
    localStorage.setItem('starter_sdk_angular_pkce_challenge', challenge);

    window.location.href = `${(this.oauth2SdkUrl)}/oauth2/auth?client_id=${encodeURIComponent(this.clientId)}&redirect_uri=${
      encodeURIComponent(this.redirectUri)
    }&response_type=code&scope=${
      encodeURIComponent('openid profile email eniblock offline_access')
    }&code_challenge=${
      encodeURIComponent(challenge)
    }&code_challenge_method=S256&audience=${
      encodeURIComponent('https://sdk.eniblock.com')
    }&state=${
      encodeURIComponent(state)
    }`;
  }

  // Method to handle logout
  async logout(accessToken: string) {
    // Get an instance of Eniblock SDK, delete the TSS Wallet share and clear local storage
    const sdk = new Eniblock({
      appId: 'eniblock-demo',
      accessTokenProvider: () => Promise.resolve(accessToken),
      storageItems: [{alias: "UnsafeStorage", storage: new UnsafeStorage()}],
    });
    await sdk.wallet.destroy();
    localStorage.clear();
  }

  // Method to handle receiving the authorization code from the callback URL
  async receiveCode() {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const savedState = localStorage.getItem('starter_sdk_angular_pkce_state');
    const verifier = localStorage.getItem('starter_sdk_angular_pkce_verifier');
    const challenge = localStorage.getItem('starter_sdk_angular_pkce_challenge');
    localStorage.setItem('starter_sdk_angular_pkce_code', code ?? '');

    if (code && verifier && challenge && state === savedState) {
      await this.getToken();
    } else {
      throw new Error('Invalid state or missing authorization code');
    }
  }

  // Method to exchange authorization code for access token
  async getToken() {
    try {
      const tokenResponse = await axios.post(`${this.oauth2SdkUrl}/oauth2/token`, {
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
        code_verifier: localStorage.getItem('starter_sdk_angular_pkce_verifier'),
        code: localStorage.getItem('starter_sdk_angular_pkce_code'),
      }, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      });

      console.log(tokenResponse);

      const accessToken = tokenResponse.data.access_token;
      const idToken = tokenResponse.data.id_token;
      localStorage.setItem('starter_sdk_angular_access_token', accessToken);
      localStorage.setItem('starter_sdk_angular_id_token', idToken);

      // Clear the verifier and state from session storage
      localStorage.removeItem('starter_sdk_angular_pkce_verifier');
      localStorage.removeItem('starter_sdk_angular_pkce_state');

      // Get user info
      this.getUserInfo(accessToken);
      return accessToken;
    } catch (error) {
      console.error('Error fetching access token:', error);
    }
  }

  // Method to fetch user information using the access token
  getUserInfo(accessToken: string) {
    axios.get(`${this.oauth2SdkUrl}/userinfo`, {
      headers: {'Authorization': `Bearer ${accessToken}`}
    }).then(response => console.log('User info: ', response.data))
      .catch(error => console.error('Error fetching user information:', error));
  }

  isLoggedIn() {
    const accessToken = localStorage.getItem('starter_sdk_angular_access_token');
    if (accessToken) {
      axios.post(`${this.oauth2SdkUrl}/admin/oauth2/introspect`, {
        token: accessToken
      }, {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(introspection => {
        console.log(introspection.data);
        return introspection.data.active;
      }).catch(error => {
        console.error('Not logged in: ', error);
        return false;
      });
    }
    return false;
  }
}
