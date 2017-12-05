import { Component, OnInit, OnDestroy } from "@angular/core";
import { SocketIO } from "nativescript-socketio";

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})

export class AppComponent implements OnInit, OnDestroy {
    constructor(
        private socketIO: SocketIO,
    ) { }

    ngOnInit() {
        this.socketIO.connect();
    }

    ngOnDestroy() {
        this.socketIO.disconnect();
    }
}
