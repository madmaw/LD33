function loadLevelStateData(difficulty: number, levelName: string, force?: boolean): ILevelStateData {
    var s = localStorage.getItem("" + difficulty + "-" + levelName);
    var data: ILevelStateData;
    if (s) {
        var o = JSON.parse(s);
        data = {
            attempts: o['a'],
            seed: o['s'],
            bestTime: o['t']
        };
        if (!data.attempts) {
            data = null;
        }
    } 
    if(!data && force){
        data = {
            attempts: 0,
            bestTime: null,
            seed: Math.floor(Math.random() * 1000000000)
        };
        saveLevelStateData(difficulty, levelName, data);
    }
    return data;
}