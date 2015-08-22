module Poust {

    export interface IState {

        setStateListener(stateListener: IStateListener): void;

        init(): void;

        start(): void;

        stop(): void;

        destroy(): void;

    }
}

