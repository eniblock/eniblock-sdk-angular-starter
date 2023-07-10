import {Component, OnInit} from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";
import {AuthService} from "../../core/services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-check',
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss']
})
export class CheckComponent implements OnInit {

  constructor(private spinner: NgxSpinnerService, private authService: AuthService, private router: Router) {
  }

  async ngOnInit(): Promise<void> {
    await this.spinner.show('primary');
    console.log('Check code...');
    await this.authService.receiveCode();
    console.log('Redirect to home page');
    this.router.navigateByUrl('/');
    return Promise.resolve();
  }
}
