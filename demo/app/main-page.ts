import {Observable} from 'data/observable';
import {ObservableArray} from 'data/observable-array';
import {Page, NavigatedData} from 'ui/page';
import frameModule = require('ui/frame');
import { SocketIO } from 'nativescript-socketio';
let socketIO;
import view = require('ui/core/view');
let pageData: any = new Observable({
  list: new ObservableArray(),
  textMessage: '',
  currentUser: ''
})
let page;
let context;
export function navigatingTo(args: NavigatedData) {
  page = <Page>args.object;
  context = page.navigationContext;
  pageData.set("currentUser", context.username);
  socketIO = new SocketIO(null, null, context.socket);
  socketIO.on('new message', function (data) {
    pageData.list.push(data)
    console.log(JSON.stringify(data));
  })

  socketIO.on('disconnect', function () {
    // pageData.list.push.length = 0;
    frameModule.topmost().navigate('login')
  })

  socketIO.on('getMessages', function (data) {
    if (data.length > 0) {
      if (pageData.list.length !== data.length) {
        var messages = data;
        for (let i = 0; i < messages.length; i++) {
          pageData.list.push(messages[i])
        }
      }
      console.log(JSON.stringify(data));
    }

  })
}
export function pageLoaded(args: NavigatedData) {
  page.bindingContext = pageData;
  socketIO.emit('getMessages');
}
export function sendText() {
  let data = {
    username: context.username,
    message: pageData.get("textMessage"),
    timeStamp: +new Date()
  };

  socketIO.emit('new message', data, (wasReceived) => {
    if (wasReceived) {
      console.log('ack executed');
      console.log(JSON.stringify(data));
      pageData.list.push(data);
      pageData.set("textMessage", "");
    }
  })

}

export function logout() {
  socketIO.disconnect();
}