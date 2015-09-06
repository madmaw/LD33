function saveLevelStateData(difficulty: number, levelName: string, data: ILevelStateData) {
    var o = {
        'a': data.attempts,
        't': data.bestTime,
        's': data.seed
    };
    var s = JSON.stringify(o);
    localStorage.setItem("" + difficulty + "-" + levelName, s);
}