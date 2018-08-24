import { Common } from './socketio.common';

declare const SocketManager: any, NSURLComponents: any, NSURLQueryItem: any, NSURL: any, NSArray: any,
    NSDictionary: any, NSNull: any, SocketIOStatus: any;

export class SocketIO extends Common {
    protected socket: any;
    manager: any;

    /**
     * Class Constructor
     * args[0]: Connection URL as String
     * args[1]: Connection Options
     */
    constructor(...args: any[]) {
        super();

        let opts = {} as any;
        let urlComponent;
        switch (args.length) {
            case 2:
                urlComponent = NSURLComponents.alloc().initWithString(args[0]);
                const keys = Object.keys(args[1]);
                keys.forEach((key) => {
                    if (key === 'query') {
                        const query = args[1][key];
                        if (typeof query === 'object') {
                            const queryKeys = Object.keys(query);
                            for (let queryKey of queryKeys) {
                                const value = query[queryKey];
                                const queryItem = NSURLQueryItem.queryItemWithNameValue(queryKey, value ? value : '');
                                if (urlComponent.queryItems) {
                                    urlComponent.queryItems = urlComponent.queryItems.arrayByAddingObject(queryItem);
                                }
                            }
                            Object.assign(opts, {connectParams: urlComponent.query});
                        } else if (typeof query === 'string') {
                            Object.assign(opts, {connectParams: `${urlComponent.query}&${query}`});
                        }
                    } else if (key === 'debug') {
                        opts['log'] = true;
                    } else {
                        opts[key] = serialize(args[1][key]);
                    }
                });
                this.manager = SocketManager.alloc().initWithSocketURLConfig(NSURL.URLWithString(args[0]),
                    opts);
                this.socket = this.manager.defaultSocket;
                break;
            case 3:
                const s = args.pop();
                this.manager = s.manager;
                this.socket = s;
                break;
            default:
                urlComponent =  NSURLComponents.alloc().initWithString(args[0]);
                if (urlComponent.queryItems) {
                    Object.assign(opts, {
                        connectParams: urlComponent.query
                    });
                }

                this.manager = SocketManager.alloc().initWithSocketURLConfig(NSURL.URLWithString(args[0]),
                    opts);
                this.socket = this.manager.defaultSocket;
                break;
        }
    }

    connect() {
        this.socket.connect();
    }

    disconnect() {
        this.socket.disconnect();
    }

    get connected(): boolean {
        return this.socket.status === SocketIOStatus.Connected;
    }

    on(event: string, callback: (...payload) => void): void {
        this.socket.onCallback(event, (data, ack) => {
           const d = deserialize(data);
            if (Array.isArray(d)) {
                data = d[0];
            } else {
                data = d;
            }

            if (ack) {
                callback(data, ack);
            } else {
                callback(data);
            }
        });
    }

    once(event: string, callback: (...payload) => void): void {
        this.socket.onceCallback(event, (data, ack) => {
            const d = deserialize(data);
            if (Array.isArray(d)) {
                data = d[0];
            } else {
                data = d;
            }

            if (ack) {
                callback(data, ack);
            } else {
                callback(data);
            }
        });
    }

    off(event: string) {
        this.socket.off(event);
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
        const final = (<any>payload).map(serialize);

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

    joinNamespace(nsp: string): SocketIO {
        return new SocketIO(null, null, this.manager.socketForNamespace(nsp));
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
                return NSArray.arrayWithArray((<any>data).map(serialize));
            }

            let node = {} as any;
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