import { device } from "tns-core-modules/platform/platform";
import { Common } from "./socketio-common";

export class SocketIO extends Common {
    protected socket: SocketIOClient;

    /**
     * Class Constructor
     * args[0]: Connection URL as String
     * args[1]: Connection Options
     */
    constructor(...args: any[]) {
        super();

        let opts = {} as NSDictionary<any, any>;
        switch (args.length) {
            case 1: {
                if (parseInt(device.osVersion) >= 10) {
                    this.socket = SocketIOClient.alloc().initWithSocketURLConfig(
                        NSURL.URLWithString(args[0]),
                        opts
                    );
                } else {
                    this.socket = (<any>SocketIOClient).alloc().initWithSocketURLOptions(
                        NSURL.URLWithString(args[0]),
                        opts
                    );
                }
                break;
            }

            case 2: {
                const keys = Object.keys(args[1]);
                keys.forEach((key, index) => {
                    if (key === "query") {
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
                    this.socket = (<any>SocketIOClient).alloc().initWithSocketURLOptions(
                        NSURL.URLWithString(args[0]),
                        opts
                    );
                }
                break;
            }

            case 3: {
                this.socket = args.pop();
                break;
            }

            default:
        }
    }

    get connected(): boolean {
        return this.socket && this.socket.engine.connected;
    }

    on(event: string, callback: (...payload) => void): void {
        this.socket.onCallback(event, (data, ack) => {
            if (ack) {
                callback(data, ack);
            } else {
                callback(data);
            }
        });
    }

    emit(event: string, ...payload: any[]): void {
        if (!event) {
            return console.error("Emit Failed: No Event argument");
        }

        // Check for ack callback
        let ack = payload.pop();

        // Remove ack if final argument is not a function
        if (ack && typeof ack !== "function") {
            payload.push(ack);
            ack = null;
        }

        // Serialize Emit
        const final = (<any>payload).map(serialize) as NSArray<any>;

        if (ack) {
            const _ack = function (args) {
                ack.apply(null, deserialize(args));
            };
            this.socket.emitWithAckWith(event, final).timingOutAfterCallback(0, _ack);
        } else {
            // Emit without Ack Callback
            this.socket.emitWith(event, final);
        }
    }

    joinNamespace(nsp: string): void {
        this.socket.joinNamespace(nsp);
    }

    leaveNamespace(): void {
        this.socket.leaveNamespace();
    }
}

export function serialize(data: any): any {
    switch (typeof data) {
        case "string":
        case "boolean":
        case "number": {
            return data;
        }

        case "object": {
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

        default: return NSNull.new();
    }
}

export function deserialize(data: any): any {
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
