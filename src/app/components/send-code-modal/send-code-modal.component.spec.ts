import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendCodeModalComponent } from './send-code-modal.component';

describe('SendCodeModalComponent', () => {
  let component: SendCodeModalComponent;
  let fixture: ComponentFixture<SendCodeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SendCodeModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendCodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
