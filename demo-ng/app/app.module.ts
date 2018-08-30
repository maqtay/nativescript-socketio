import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';

import { LoginComponent } from './login/login.component';
import { MainPageComponent } from './main-page/main-page.component';

import { SocketIOModule } from 'nativescript-socketio/angular';
import { server } from './environment';
import { TimeFromNow } from './timeFromNow.pipe';

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from "nativescript-angular/forms";

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
// import { NativeScriptHttpModule } from "nativescript-angular/http";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        SocketIOModule.forRoot(server),
        AppRoutingModule,
    ],
    declarations: [
        AppComponent,
        TimeFromNow,
        LoginComponent,
        MainPageComponent
    ],
    providers: [],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule {
}
