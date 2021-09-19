import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuthModule, PERSISTENCE } from '@angular/fire/compat/auth';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SandboxComponent } from './pages/sandbox/sandbox.component';
import { UserInfoComponent } from './components/user-info/user-info.component';
import { LoginComponent } from './pages/login/login.component';
import { LoginModalComponent } from './components/login-modal/login-modal.component';
import { ModalWindowComponent } from './components/modal-window/modal-window.component';
import { FloatingActionButtonComponent } from './components/floating-action-button/floating-action-button.component';
import { UserSelectorComponent } from './components/user-selector/user-selector.component';
import { CodeSelectionModalComponent } from './components/code-selection-modal/code-selection-modal.component';
import { CodeSelectorComponent } from './components/code-selector/code-selector.component';
import { LoadingAnimationComponent } from './components/loading-animation/loading-animation.component';
import { SendCodeModalComponent } from './components/send-code-modal/send-code-modal.component';
import { TimePipe } from './pipes/time.pipe';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

@NgModule({
  declarations: [
    AppComponent,
    SandboxComponent,
    UserInfoComponent,
    LoginComponent,
    LoginModalComponent,
    ModalWindowComponent,
    FloatingActionButtonComponent,
    UserSelectorComponent,
    CodeSelectionModalComponent,
    CodeSelectorComponent,
    LoadingAnimationComponent,
    SendCodeModalComponent,
    TimePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MonacoEditorModule.forRoot(), // use forRoot() in main app module only.
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyAWj0k2aSfxHRxhmeWxYkZcB6pCsAto-gs",
      authDomain: "githubdata-6209c.firebaseapp.com",
      projectId: "githubdata-6209c",
      storageBucket: "githubdata-6209c.appspot.com",
      messagingSenderId: "115638315471",
      appId: "1:115638315471:web:a67749cd0aa24d65fb4aba"
    }),
    AngularFirestoreModule,
    AngularFireAuthModule,
    RecaptchaV3Module
  ],
  providers: [
    { provide: PERSISTENCE, useValue: 'none' },
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: "6LdftHUcAAAAAAfI3ip2l6ryMwC6h1Re6aJq29pb" }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
