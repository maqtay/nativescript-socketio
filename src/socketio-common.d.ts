export declare abstract class Common {
    protected socket: any;
    abstract emit(...args: any[]): void;
    abstract on(event: string, callback: any): void;
    abstract joinNamespace(nsp: String): void;
    abstract leaveNamespace(): void;
    connect(): void;
    disconnect(): void;
    instance: any;
}
