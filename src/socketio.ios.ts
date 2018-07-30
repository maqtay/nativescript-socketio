import { Common } from './socketio-common';

export class SocketIO extends Common {
    protected socket: SocketIOClient;
    manager: SocketManager;

    /**
     * Class Constructor
     * args[0]: Connection URL as String
     * args[1]: Connection Options
     */
    constructor(...args: any[]) {
        super();

        let opts = {} as any;
        switch (args.length) {
            case 1: {
                this.manager = SocketManager.alloc().initWithSocketURLConfig(NSURL.URLWithString(args[0]),
                    opts);
                this.socket = this.manager.defaultSocket;
                break;
            }
            case 2: {
                const keys = Object.keys(args[1]);
                keys.forEach((key, index) => {
                    if (key === 'query') {
                        Object.assign(opts, {connectParams: args[1][key]});
                    } else {
                        opts[key] = serialize(args[1][key]);
                    }
                });
                this.manager = SocketManager.alloc().initWithSocketURLConfig(NSURL.URLWithString(args[0]),
                    opts);
                this.socket = this.manager.defaultSocket;
                break;
            }

            case 3: {
                const s = args.pop();
                this.manager = args.pop().manager;
                this.socket = s;
                break;
            }
            default:
        }
    }

    connect() {
        this.socket.connect();
    }

    disconnect() {
        this.socket.disconnect();
    }

    get connected(): boolean {
        return this.socket && this.socket.manager.engine.connected;
    }

    on(event: string, callback: (...payload) => void): void {
        this.socket.onCallback(event, (data, ack) => {
            const d = deserialize(data);
            if(Array.isArray(d)){
                data = d[0];
            }else{
                data = d;
            }

            if (ack) {
                callback(data, ack);
            } else {
                callback(data);
            }
        });
    }

    emit(event: string, ...payload: any[]): void {
        if (!event) {
            return console.error('Emit Failed: No Event argument');
        }

        // Check for ack callback
        let ack = payload.pop();

        // Remove ack if final argument is not a function
        if (ack && typeof ack !== 'function') {
            payload.push(ack);
            ack = null;
        }

        // Serialize Emit
        const final = (<any>payload).map(serialize) as NSArray<any>;

        if (ack) {
            const _ack = function (args) {
                ack.apply(null, deserialize(args));
            };
            const e = this.socket.emitWithAckWith(event, final) as any;
            if (e) {
                e.timingOutAfterCallback(0, _ack);
            }
        } else {
            // Emit without Ack Callback
            this.socket.emitWith(event, final);
        }
    }

    joinNamespace(nsp: string): void {
        this.socket.manager.socketForNamespace(nsp);
    }

    leaveNamespace(): void {
        this.socket.leaveNamespace();
    }
}

export function serialize(data: any): any {
    switch (typeof data) {
        case 'string':
        case 'boolean':
        case 'number': {
            return data;
        }

        case 'object': {
            if (data instanceof Date) {
                return data.toJSON();
            }

            if (!data) {
                return NSNull.new();
            }

            if (Array.isArray(data)) {
                return NSArray.arrayWithArray((<any>data).map(serialize) as NSArray<any>);
            }

            let node = {} as NSDictionary<string, any>;
            Object.keys(data).forEach(function (key) {
                let value = data[key];
                node[key] = serialize(value);
            });
            return NSDictionary.dictionaryWithDictionary(node);
        }

        default:
            return NSNull.new();
    }
}

export function deserialize(data): any {
    if (data instanceof NSNull) {
        return null;
    }

    if (data instanceof NSArray) {
        let array = [];
        for (let i = 0, n = data.count; i < n; i++) {
            array[i] = deserialize(data.objectAtIndex(i));
        }
        return array;
    }

    if (data instanceof NSDictionary) {
        let dict = {};
        for (let i = 0, n = data.allKeys.count; i < n; i++) {
            let key = data.allKeys.objectAtIndex(i);
            dict[key] = deserialize(data.objectForKey(key));
        }
        return dict;
    }

    return data;
}
