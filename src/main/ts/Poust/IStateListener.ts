module Poust {

    export interface IStateListener {
        (source: IState, param: any) : void;
    }

}