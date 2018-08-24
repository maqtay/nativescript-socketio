var platform = require('tns-core-modules/platform');

var SocketIO = require('nativescript-socketio').SocketIO;

const server = platform.isAndroid ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

var socketio = new SocketIO(server, {});

describe('SocketIO functions', function () {
	it('connects to server', function () {
		socketio.connect();
		setTimeout(function () {
			expect(socketio.connected).toBe(true);
			done();
		}, 3000);
	});

	it('tests emit, event listener & ack', function () {
		socketio.on('login', function (data) {
			expect(data).toBeDefined();
		});

		socketio.emit('add user',{username:'test-user'}, function (ack) {
			expect(ack).toBe(true);
		});
	});

	it('tests joining namespace', function () {
		var chatNS = socketio.joinNamespace('/chat');
		expect(chatNS).toBeDefined();

		// check if its auto connected
		chatNS.connect();
		// check if connected
		setTimeout(function(){
			expect(chatNS.connected).toBe(true);
			done()
		},3000)
	});



	it('tests disconnecting', function () {
		socketio.disconnect();
		setTimeout(function(){
			expect(socketio.connected).toBe(false)
		},1500);
	});
});