import {Inject, Injectable} from '@angular/core';
import {AccessContext, OAuth2AuthCodePkceClient} from "oauth2-pkce";
import {DOCUMENT} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public oauthClient: OAuth2AuthCodePkceClient;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    this.oauthClient = new OAuth2AuthCodePkceClient({
      scopes: ['openid', 'email', 'profile', 'eniblock', 'offline_access'],
      authorizationUrl: `${process.env['AUTH_SDK_URL']}/oauth2/auth`,
      tokenUrl: `${process.env['AUTH_SDK_URL']}/oauth2/token`,
      clientId: process.env['AUTH_CLIENT_ID']!,
      redirectUrl: process.env['AUTH_REDIRECT_URI']!,
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
