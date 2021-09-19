import { TestBed } from '@angular/core/testing';

import { DisplayMessagesService } from './display-messages.service';

describe('DisplayMessagesService', () => {
  let service: DisplayMessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplayMessagesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
