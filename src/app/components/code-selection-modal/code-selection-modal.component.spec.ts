import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeSelectionModalComponent } from './code-selection-modal.component';

describe('CodeSelectionModalComponent', () => {
  let component: CodeSelectionModalComponent;
  let fixture: ComponentFixture<CodeSelectionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeSelectionModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSelectionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
