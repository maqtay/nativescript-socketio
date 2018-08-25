import { fromObject } from 'tns-core-modules/data/observable';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import { NavigatedData, Page } from 'tns-core-modules/ui/page';
import { topmost } from 'tns-core-modules/ui/frame';
import { SocketIO } from 'nativescript-socketio';

let socketIO: SocketIO, page, context, pageData: any = fromObject({
    list: new ObservableArray(),
    textMessage: '',
    currentUser: ''
});

export function navigatingTo(args: NavigatedData) {
    page = <Page>args.object;
    context = page.navigationContext;
    pageData.set('currentUser', context.username);
    socketIO = new SocketIO(null, null, context.socket);

    socketIO.on('new message', function (data) {
        pageData.list.push(data);
        console.log(JSON.stringify(data));
    });

    socketIO.on('disconnect', function () {
        // pageData.list.push.length = 0;
        topmost().navigate('login');
    });

    socketIO.on('getMessages', function (data) {
        if (data.length > 0) {
            if (pageData.list.length !== data.length) {
                let messages = data;
                for (let i = 0; i < messages.length; i++) {
                    pageData.list.push(messages[i]);
                }
            }
            console.log(JSON.stringify(data));
        }

    });
}

export function pageLoaded(args: NavigatedData) {
    page.bindingContext = pageData;
    socketIO.emit('getMessages');
}

export function sendText() {
    let data = {
        username: context.username,
        message: pageData.get('textMessage'),
        timeStamp: +new Date()
    };

    socketIO.emit('new message', data, (wasReceived) => {
        if (wasReceived) {
            console.log('ack executed');
            console.log(JSON.stringify(data));
            pageData.list.push(data);
            pageData.set('textMessage', '');
        }
    });

}

export function logout() {
    socketIO.disconnect();
}
