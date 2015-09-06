function levelNameToLevelStatFactoryParam(hash: string) {
    var parts = hash.split("-");
    var difficulty = parseInt(parts[0]);
    var levelName = parts[1];
    if (difficulty !=null && levelName) {
        var p: ILevelStateFactoryParam = {
            difficulty: difficulty,
            levelName: levelName
        }
        return p;
    } else {
        return null;
    }
}