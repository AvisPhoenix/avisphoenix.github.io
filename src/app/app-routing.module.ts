import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SandboxComponent } from './pages/sandbox/sandbox.component';

const routes: Routes = [
  { path: 'sandbox/:opt', component: SandboxComponent },
  { path: '**', redirectTo: '/sandbox/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
