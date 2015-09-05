class AbstractState implements IState {

    private _stateListener: IStateListener;
    private _started: boolean;

    constructor(public _element: Element) {
        this._started = false;
        this._stateListener = null;
    }

    setStateListener(stateListener: IStateListener): void {
        this._stateListener = stateListener;
    }

    init(): void {
        this._element.setAttribute("class", "");
    }

    start(): void {
        this._started = true;
    }

    stop(): void {
        this._started = false;
    }

    destroy(): void {
        this._element.setAttribute("class", "h");
    }

    public isStarted() {
        return this._started;
    }

    public fireStateChangeEvent(paramType: number, param: any) {
        if (this._stateListener) {
            this._stateListener(this, paramType, param);
        }
    }


}
