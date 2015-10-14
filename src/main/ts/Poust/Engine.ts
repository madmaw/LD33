class Engine {

    private _state: IState;
    private _stateListener: IStateListener;

    public constructor(private _stateFactory: IStateFactory) {
        this._stateListener = (source: IState, paramType: number, param: any) => {
            
            if (source == this._state) {
                var pageId: string;
                var hash = location.hash;
                if (paramType == StateFactoryParamType.LevelLoad) {
                    var stateFactoryParam = <ILevelStateFactoryParam>param;
                    pageId = "" + stateFactoryParam.difficulty + "-" + stateFactoryParam.levelName;
                    var levelId = "#" + pageId;
                    if (hash != levelId) {
                        // replace with our current state and let the history manager load it
                        var newURL = location.href.substr(0, location.href.length - hash.length) + levelId;
                        // just stop the current state
                        if (hash) {
                            history.replaceState(null, null, newURL);
                        } else {
                            history.pushState(null, null, newURL);
                        }
                    }
                } else {
                    pageId = "";
                }
                this.setStateFromParam(paramType, param, pageId);

            }
        };
    }

    public setStateFromParam(paramType: number, param : any, pageId : string) {
        var state = this._stateFactory(paramType, param);
        if (_w['ga']) {
            ga('send', 'pageview', {
                page: pageId
            });
        }
        this.setState(state);
    }

    public setState(state: IState) {
        if (this._state) {
            this._state.setStateListener(null);
            this._state.stop();
            this._state.destroy();
        }
        this._state = state;
        if (state) {
            state.setStateListener(this._stateListener);
            state.init();
            state.start();
        }
    }

}
