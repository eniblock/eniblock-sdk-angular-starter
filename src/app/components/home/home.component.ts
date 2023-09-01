import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Title } from '@angular/platform-browser';
import { Eniblock, UnsafeStorage } from '@eniblock/sdk';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    title = 'demo-sdk-angular';

    publicKey = signal('');
    address = signal('');
    isLoggedIn = signal(false);
    sdk: Eniblock | undefined;

    constructor(private readonly authService: AuthService, private readonly titleService: Title) {}

    login(): void {
        return this.authService.login();
    }

    async logout(): Promise<void> {
        this.isLoggedIn.set(false);
        // delete the TSS Wallet share and clear local storage
        await this.sdk?.wallet.destroy();
        console.warn('Your local Eniblock SDK Wallet is destroyed.');
        return await this.authService.logout(localStorage.getItem('starter_sdk_angular_access_token') ?? '');
    }

    async ngOnInit() {
        this.titleService.setTitle('Eniblock SDK Starter Angular 16');
        this.isLoggedIn.set(this.authService.isLoggedIn());
        if (this.isLoggedIn()) {
            this.sdk = new Eniblock({
                appId: 'eniblock-demo',
                accessTokenProvider: () =>
                    Promise.resolve(localStorage.getItem('starter_sdk_angular_access_token') ?? ''),
                storageItems: [{ alias: 'UnsafeStorage', storage: new UnsafeStorage() }],
            });
            if (!localStorage.getItem('share-ECDSA')) {
                await this.sdk.wallet.destroy();
            }

            const wallet = await this.sdk.wallet.instantiate();
            const account = await wallet.account.instantiate('My first account');
            this.publicKey.set(await account.getPublicKey());
            this.address.set(await account.getAddress());
        }
    }
}
