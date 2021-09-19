import { Component, EventEmitter, Input, Output } from '@angular/core';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-user-selector',
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.css']
})
export class UserSelectorComponent {

  @Input() users: Array<UserDetailsData> | null;
  @Output() currentUser: EventEmitter<string> = new EventEmitter<string>();

  nextIcon = faAngleRight;

  constructor() { 
    this.users = [];
  }

  selectUser(user: UserDetailsData){
    this.currentUser.emit(user.userID);
  }
}

export interface UserDetailsData{
  fullName: string;
  email: string;
  lastUpdate: Date;
  userID: string;
}
