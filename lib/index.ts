export interface IDisposable {
    dispose(): void;
}

export type IListener<T> = (event: T) => any;

// Credit to https://basarat.gitbooks.io/typescript/

/** passes through events as they happen. You will not get events from before you start listening */
export class TypedEvent<T = {}> {
    private listeners: Array<IListener<T>> = [];
    private listenersOncer: Array<IListener<T>> = [];

    public on = (listener: IListener<T>): IDisposable => {
        this.listeners.push(listener);
        return {
            dispose: () => this.off(listener),
        };
    }

    public once = (listener: IListener<T>): void => {
        this.listenersOncer.push(listener);
    }

    public off = (listener: IListener<T>) => {
        const callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) {
            this.listeners.splice(callbackIndex, 1);
        }
    }

    public emit = (event: T) => {
        const listeners: Array<(event: T) => void>  = Object.assign([], this.listeners);

        /** Update any general listeners */
        listeners.forEach((listener) => listener(event));

        const oncers: Array<(event: T) => void>  = Object.assign([], this.listenersOncer);
        this.listenersOncer = [];

        /** Clear the `once` queue */
        oncers.forEach((listener) => listener(event));
    }

    public pipe = (te: TypedEvent<T>): IDisposable => {
        return this.on((e) => te.emit(e));
    }
}
