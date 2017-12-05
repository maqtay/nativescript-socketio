import { Component, OnInit, NgZone } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { SocketIO } from "nativescript-socketio/angular";
import { ActivatedRoute } from "@angular/router";

@Component({
	selector: "main-page",
	moduleId: module.id,
	templateUrl: "./main-page.component.html",
	styleUrls: ["./main-page.component.css"]
})

export class MainPageComponent implements OnInit {
	list = [];
	currentUser = "";

	constructor(
		private router: RouterExtensions,
		private route: ActivatedRoute,
		private socketIO: SocketIO,
		private ngZone: NgZone
	) { }

	ngOnInit() {
		this.currentUser = this.route.snapshot.params["username"];
		console.log("currentUser: "+this.currentUser);

		this.socketIO.on("new message", data => {
			this.ngZone.run(() => {
				this.list.push(data);
				console.log(JSON.stringify(data));
			});
		});

		this.socketIO.on("disconnect", () => {
			// this.list.push.length = 0;
			this.ngZone.run(() => {
				this.router.navigate(["login"]);
			});
		});

		this.socketIO.on("getMessages", data => {
			this.ngZone.run(() => {
				if (data.length > 0) {
					if (this.list.length !== data.length) {
						let messages = data;
						for (let i = 0; i < messages.length; i++) {
							this.list.push(messages[i]);
						}
					}
					console.log(JSON.stringify(data));
				}
			});
		});

		this.socketIO.emit("getMessages");
	}

	sendText(message: string) {
		let data = {
			message,
			username: this.currentUser,
			timeStamp: +new Date()
		};

		this.socketIO.emit("new message", data, wasReceived => {
			this.ngZone.run(() => {
				if (wasReceived) {
					console.log("ack executed");
					console.log(JSON.stringify(data));
					this.list.push(data);
				}
			});
		});
	}

	logout() {
		// this.socketIO.off("login");
		this.socketIO.disconnect();
	}
}
