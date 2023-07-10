import {Eniblock, UnsafeStorage} from "@eniblock/sdk";
import {Injectable} from "@angular/core";
import {generateChallenge, generateVerifier} from "../../utils/pkce";
import {HttpClient, HttpParams} from "@angular/common/http";
import {lastValueFrom} from "rxjs";

/**
 * Here is an implementation of the Authorization code flow as shown here https://www.ory.sh/docs/oauth2-oidc/authorization-code-flow.
 * Many libraries exist (https://www.npmjs.com/package/oidc-client-ts, https://www.npmjs.com/package/@auth0/auth0-spa-js ...), , you can check on https://www.npmjs.com/
 */
@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private httpClient: HttpClient) {
    }

    // You could pass these parameters in your environment variables
    private readonly redirectUri = 'https://a.myho.st:8888/check';
    private readonly clientId = 'a41b90ce-a548-49a3-a403-7ead41a31140';
    private readonly oauth2SdkUrl = 'https://auth.sdk.eniblock.com';

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
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const savedState = localStorage.getItem('starter_sdk_angular_pkce_state');
        const verifier = localStorage.getItem('starter_sdk_angular_pkce_verifier');
        const challenge = localStorage.getItem('starter_sdk_angular_pkce_challenge');
        localStorage.setItem('starter_sdk_angular_pkce_code', code ?? '');

        if (code && verifier && challenge && state === savedState) {
            await this.getTokens();
        } else {
            throw new Error('Invalid state or missing authorization code');
        }
    }

    // Method to exchange authorization code for access token
    private async getTokens() {
        try {

            const body = new HttpParams().set('client_id', this.clientId).set('redirect_uri', this.redirectUri)
                .set('grant_type', 'authorization_code').set('code_verifier', localStorage.getItem('starter_sdk_angular_pkce_verifier')!)
                .set('code', localStorage.getItem('starter_sdk_angular_pkce_code')!);
            const tokenResponse: any = await lastValueFrom(this.httpClient.post(`${this.oauth2SdkUrl}/oauth2/token`, body, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }));

            console.log('Tokens:', tokenResponse);

            const accessToken = tokenResponse.access_token;
            const idToken = tokenResponse.id_token;
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
        this.httpClient.get(`${this.oauth2SdkUrl}/userinfo`, {
            headers: {'Authorization': `Bearer ${accessToken}`}
        }).subscribe(userinfo => {
            console.log('User info: ', userinfo);
        });
    }

    isLoggedIn() {
        return !!localStorage.getItem('starter_sdk_angular_access_token');
    }
}
