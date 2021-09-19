import { EventEmitter, Injectable } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-common-types';

@Injectable({
  providedIn: 'root'
})
export class MenuManagerService {

  private extraMenus: Array<MenuData> = [];
  public changeMenu: EventEmitter<Array<MenuData>> = new EventEmitter<Array<MenuData>>();

  constructor() { }

  addMenu(item: MenuData){
    if(!this.extraMenus.find((menu)=> menu.id === item.id)){
      this.extraMenus.push(item);
      this.changeMenu.emit(this.extraMenus);
    }
  }

  deleteMenu(id: string){
    if(!this.extraMenus.find((menu)=> menu.id === id )){
      this.extraMenus =  this.extraMenus.filter((menu)=> menu.id != id);
      this.changeMenu.emit(this.extraMenus);
    }
  }

}

export interface MenuData{
  id: string;
  icon: IconDefinition;
  title: string;
  clickFn: Function;
}
