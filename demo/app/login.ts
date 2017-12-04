import { fromObject } from "tns-core-modules/data/observable";
import { SocketIO } from "nativescript-socketio";
import { isAndroid } from "tns-core-modules/platform/platform";
import { topmost } from "tns-core-modules/ui/frame";

let socketIO: SocketIO, pageData = fromObject({
  item: "",
  username: "Osei"
});

const server = isAndroid ? "http://192.168.8.54:3001" : "http://localhost:3001";

export function navigatingTo() {
  socketIO = new SocketIO(server, {});
  socketIO.on("login", function (data) {
    console.log("Login");
    console.dir(data);
    topmost().navigate({ moduleName: "main-page", context: { username: pageData.get("username"), socket: socketIO.instance } });
  });
  socketIO.connect();
}

export function pageLoaded(args) {
  let page = args.object;
  page.bindingContext = pageData;
}

export function join(args) {
  socketIO.emit("add user", { username: pageData.get("username") });
}
