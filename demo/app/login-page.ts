import { fromObject } from 'tns-core-modules/data/observable';
import { SocketIO } from 'nativescript-socketio';
import { isAndroid } from 'tns-core-modules/platform/platform';
import { topmost } from 'tns-core-modules/ui/frame';
import * as moment from 'moment';
import * as application from 'tns-core-modules/application';
let socketIO: SocketIO, pageData = fromObject({
    item: '',
    username: 'Osei'
});

const server = isAndroid ? 'http://10.0.2.2:3001?test=123&platform=android' : 'http://localhost:3001?test=123&platform=ios';

let chatNS;

const resources = application.getResources();
resources['timeFromNow'] = (date) => moment(date).fromNow();

application.setResources(resources);


export function pageLoaded(args) {

    socketIO = new SocketIO(server, {});

    socketIO.on('login', function (data) {
        console.log('Login');
        console.dir(data);
        topmost().navigate({
            moduleName: 'main-page',
            context: {username: pageData.get('username'), socket: socketIO.instance}
        });
    });

    socketIO.connect();

    chatNS = socketIO.joinNamespace('/chat');
    if (chatNS && !chatNS.connected) {
        chatNS.connect();
    }


    let page = args.object;

    page.bindingContext = pageData;
}

export function join(args) {
    socketIO.emit('add user', {username: pageData.get('username')}, (ack) => {
        console.log('ack', ack);
    });
}
