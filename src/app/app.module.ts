import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SandboxComponent } from './pages/sandbox/sandbox.component';

@NgModule({
  declarations: [
    AppComponent,
    SandboxComponent
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
    AngularFirestoreModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
