import { ModuleWithProviders, InjectionToken } from "@angular/core";
import { SocketIO as Socket } from "../socketio";
export interface IOOptions {
    compress: boolean;
    connectParams: {
        [key: string]: any;
    };
    cookies: string[];
    extraHeaders: {
        [key: string]: any;
    };
    forceNew: boolean;
    forcePolling: boolean;
    forceWebsockets: boolean;
    log: boolean;
    path: string;
    reconnects: boolean;
    reconnectAttempts: number;
    reconnectWait: number;
    secure: boolean;
}
export declare type SocketIOOptions = Partial<IOOptions>;
export declare const SOCKETIO_URL: InjectionToken<{}>;
export declare const SOCKETIO_OPTIONS: InjectionToken<{}>;
export declare class SocketIO extends Socket {
    constructor(url: string, options?: SocketIOOptions);
}
export declare class SocketIOModule {
    static forRoot(url: string, options?: SocketIOOptions): ModuleWithProviders;
}
