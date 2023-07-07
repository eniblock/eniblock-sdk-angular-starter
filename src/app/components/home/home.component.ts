import {Component, OnInit, signal} from '@angular/core';
import {AuthService} from "../../core/services/auth.service";
import {Title} from "@angular/platform-browser";
import {Eniblock, UnsafeStorage} from "@eniblock/sdk";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  title = 'demo-sdk-angular';

  publicKey = signal('');
  address = signal('');

  isLoggedIn = false;

  constructor(private readonly authService: AuthService, private readonly titleService: Title) {
  }

  login(): void {
    return this.authService.login();
  }

  async logout(): Promise<void> {
    return await this.authService.logout(localStorage.getItem('starter_sdk_angular_access_token') ?? '');
  }

  async ngOnInit() {
    this.titleService.setTitle('Eniblock SDK Demo Angular 16');
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      console.log(`You're logged in!`)
      const sdk = new Eniblock({
        appId: "eniblock-demo",
        accessTokenProvider: () => Promise.resolve(localStorage.getItem('starter_sdk_angular_access_token') ?? ''),
        storageItems: [{alias: "UnsafeStorage", storage: new UnsafeStorage()}],
      });
      const wallet = await sdk.wallet.instantiate();
      console.log('Your Wallet:', wallet);
      const account = await wallet.account.instantiate('My first account');
      this.publicKey.set(await account.getPublicKey());
      this.address.set(await account.getAddress());
    }
  }
}
