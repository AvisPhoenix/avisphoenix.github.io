import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';
import { CodeData, UserData } from 'src/app/pages/sandbox/sandbox.component';
import { AuthService } from 'src/app/services/auth.service';
import { CryptoService } from 'src/app/services/crypto.service';
import { DisplayMessagesService } from 'src/app/services/display-messages.service';
import { CodeDetailsData } from '../code-selector/code-selector.component';
import { UserDetailsData } from '../user-selector/user-selector.component';

@Component({
  selector: 'app-code-selection-modal',
  templateUrl: './code-selection-modal.component.html',
  styleUrls: ['./code-selection-modal.component.css']
})
export class CodeSelectionModalComponent implements OnDestroy {

  @Output() selectedCode: EventEmitter<CodeData> = new EventEmitter<CodeData>();
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  
  showModal: boolean = true;
  onLoading: boolean = true;

  collection: Array<UserData> | null = null;
  userDataList: Array<UserDetailsData> | null = null;
  codeList: Array<CodeDetailsData> | null = null;
  currentCode: CodeData | undefined;
  currentCodeList: Array<CodeData> | undefined;

  private codesSended: AngularFirestoreCollection<UserData>;
  private subscriptions: Subscription = new Subscription();

  constructor(private firestore: AngularFirestore,
              private authService: AuthService,
              private msgService: DisplayMessagesService,
              private cryptoService: CryptoService) {
    this.codesSended = firestore.collection<UserData>('usorisNotitia');
    this.onLoading = true;
    this.subscriptions.add(this.codesSended.valueChanges().subscribe(
      (response)=>{
        this.collection = response;
        this.userDataList = this.generateUserDataList();
        this.codeList = null;
        this.onLoading = false;
      }, (error)=>{
        msgService.showErrorMessage("Can't get DataTransfer, Are you sign in?<br/>Error: " + error.toStrong());
      }
    ));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSelectUser(userID: string){
    let currentUser = this.userDataList?.find((user)=> user.userID == userID);
    if (currentUser){
      this.codeList = this.generateCodeDataList(currentUser);
    }
  }

  onSelectCode(idx: number){
    if (this.currentCodeList && idx >= 0 && idx < this.currentCodeList.length){
      this.currentCode = this.currentCodeList[idx];
    }
  }

  sendCode(){
    setTimeout(()=>{
      this.selectedCode.emit(this.currentCode);
    },1000);
    
  }

  private generateUserDataList(): Array<UserDetailsData> {
    return this.collection? this.collection.map((user)=>{
      user.email = this.cryptoService.get(this.authService.getAuthSessionToken(), user.email);
      user.fullName = this.cryptoService.get(this.authService.getAuthSessionToken(), user.fullName);
      return {
        email: user.email,
        fullName: user.fullName,
        lastUpdate: this.calculateLastModified(user.codeSendIt),
        userID: this.authService.buildUniqueName(user.email)
      }
    }) : [];
  }

  private calculateLastModified(codeList: Array<CodeData>): Date {
    let lastDate = new Date(0);

    if (codeList.length > 0){
      lastDate = this.authService.timeStamp2Date(codeList[0].timeStamp);
      codeList.forEach((code)=>{
        let date = this.authService.timeStamp2Date(code.timeStamp);
        if (date > lastDate){
          lastDate = date;
        }
      });
    }

    return lastDate;
  }

  private generateCodeDataList( fromUser: UserDetailsData ): Array<CodeDetailsData> {
      let user = this.collection ? this.collection.find((usr)=> usr.email == fromUser.email): undefined;
      let output:Array<CodeDetailsData> = [];
      if (user){
        this.currentCodeList = user.codeSendIt;
        this.currentCode = undefined;
        output = user.codeSendIt.map((code,idx)=>{
          return {
            creationDate: this.authService.timeStamp2Date(code.timeStamp),
            projectName: code.problemName,
            realIndex: idx,
            timeElapse: code.secondsElapsed*1000
          }
        });
      }
      return output;
  }

}
