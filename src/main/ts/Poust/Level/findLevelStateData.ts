function findLevelStateData(difficulty: number, levelName: string, force?: boolean): ILevelStateData {
    var s = localStorage.getItem("" + difficulty + "-" + levelName);
    if (s != null) {
        return JSON.parse(s);
    } else {
        if (force) {
            var data = {
                attempts: 0,
                bestTime: null,
                seed: Math.floor(Math.random() * 999999) + 1
            };
            saveLevelStateData(difficulty, levelName, data);
            return data;
        } else {
            return null;
        }
    }
}