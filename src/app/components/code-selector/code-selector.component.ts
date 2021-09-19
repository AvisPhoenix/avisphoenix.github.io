import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-code-selector',
  templateUrl: './code-selector.component.html',
  styleUrls: ['./code-selector.component.css']
})
export class CodeSelectorComponent{

  @Input() codeList: Array<CodeDetailsData>;
  @Output() codeSelected: EventEmitter<number> = new EventEmitter<number>();

  currentSelectedItem: number = -1;

  selectedIcon = faCheck;

  constructor() { 
    this.codeList = [];
  }

  selectCode(code: CodeDetailsData){
    this.codeSelected.emit(code.realIndex);
    this.currentSelectedItem = code.realIndex;
  }

}

export interface CodeDetailsData{
  projectName: string;
  creationDate: Date;
  timeElapse: number;
  realIndex: number;
}
