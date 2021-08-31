import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { faPlay, faVial, faPaperPlane, faTrash, faHourglassStart, faHourglassHalf, faHourglassEnd, faUser, faAt } from '@fortawesome/free-solid-svg-icons'
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';

declare var M: any;

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() basicCode:string = "";
  @Input() basicFunction:string = "";
  @Input() summary: string = '';
  @Input() testFunctions: Array<Function> = [];
  @Input() jsonFile: string = 'childrenString.json';

  @ViewChild('sendModal') sendModalHTML!: ElementRef<any>;

  faPlay = faPlay;
  faVial = faVial;
  faPaperPlane = faPaperPlane;
  faTrash = faTrash;
  faUser = faUser;
  faAt = faAt;
  timeIcon = faHourglassStart;
  time: number = 30;
  timeUnit: string = 'minutes';
  outputText: string = '';
  codeCreated: string = '';
  atLeastTestedOneTime: boolean = false;
  
  //States
  onRunTesting: boolean = false;
  onOutOfTime: boolean = false;
  onTest: boolean = false;
  onSendData: boolean = false;
  alreadySendIt: boolean = false;
  onLoading: boolean = false;
  onSending: boolean = false;
  onOpenMode: boolean = false;

  //form
  userDataForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, Validators.pattern("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")])
  });

  private alreadyJSONLoaded:boolean = false;
  private currentInterval: number = 0;
  private startedDate: Date = new Date();
  private scriptEle: HTMLScriptElement | undefined;
  private sendModal: any;
  private codesSended: AngularFirestoreCollection<UserData>;
  private subscriptions: Subscription = new Subscription();
  
  constructor(public sanitizer: DomSanitizer, private http: HttpClient, private firestore: AngularFirestore ) {
    this.codesSended = firestore.collection<UserData>('usorisNotitia');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    if (this.sendModalHTML){
      this.sendModal = M.Modal.init(this.sendModalHTML.nativeElement);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loadJSONFile']){
      this.alreadyJSONLoaded = false;
      this.loadJSONFile();
    }
    if (changes['basicCode']){
      this.codeCreated = this.basicCode;
    }
  }

  ngOnInit(): void {
    if (!this.alreadyJSONLoaded){
      this.loadJSONFile();
    }
  }

  startSandbox(){
    this.atLeastTestedOneTime = false;
    this.onTest = true;
    this.onOutOfTime = false;
    this.startedDate = new Date();
    this.timeIcon = faHourglassHalf;
    this.startMinuteTimer();
  }

  startMinuteTimer(){
    this.time = 30;
    this.timeUnit = 'minutes';
    this.currentInterval = window.setInterval(() => {
      let diff = ((new Date()).getTime()-this.startedDate.getTime())/60000;
      this.time = 30-Math.floor(diff);
      if (this.time <= 1){
        clearInterval(this.currentInterval);
        this.startSecondsTimer();
      }
    }, 60000);
  }

  startSecondsTimer(){
    this.time = 60;
    this.timeUnit = 'seconds';
    this.currentInterval = window.setInterval(() => {
      let diff = ((new Date()).getTime()-this.startedDate.getTime())/1000;
      this.time = (30*60)-Math.floor(diff);
      if (this.time < 1){
        this.time = 0;
        this.onOutOfTime = true;
        this.timeIcon = faHourglassEnd;
        clearInterval(this.currentInterval);
      }
    }, 1000);
  }

  startTest(){
    if (this.codeCreated.includes(this.basicFunction)){
      this.createScript();
      this.onRunTesting = true;
      this.atLeastTestedOneTime = true;
      this.outputText = 'Starting Tests... <br>';
      this.runTest(0);
    } else {
       M.toast({html: 'Error: There is no commonString function.' , classes: 'red darken-1', displayLength: 1*60*1000});
    }
  }

  private createScript(){
    this.scriptEle = document.createElement('script');
    this.scriptEle.type = 'text/javascript';
    this.scriptEle.text = this.codeCreated;
    document.body.appendChild(this.scriptEle);
  }

  private deleteScript(){
    if (this.scriptEle) document.body.removeChild(this.scriptEle);
  }

  private runTest(id: number){
    if (id < this.testFunctions.length){
      setTimeout(()=> {
        let testOutput: boolean = false;
        try{
          testOutput = this.testFunctions[id]();
        }catch(error){
          console.error('Test ' + id.toString() + ' error:' + error);
          testOutput = false;
        }
        this.outputText += "Test " + id.toString() + '...' + (testOutput? '<span class="green-text text-darken-3">OK</span><br>' : '<span class="red-text text-darken-4">Fail</span><br>') ;
        this.runTest(id+1);
      },100);
    } else {
      this.onRunTesting =  false;
      this.deleteScript();
    }
    
  }

  openSendModal(){
    this.onSendData = true;
    this.sendModal && this.sendModal.open();
  }

  sendData(){
    this.sendModal.close();
    let uID = this.buildUniqueName(this.userDataForm.get('email')?.value);
    let doc = this.codesSended.doc(uID).valueChanges();
    this.onSending = true;
    this.subscriptions.add(doc.subscribe((data)=>{
      if (data){
        this.updateDataDB(this.codesSended.doc(uID), data);
      }else {
        this.addDataDB(this.codesSended.doc(uID));
      }
    },(error)=>{
      console.error('While loading doc: ' + error.toString());
      this.addDataDB(this.codesSended.doc(uID));
    }));
    
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
    data.fullName = this.userDataForm.get('name')?.value;
    data.codeSendIt.push(this.buildCodeData());
    doc.update(data).then((result)=>{ this.onSavedSucessfully()}).catch((error)=>{
      console.error('While updating doc: ' + error.toString());
      this.onWrongSave('Error while updating a entry: ' + (error['message']?error['message']:error.toString()))
    });
  }

  private buildItemDB(): UserData{
    return {
      "fullName": this.userDataForm.get('name')?.value,
      "email": this.userDataForm.get('email')?.value,
      "codeSendIt": [ this.buildCodeData()]
    };
  }

  private buildCodeData(): CodeData{
    return {
      "code": this.codeCreated,
      "secondsElapsed": ((new Date()).getTime()-this.startedDate.getTime())/1000,
      "timeStamp": this.date2TimeStamp(new Date())
    };
  }

  private onSavedSucessfully(){
    this.reset();
    this.alreadySendIt = true;
    this.onSending = false;
    M.toast({html: 'Send it sucessfully. Thanks!' , classes: 'green darken-1', displayLength: 1*60*1000});
  }


  private onWrongSave(message: string){
    this.onSending = false;
    M.toast({html: message , classes: 'red darken-1', displayLength: 1*60*1000});
  }

  private reset(){
    this.onRunTesting = false;
    this.onOutOfTime = false;
    this.onTest = false;
    this.onSendData = false;
    this.alreadySendIt = false;
    this.onLoading = false;
    this.onSending = false;
    this.onOpenMode = false;
    this.time = 30;
    this.codeCreated = this.basicCode;
  }

  clearOutput(){
    this.outputText = '';
  }

  editorKeyDown(event: { preventDefault?: any; keyCode?: any; ctrlKey?: any; metaKey?: any; }){
    const {keyCode, ctrlKey, metaKey} = event;
    if((keyCode === 33 || keyCode ===52) && (metaKey || ctrlKey)){
      event.preventDefault();
    }
  }

  private loadJSONFile(url: string = '/assets/json/'){
    this.http.get(url + this.jsonFile).subscribe( (res: any) => {
      this.basicCode = res['basicCode'];
      this.summary = res['summary'];
      this.basicFunction = res['basicFunction'];
      this.testFunctions = [];
      (res['testFunctions'] as Array<string>).forEach(value => {
        this.testFunctions.push(new Function(value));
      });
      this.alreadyJSONLoaded = true;
      this.codeCreated = this.basicCode;
    },
      error => { 
        M.toast({html: 'Error: ' + error['message'] , classes: 'red darken-1', displayLength: 1*60*1000});
    });
  }

  private buildUniqueName(email:string): string{
    let twoParts = email.split('@');
    if (twoParts.length != 2 ){
      throw new Error("Invalid e-mail");
    }
    twoParts[1] = twoParts[1].replace(/\./g,'');
    let length = twoParts[0].length + twoParts[1].length;
    return twoParts[0] + length.toString() + twoParts[1];
  }

  private date2TimeStamp(date: Date): number{
    return Math.round(date.getTime()/1000);
  }

  private timeStamp2Date(timestamp: number): Date{
    return new Date(timestamp*1000);
  }

}

export interface UserData{
  "fullName": string;
  "email": string;
  "codeSendIt": Array<CodeData>;
}

export interface CodeData {
  "code": string;
  "timeStamp": number;
  "secondsElapsed": number
}
