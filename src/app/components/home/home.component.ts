import {Component, OnInit, signal} from '@angular/core';
import {Eniblock, UnsafeStorage} from "@eniblock/sdk";
import {AuthService} from "../../core/services/auth.service";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  title = 'demo-sdk-angular';

  sdk: Eniblock = new Eniblock({
    authConfig: {
      clientId: AuthService.AUTH_CLIENT_ID,
      redirectUrl: AuthService.AUTH_REDIRECT_URI,
    },
    tssConfig: {
      kmsUrl: "https://sdk.eniblock.com",
      wasmPath: "wasm/eniblock.wasm",
      kmsVerify: true,
    },
    storageItems: [{alias: "LocalStorage", storage: new UnsafeStorage()}],
  });

  publicKey = signal('');
  address = signal('');

  isLoggedIn = false;

  constructor(private readonly authService: AuthService, private readonly titleService: Title) {
  }

  login(): Promise<void> {
    return this.authService.login();
  }

  ngOnInit() {
    this.titleService.setTitle('Eniblock SDK Demo Angular 16');
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      console.log(`You're logged in!`)
      Promise.resolve(this.sdk.wallet.instantiate()).then(wallet => {
        console.log('Your Wallet:');
        console.log(wallet);
        Promise.resolve(wallet.account.instantiate('My first account')).then(account => {
          Promise.resolve(account.getPublicKey()).then(publicKey => {
            this.publicKey.set(publicKey);
          }).catch(reason => console.error(reason));
          Promise.resolve(account.getAddress()).then(address => {
            this.address.set(address);
          }).catch(reason => console.error(reason));
        }).catch(reason => console.error(reason));
      }).catch(reason => console.error(reason));

    }
  }
}
