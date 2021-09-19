import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';

declare var M: any;

@Component({
  selector: 'app-floating-action-button',
  templateUrl: './floating-action-button.component.html',
  styleUrls: ['./floating-action-button.component.css']
})
export class FloatingActionButtonComponent implements OnDestroy, AfterViewInit, OnChanges {

  @Input() options: MaterialiceFABOptions = {};
  @Input() position: FABposition = {};

  @ViewChild('FAB') fabHTML!: ElementRef<any>;

  fabStyle: string = '';

  private fabInstance: any;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.options){
      this.initFAB();
    }
    if (changes['position'] && this.position){
      this.fabStyle = this.generateStyle();
    }
  }

  ngOnDestroy(): void {
    this.destroyFAB();
  }

  ngAfterViewInit(): void {
    this.initFAB();
  }

  private generateStyle(): string {
    let style = '';
    style += this.position.bottom? 'bottom:' + this.position.bottom + '; ': '';
    style += this.position.top? 'top:' + this.position.top + '; ': '';
    style += this.position.left? 'left:' + this.position.left + '; ': '';
    style += this.position.right? 'right:' + this.position.right + '; ': '';
    return style;
  }

  private initFAB(){
    if (this.fabHTML){
      this.destroyFAB();
      this.fabInstance = M.FloatingActionButton.init(this.fabHTML.nativeElement, this.options);
    }
  }

  private destroyFAB(){
    if (this.fabInstance){
      this.fabInstance.destroy();
    }
  }

}

export interface MaterialiceFABOptions{
  'direction'?: string;	//Can be 'top', 'right', 'buttom', 'left'
  'hoverEnabled'?:	boolean;	//If true, FAB menu will open on hover instead of click
  'toolbarEnabled'?:	boolean;	
}

export interface FABposition{
  'top'?: string;
  'left'?:	string;
  'right'?:	string;
  'bottom'?: string;
}