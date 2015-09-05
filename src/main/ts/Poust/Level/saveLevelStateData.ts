function saveLevelStateData(difficulty: number, levelName: string, data: ILevelStateData) {
    var s = JSON.stringify(data);
    localStorage.setItem("" + difficulty + "-" + levelName, s);
}