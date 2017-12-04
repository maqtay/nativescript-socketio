import { Common } from "./socketio-common";
export declare class SocketIO extends Common {
    constructor(...args: any[]);
    on(event: String, callback: Function): void;
    emit(...args: any[]): void;
    joinNamespace(nsp: String): void;
    leaveNamespace(): void;
}
