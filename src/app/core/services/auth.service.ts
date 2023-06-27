import {Inject, Injectable} from '@angular/core';
import {AccessContext, OAuth2AuthCodePkceClient} from "oauth2-pkce";
import {DOCUMENT} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public oauthClient: OAuth2AuthCodePkceClient;

  public static readonly AUTH_SDK_URL = 'https://auth.sdk.eniblock.com';
  public static readonly AUTH_CLIENT_ID = 'a41b90ce-a548-49a3-a403-7ead41a31140';
  public static readonly AUTH_REDIRECT_URI = 'https://localtest.me:8888/check'

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.oauthClient = new OAuth2AuthCodePkceClient({
      scopes: ['openid', 'email', 'profile', 'eniblock', 'offline_access'],
      authorizationUrl: `${AuthService.AUTH_SDK_URL}/oauth2/auth`,
      tokenUrl: `${AuthService.AUTH_SDK_URL}/oauth2/token`,
      clientId: AuthService.AUTH_CLIENT_ID,
      redirectUrl: AuthService.AUTH_REDIRECT_URI,
      storeRefreshToken: true, // Be careful with this option
      extraAuthorizationParams: {audience: 'https://sdk.eniblock.com'},
      /* onAccessTokenExpiry() {
         // when the access token has expired
         return oauthClient.exchangeRefreshTokenForAccessToken();
       },*/
      onInvalidGrant() {
        // when there is an error getting a token with a grant
        console.warn('Invalid grant! Auth code or refresh token need to be renewed.');
        // you probably want to redirect the user to the login page here
      },
      onInvalidToken() {
        // the token is invalid, e. g. because it has been removed in the backend
        console.warn('Invalid token! Refresh and access tokens need to be renewed.');
        // you probably want to redirect the user to the login page here
      }
    });
  }

  isLoggedIn(): boolean {
    return this.oauthClient.isAuthorized();
  }

  login(): Promise<void> {
    return this.oauthClient.requestAuthorizationCode();
  }

  logout(): Promise<void> {
    return this.oauthClient.reset();
  }

  receiveCode(): Promise<void> {
    return this.oauthClient.receiveCode();
  }

  getTokens(): Promise<AccessContext> {
    return this.oauthClient.getTokens({'': ''});
  }
}
