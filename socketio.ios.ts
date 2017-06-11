import { device } from "platform"

declare var SocketIOClient;
declare var SocketAckEmitter;

declare var NSURL;
declare var NSDictionary;
declare var NSMutableArray;
declare var UInt64;

export class SocketIO {

    socket: any;

    /**
     * Class Constructor
     * args[0]: Connection URL as String
     * args[1]: Connection Options
     */
    constructor(...args: any[]) {
        let opts = {};
        switch (args.length) {
            case 1:
                if (parseInt(device.osVersion) >= 10) {
                    this.socket = SocketIOClient.alloc().initWithSocketURLConfig(
                        NSURL.URLWithString(args[0]),
                        opts
                    );
                } else {
                    this.socket = SocketIOClient.alloc().initWithSocketURLOptions(
                        NSURL.URLWithString(args[0]),
                        opts
                    );
                }
                break;
            case 2:
                const keys = Object.keys(args[1]);
                keys.forEach((key, index) => {
                    if (key === 'query') {
                        Object.assign(opts, { connectParams: args[1][key] });
                    } else {
                        opts[key] = args[1][key];
                    }
                });
                if (parseInt(device.osVersion) >= 10) {
                    this.socket = SocketIOClient.alloc().initWithSocketURLConfig(
                        NSURL.URLWithString(args[0]),
                        opts
                    );
                } else {
                    this.socket = SocketIOClient.alloc().initWithSocketURLOptions(
                        NSURL.URLWithString(args[0]),
                        opts
                    );
                }
                break;

            case 3:
                this.instance = args.pop();
                break;
        }
    }

    on(event: String, callback: Function): void {

        this.socket.onCallback(event, (data, ack) => {

            if (ack) {
                callback(data, ack);
            }
            else {
                callback(data);
            }


        });
    };

    connect(): void {
        this.socket.connect();
    }

    emit(...args: any[]): void {
        if (!args) {
            return console.error('Emit Failed: No arguments');
        }

        // Slice parameters into Event and Message/Ack Callback
        const event = args[0];
        let payload = Array.prototype.slice.call(args, 1);

        // Check for ack callback
        let ack = payload.pop();

        // Remove ack if final argument is not a function
        if (ack && typeof ack !== 'function') {
            payload.push(ack);
            ack = null;
        }

        // Send Emit
        if (typeof payload !== 'string') {
            payload = JSON.stringify(payload);
        }
        if (ack) {
            const emit = this.socket.emitWithAckWith(event, payload)
            emit(0, (args) => {

                // Convert Arguments to JS Array from NSArray
                const marshalledArgs = [];
                for (let i = 0; i < args.count; i++) {
                    marshalledArgs.push(args.objectAtIndex(i));
                }

                // Call callback
                ack.apply(null, marshalledArgs);
            });

        }
        else {
            // Emit without Ack Callback
            this.socket.emitWith(event, payload);
        }

    }

    disconnect(): void {
        this.socket.disconnect();
    }

    public get instance() {
        return this.socket;
    }

    public set instance(instance) {
        this.socket = instance;
    }

    joinNamespace(nsp: String): void {
        this.socket.joinNamespace(nsp);
    }

    leaveNamespace(): void {
        this.socket.leaveNamespace();
    }
}