import { Component, OnDestroy } from '@angular/core';
import { faSignOutAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { MenuData, MenuManagerService } from 'src/app/services/menu-manager.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnDestroy {

  showFAB: boolean = false;
  userIcon = faUser;
  logoutIcon = faSignOutAlt;
  userName: string = '';
  extraMenus: Array<MenuData> = [];

  private subscriptions = new Subscription();

  constructor(private loginService: AuthService,
              private menuMgr: MenuManagerService) {
    this.subscriptions.add(loginService.changeAuthStatus.subscribe((isLogin)=>{
      this.showFAB = isLogin;
      this.userName = loginService.getUserData().name;
    }));
    this.subscriptions.add(menuMgr.changeMenu.subscribe((menus)=>{ this.extraMenus = menus; }));
  }

  trackMenu(index: number, item: MenuData){
    return item.id;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  logout(){
    this.loginService.logout();
  }

}
