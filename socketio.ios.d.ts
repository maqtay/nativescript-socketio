export declare class SocketIO {
    private socket;
    constructor(...args: any[]);
    on(event: string, callback: void): void;
    connect(): void;
    emit(...args: any[]): void;
    disconnect(): void;
    instance: any;
    joinNamespace(nsp: string): void;
    leaveNamespace(): void;
    static deserialize(value: any): any;
}
