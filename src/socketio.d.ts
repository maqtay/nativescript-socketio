export declare class SocketIO {
    private socket;
    constructor(...args: any[]);
    on(event: string, callback: any): void;
    connect(): void;
    emit(...args: any[]): void;
    disconnect(): void;
    instance: any;
    joinNamespace(nsp: string): void;
    leaveNamespace(): void;
    static serialize(value: any): any;
    static deserialize(value: any): any;
}
