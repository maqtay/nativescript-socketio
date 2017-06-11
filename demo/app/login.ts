import { Observable } from 'data/observable';
import { SocketIO } from 'nativescript-socketio';
import * as platform from "platform";
import frameModule = require('ui/frame');
let socketIO;
let server;
if (platform.isAndroid) {
  server = 'http://192.168.1.135:3001'; //using genymotion
} else if (platform.isIOS) {
  server = 'http://localhost:3001';
}
let pageData = new Observable({
  item: '',
  username: 'Osei'
});

export function navigatingTo() {
  socketIO = new SocketIO(server, {});
  socketIO.on('login', function (data) {
    console.log("Login: ", data);
    frameModule.topmost().navigate({ moduleName: 'main-page', context: { username: pageData.get("username"), socket: socketIO.instance } })
  })
  socketIO.connect();
}
export function pageLoaded(args) {
  var page = args.object;
  page.bindingContext = pageData;
}
export function join(args) {
  socketIO.emit('add user', { username: pageData.get('username') });
}