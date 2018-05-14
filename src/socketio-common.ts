/**
 *
 */
export abstract class Common {
    protected abstract socket; /** Contains instance of Socket */

    abstract emit(event: string, ...payload: any[]): void;
    abstract on(event: string, callback: (...payload) => void): void;

    abstract connected: boolean;

    get disconnected() {
        return !this.connected;
    }

    get instance() {
        return this.socket;
    }

    abstract joinNamespace(nsp: String): void;
    abstract leaveNamespace(): void;

    public connect() {
        this.socket.connect();
    }

    public disconnect() {
        this.socket.disconnect();
    }
}
