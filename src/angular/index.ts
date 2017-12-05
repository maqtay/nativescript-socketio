import { NgModule, ModuleWithProviders, InjectionToken, Injectable, Inject } from "@angular/core";
import { SocketIO as Socket } from "../socketio";

export interface IOOptions {
    compress: boolean;
    connectParams: { [key: string]: any };
    cookies: string[];
    extraHeaders: { [key: string]: any };
    forceNew: boolean;
    forcePolling: boolean;
    forceWebsockets: boolean;
    log: boolean;
    path: string;
    reconnects: boolean;
    reconnectAttempts: number;
    reconnectWait: number; // Time in milli seconds
    secure: boolean;
}

export type SocketIOOptions = Partial<IOOptions>;

export const SOCKETIO_URL = new InjectionToken("SOCKETIO_URL");
export const SOCKETIO_OPTIONS = new InjectionToken("SOCKETIO_OPTIONS");

@Injectable()
export class SocketIO extends Socket {
    constructor(
        @Inject(SOCKETIO_URL) url: string,
        @Inject(SOCKETIO_OPTIONS) options?: SocketIOOptions
    ) {
        super(url, options);
    }
}

@NgModule()
export class SocketIOModule {
    static forRoot(url: string, options: SocketIOOptions = {}): ModuleWithProviders {
        return {
            ngModule: SocketIOModule,
            providers: [
                SocketIO,
                { provide: SOCKETIO_URL, useValue: url },
                { provide: SOCKETIO_OPTIONS, useValue: options },
            ]
        };
    }
}
