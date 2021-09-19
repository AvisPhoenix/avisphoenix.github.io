import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

declare var M: any;

@Component({
  selector: 'app-modal-window',
  templateUrl: './modal-window.component.html',
  styleUrls: ['./modal-window.component.css']
})
export class ModalWindowComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() show: boolean = false;
  @Output() showChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onClose: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('modal') modalHTML!: ElementRef<any>;

  private isOpen4Real: boolean = false;
  private modal: any;

  constructor() {
    this.show = false;
  }

  ngOnDestroy(): void {
    this.modal && this.modal.destroy();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show']){
      if (this.show ){
        this.openModal();
      } else{
        this.closeModal();
      }

    }
  }

  private openModal(){
    if (!this.isOpen4Real && this.modal){
      this.modal.open();
      this.isOpen4Real = true;
      this.showChange.emit(true);
    }
  }

  private closeModal(){
    if (this.isOpen4Real && this.modal){
      this.modal.close();
      this.isOpen4Real = false;
      this.show = false;
      this.onClose.emit();
      this.showChange.emit(false);
    }
  }

  ngAfterViewInit(): void {
    this.modalHTML && (this.modal = M.Modal.init(this.modalHTML.nativeElement, {onCloseEnd: ()=>{this.onClose.emit(); this.isOpen4Real = false; this.show = false; this.showChange.emit(false);}}));
    this.isOpen4Real = false;
    if (this.show){
      this.openModal();
    }
  }

}
