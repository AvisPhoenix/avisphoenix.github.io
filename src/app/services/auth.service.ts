import { EventEmitter, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DisplayMessagesService } from './display-messages.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private srcURL:string='';
  private nextURL:string='';
  private userData: UserAuthData | undefined;
  private skey: string | null;

  public showModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  public cancelModal: EventEmitter<void> = new EventEmitter<void>();
  public changeAuthStatus: EventEmitter<boolean> = new EventEmitter<boolean>();
  public sendMessages: EventEmitter<{ type: string, message: string }> = new EventEmitter<{ type: string, message: string }>();

  constructor(private authFirebase: AngularFireAuth,
              private toastService: DisplayMessagesService) {
      this.skey = "5nb9e9uoF/pzeZmP";
  }

  redirectLogIn(toURL: string){
    this.srcURL = this.nextURL;
    this.nextURL = toURL;
  }

  showLogInModal(showCancel:boolean = false){
    if (!this.isSignIn()){
      this.showModal.emit(showCancel);
    }
  }

  isSignIn():boolean {
    return this.userData? true: false;
  }

  logout(sendMessage: boolean = false){
    this.authFirebase.signOut().then(()=>{
      this.clearUserData();
      this.changeAuthStatus.emit(this.isSignIn());
      this.sendMessage(sendMessage,'sucess', 'Sign-out Sucessfully!');
    }).catch((error)=>{
      this.sendMessage(sendMessage,'error', 'Sign-out error:' + error? error.toString(): 'Unknown');
    });
  }

  authenticateUser(email: string, password: string, sendMessage: boolean = false){
    if (email && password){
      this.clearUserData();
      this.authFirebase.signInWithEmailAndPassword(email,password).then((authData)=>{
        this.userData = {
          email: email,
          name: authData.user?.displayName? authData.user.displayName: '' ,
          photoURL: authData.user?.photoURL? authData.user.photoURL: '',
          token: authData.user?.refreshToken? authData.user.refreshToken: ''
        };
        this.changeAuthStatus.emit(this.isSignIn());
        this.sendMessage(sendMessage,'sucess','Sign-in Sucessfully!');
      }).catch((error)=>{
        this.sendMessage(sendMessage,'error','Sign-in error:' + error? error.toString() : 'Unknown');
      });
    }
  }

  getUserData(): UserAuthData {
    return Object.assign({},this.userData);
  }

  timeStamp2Date(timestamp: number): Date{
    return new Date(timestamp*1000);
  }

  buildUniqueName(email:string): string{
    let twoParts = email.split('@');
    if (twoParts.length != 2 ){
      throw new Error("Invalid e-mail");
    }
    let length = twoParts[0].length + twoParts[1].length;
    twoParts[1] = twoParts[1].replace(/[\._-]/g,'');
    twoParts[0] = twoParts[0].replace(/[\._-]/g,'');
    return twoParts[0] + length.toString() + twoParts[1];
  }

  date2TimeStamp(date: Date): number{
    return Math.round(date.getTime()/1000);
  }

  getAuthSessionToken(): string{
    return this.skey? this.skey: '';
  }

  private clearUserData(){
    this.userData = undefined;
  }

  private sendMessage(sendMessage: boolean, type: string, message: string){
    if(sendMessage){
      this.sendMessages.emit({'type': type, 'message': message});
    }else {
      if (type == 'error')
        this.toastService.showErrorMessage(message);
      else if (type == 'sucess')
        this.toastService.showSuccessMessage(message);
      else
        this.toastService.showMessage(message);
    }
  }
}

export interface UserAuthData{
  email: string;
  name: string;
  photoURL: string;
  token: string;
}