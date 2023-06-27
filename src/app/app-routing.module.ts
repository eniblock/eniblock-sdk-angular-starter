import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CheckComponent} from "./components/check/check.component";
import {HomeComponent} from "./components/home/home.component";

const routes: Routes = [{
  path: '',
  component: HomeComponent
}, {
  path: 'check',
  component: CheckComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
