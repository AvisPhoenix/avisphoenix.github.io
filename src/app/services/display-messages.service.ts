import { Injectable } from '@angular/core';

declare var M: any;

@Injectable({
  providedIn: 'root'
})
export class DisplayMessagesService {

  constructor() { }

  showMessage(msg: string, timeSecOpt: number = 30, classOpt: string = '' ){
    M.toast({html: msg , classes: classOpt, displayLength: timeSecOpt*1000});
  }

  showErrorMessage(msg: string){
    this.showMessage(msg, 60, 'red darken-1');
  }

  showSuccessMessage(msg: string){
    this.showMessage(msg, 30, 'green darken-1');
  }
}
