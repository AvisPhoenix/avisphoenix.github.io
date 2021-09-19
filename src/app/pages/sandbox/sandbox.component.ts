import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { faPlay, faVial, faPaperPlane, faTrash, faHourglassStart, faHourglassHalf, faHourglassEnd, faCode } from '@fortawesome/free-solid-svg-icons'
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DisplayMessagesService } from 'src/app/services/display-messages.service';
import { ActivatedRoute } from '@angular/router';
import { MenuManagerService } from 'src/app/services/menu-manager.service';

@Component({
  selector: 'app-sandbox',
  templateUrl: './sandbox.component.html',
  styleUrls: ['./sandbox.component.css']
})
export class SandboxComponent implements OnInit, OnChanges, OnDestroy {

  @Input() basicCode:string = "";
  @Input() basicFunction:string = "";
  @Input() problemName:string = "";
  @Input() summary: string = '';
  @Input() testFunctions: Array<Function> = [];
  @Input() jsonFile: string = 'childrenString.json';

  faPlay = faPlay;
  faVial = faVial;
  faPaperPlane = faPaperPlane;
  faTrash = faTrash;
  timeIcon = faHourglassStart;
  time: number = 30;
  timeUnit: string = 'minutes';
  outputText: string = '';
  codeCreated: string = '';
  atLeastTestedOneTime: boolean = false;
  startedDate: Date = new Date();
  
  //States
  onRunTesting: boolean = false;
  onOutOfTime: boolean = false;
  onTest: boolean = false;
  onLoading: boolean = false;
  onSending: boolean = false;
  onOpenMode: boolean = false;
  onSelectionCode: boolean = false;

  getUserInfo: boolean = false;

  private alreadyJSONLoaded:boolean = false;
  private currentInterval: number = 0;
  private scriptEle: HTMLScriptElement | undefined;
  private subscriptions: Subscription = new Subscription();
  private subscribeLogin: Subscription = new Subscription();
  
  constructor(public sanitizer: DomSanitizer,
              private http: HttpClient,
              private authService: AuthService,
              private toastService: DisplayMessagesService,
              private route: ActivatedRoute,
              private menuMgr: MenuManagerService ) {
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.menuMgr.deleteMenu('loadCode');
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
    this.subscriptions.add(this.route.paramMap.subscribe((params)=>{
      if (params.get('opt')== 'load'){
        if (this.authService.isSignIn()){
          this.onSelectionCode = true;
        } else {
          this.authService.showLogInModal(true);
          this.subscribeLogin = this.authService.changeAuthStatus.subscribe((logged)=>{
            if (logged){
              this.onSelectionCode = true;
              this.subscribeLogin.unsubscribe();
            }
          });
        }
      } else {
        this.onOpenMode = false;
      }
    }));

    this.subscriptions.add(this.authService.cancelModal.subscribe(()=>{
      this.reset();
    }));

    this.menuMgr.addMenu({
      id: 'loadCode',
      title: 'Load another code',
      clickFn: ()=>{this.onSelectionCode = true;},
      icon: faCode
    });
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
      this.toastService.showErrorMessage('Error: There is no commonString function.');
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
    this.getUserInfo = true;
  }

  onSended(){
    this.getUserInfo = false;
    this.reset();
  }

  selectData(codeData: CodeData){
    this.codeCreated = codeData.code;
    this.onSelectionCode = false;
    this.time = codeData.secondsElapsed*1000;
    this.onOpenMode = true;
    // To - Do : load specific problem
  }

  private reset(){
    this.onRunTesting = false;
    this.onOutOfTime = false;
    this.onTest = false;
    this.onLoading = false;
    this.onSending = false;
    this.onOpenMode = false;
    this.onSelectionCode = false;
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

  setKeyDown(editor:any){
    editor.onKeyDown((e:any)=>this.editorKeyDown(e));
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
      this.problemName = res['name'];
    },
      error => { 
        this.toastService.showErrorMessage('Error: ' + error['message']);
    });
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
  "secondsElapsed": number;
  "problemName": string;
}
