class MenuState extends AbstractState {

    constructor(element: Element, private _levelSelectElementId: string, private _levelNames: { [_: string]: any }) {
        super(element);
    }

    start(): void {
        super.start();
        var levelSelectElement = <HTMLElement>this._element.querySelector("#" + this._levelSelectElementId);
        // remove all children
        var innerHTML = "";
        // populate from local storage
        var difficulty = 1;
        var done = false;
        var first = true;
        var levels: string[] = [];
        while (!done) {
            for (var levelName in this._levelNames) {
                var name = "" + difficulty + "-" + levelName;
                var data = loadLevelStateData(difficulty, levelName, false);
                if (data || first) {
                    var attempts: number;
                    if (!data) {
                        attempts = 0;
                    } else {
                        attempts = data.attempts;
                    }
                    // show it
                    var time: string;
                    if (data && data.bestTime) {
                        time = toTimeString(data.bestTime);
                    } else {
                        time = "-:--";
                    }
                    var s = "<a id=L" + name + " class='l'><div>" + name + "</div><div>" + attempts + "</div><div>" + time + "</div>";

                    innerHTML = s + innerHTML;
                    levels.push(name);
                } else {
                    done = true;
                    break;
                }
                first = false;
            }
            difficulty++;
        }
        levelSelectElement.innerHTML = innerHTML;
        for (var i in levels) {
            var level = levels[i];
            // look up things to put listeners on
            var levelElement = <HTMLElement>levelSelectElement.querySelector("#L" + level);
            if (levelElement) {
                var f = ((difficultyAndLevelName: string) => {
                    return (event: MouseEvent) => {
                        var param = levelNameToLevelStatFactoryParam(difficultyAndLevelName);
                        this.fireStateChangeEvent(StateFactoryParamType.LevelLoad, param);
                    };
                })(level);
                levelElement.onclick = f;
                if (i == levels.length - 1) {
                    var playElement = <HTMLElement>this._element.querySelector("h1");
                    playElement.onclick = f;
                }
            }
        }
    }

}