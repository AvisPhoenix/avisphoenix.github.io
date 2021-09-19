import { Component, OnDestroy} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faAt, faExclamation, faKey } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnDestroy {

  faKey = faKey;
  faAt = faAt;
  errorIcon = faExclamation;

  onErrorMessage: boolean = false;
  loading: boolean = false;
  withCancelBtn: boolean = false;

  errorMessage: string = '';

  showModal: boolean = false;

  private subscriptions: Subscription = new Subscription();

  userDataForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email, Validators.pattern("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")]),
    password: new FormControl('', [Validators.required])
  });

  constructor(private loginService: AuthService) {
    this.subscriptions.add(loginService.showModal.subscribe((showCancelBtn)=>{
      this.retry();
      this.showModal = true;
      this.withCancelBtn = showCancelBtn;
    }));
    this.subscriptions.add(loginService.sendMessages.subscribe((msg)=>{
      if (msg.type == 'error'){
        this.onErrorMessage = true;
        this.loading = false;
        this.errorMessage = msg.message;
      }
    }));
    this.subscriptions.add(loginService.changeAuthStatus.subscribe((isLogged)=>{
      this.showModal = !isLogged;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  logIn(){
    if ( this.userDataForm.get('email')?.value && this.userDataForm.get('password')?.value ){
      this.loginService.authenticateUser(this.userDataForm.get('email')?.value, this.userDataForm.get('password')?.value, true );
    }
  }

  retry(){
    this.onErrorMessage = false;
    this.loading = false;
    this.errorMessage = '';
    this.withCancelBtn = false;
  }

  cancel(){
    this.loginService.cancelModal.emit();
    this.showModal = false;
  }

  onClose(){
    this.retry();
  }

}
