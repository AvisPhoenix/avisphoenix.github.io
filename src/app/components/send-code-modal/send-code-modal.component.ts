import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { faAt, faExclamation, faUser } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { CodeData, UserData } from 'src/app/pages/sandbox/sandbox.component';
import { AuthService } from 'src/app/services/auth.service';
import { DisplayMessagesService } from 'src/app/services/display-messages.service';
import { ReCaptchaV3Service } from "ng-recaptcha";
import { CryptoService } from 'src/app/services/crypto.service';

@Component({
  selector: 'app-send-code-modal',
  templateUrl: './send-code-modal.component.html',
  styleUrls: ['./send-code-modal.component.css']
})
export class SendCodeModalComponent implements OnDestroy {

  @Input() showModal: boolean = false;
  @Input() codeCreated: string = '';
  @Input() problemName: string = '';
  @Input() startedDate: Date = new Date();
  @Output() dataSending: EventEmitter<void> = new EventEmitter<void>();
  @Output() showModalChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  onSendData: boolean = true;
  onSending: boolean = false;

  faUser = faUser;
  faAt = faAt;
  errorIcon = faExclamation;
  //form
  userDataForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, Validators.pattern("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")])
  });
  errorMessage: string = '';

  private codesSended: AngularFirestoreCollection<UserData>;
  private subscriptions: Subscription = new Subscription();
  private captchaSubscription: Subscription | null = null;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private toastService: DisplayMessagesService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private cryptService: CryptoService ) {
    this.codesSended = firestore.collection<UserData>('usorisNotitia');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.captchaSubscription) {
      this.captchaSubscription.unsubscribe();
    }
  }

  sendData() {
    this.onSending = true;
    this.onSendData = false;
    if (this.captchaSubscription) {
      this.captchaSubscription.unsubscribe();
    }
    this.captchaSubscription = this.recaptchaV3Service
      .execute('sendCode')
      .subscribe(
        (token) => {
          this.sendCode();
        },
        (error) => {
          this.onError(error);
        }
      );
  }

  retry(){
    this.onSendData = true;
    this.errorMessage = '';
  }

  onClose(){
    this.retry();
  }

  private sendCode(){

    let uID = this.authService.buildUniqueName(this.userDataForm.get('email')?.value);
    let doc = this.codesSended.doc(uID).valueChanges();
    
    this.subscriptions.add(doc.subscribe((data)=>{
      this.subscriptions.unsubscribe();
      if (data){
        this.updateDataDB(this.codesSended.doc(uID), data);
      }else {
        this.addDataDB(this.codesSended.doc(uID));
      }
    },(error)=>{
      this.onError(error);
    }));
    
  }

  private onError(error:any){
    this.onSending = false;
    this.errorMessage = "Error: " + error.toString();
    console.error('While loading doc: ' + error.toString());
  }

  private addDataDB(doc: AngularFirestoreDocument<UserData>){
    doc.set(this.buildItemDB()).then((result)=>{
      this.onSavedSucessfully();
    }).catch((error)=>{
      console.error('While adding doc: ' + error.toString());
      this.onWrongSave('Error while creating a new entry: ' + (error['message']?error['message']:error.toString()));
    });
  }

  private updateDataDB(doc: AngularFirestoreDocument<UserData>, data: UserData){
    data.fullName = this.cryptService.set(this.authService.getAuthSessionToken(),this.userDataForm.get('name')?.value);
    data.codeSendIt.push(this.buildCodeData());
    doc.update(data).then((result)=>{ this.onSavedSucessfully()}).catch((error)=>{
      console.error('While updating doc: ' + error?error.toString():"NULL");
      this.onWrongSave('Error while updating a entry: ' + (error['message']?error['message']:error.toString()))
    });
  }

  private buildItemDB(): UserData{
    return {
      "fullName": this.cryptService.set(this.authService.getAuthSessionToken(),this.userDataForm.get('name')?.value),
      "email": this.cryptService.set(this.authService.getAuthSessionToken(), this.userDataForm.get('email')?.value),
      "codeSendIt": [ this.buildCodeData()]
    };
  }

  private buildCodeData(): CodeData{
    return {
      "code": this.codeCreated,
      "secondsElapsed": ((new Date()).getTime()-this.startedDate.getTime())/1000,
      "timeStamp": this.authService.date2TimeStamp(new Date()),
      "problemName": this.problemName
    };
  }

  private onSavedSucessfully(){
    this.onSending = false;
    this.toastService.showSuccessMessage('Send it sucessfully. Thanks and good luck!');
    this.dataSending.emit();
  }


  private onWrongSave(message: string){
    this.onSending = false;
    this.errorMessage = message;
  }

}
