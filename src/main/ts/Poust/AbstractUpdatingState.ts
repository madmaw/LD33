﻿class AbstractUpdatingState extends AbstractState {

    private _animationFrameCallback: FrameRequestCallback;
    private _lastUpdateMillis: number;


    public constructor(_element: Element) {
        super(_element);
        this._animationFrameCallback = (timeMillis: number) => {
            if (this.isStarted()) {
                if (this._lastUpdateMillis != null) {
                    var diff = timeMillis - this._lastUpdateMillis;
                    // don't let it run for too long
                    diff = Math.min(diff, 100);
                    if (diff > 0) {
                        //diff = 20;
                        this.update(diff);
                        this.render();
                    }
                }
                this._lastUpdateMillis = timeMillis;
                if (this.isStarted()) {
                    requestAnimationFrame(this._animationFrameCallback);
                }
            } else {
                this._lastUpdateMillis = null;
            }
        };
    }

    start(): void {
        super.start();
        requestAnimationFrame(this._animationFrameCallback);
    }

    stop(): void {
        super.stop();
    }

    public update(diffMillis: number): void {

    }

    public render(): void {

    }

}
