function delegatingLevelStateFactory(
        stateFactories: { [_: string]: IStateFactory },
        menuState: IState,
        firstLevelName: string,
        jumpSound: ISound,
        shootSound: ISound,
        deathSound: ISound,
        winSound: ISound,
        wallJumpAvailableSound: ISound
    ): IStateFactory {
    var createPlayer = function () {
        var gun = new AbstractGun(100, 0.03, shootSound);
        var player = new PlayerEntity(GroupId.Player, 1, 0.4, gun, deathSound, jumpSound, winSound, wallJumpAvailableSound);
        player.setBounds(600, 0, 32, 24);
        return player;
    };
        
    return function (paramType: number, param: any) {
        

        if (paramType == StateFactoryParamType.LevelLoad) {

            var p: ILevelStateFactoryParam = param;
            if (!p.player) {
                p.player = createPlayer();
            }
            if (!p.seed) {
                // lookup the seed for this level
                var data = loadLevelStateData(p.difficulty, p.levelName, true);
                p.seed = data.seed;
            }

            return stateFactories[param.levelName](paramType, param);
        } else {
            return menuState;
            /*

            var player = createPlayer();
            var newParam: ILevelStateFactoryParam = {
                player: player,
                levelName: firstLevelName,
                difficulty: 1
            };
            return stateFactories[newParam.levelName](paramType, newParam);
            */
        }
    };
}
