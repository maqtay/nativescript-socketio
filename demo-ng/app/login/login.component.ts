import { Component, OnInit, NgZone } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';
import { SocketIO } from 'nativescript-socketio';

@Component({
    selector: 'login',
    moduleId: module.id,
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
    username = '';

    constructor(
        private router: RouterExtensions,
        private socketIO: SocketIO,
        private ngZone: NgZone
    ) {
    }

    ngOnInit() {
        // There is a problem here because this subscription is never turned off
        // So it would appear the user is never changed even after log out
        this.socketIO.on('login', data => {
            this.ngZone.run(() => {
                // console.dir(data);
                console.log('Username: ' + this.username);
                this.router.navigate(['main-page', this.username]);
            });
        });
        // So as to reconnect when logged out
        this.socketIO.connect();
    }

    join(username) {
        this.username = username;
        this.socketIO.emit('add user', {username}, (ack) => {
            console.log('ack', ack);
        });
    }
}
