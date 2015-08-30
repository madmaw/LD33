function delegatingLevelStateFactory(
        stateFactories: { [_: string]: IStateFactory },
        firstLevelName: string,
        jumpSound: ISound,
        shootSound: ISound,
        deathSound: ISound,
        winSound: ISound,
        wallJumpAvailableSound: ISound
    ): IStateFactory {
    var createPlayer = function () {
        var gun = new AbstractGun(300, 600, 6, 0.1, 1, shootSound);
        var player = new PlayerEntity(GroupId.Player, 1, 0.4, gun, deathSound, jumpSound, winSound, wallJumpAvailableSound);
        player.setBounds(600, 0, 32, 24);
        return player;
    };
        
    return function (paramType: number, param: any) {
        

        if (paramType == StateFactoryParamType.LevelLoad) {

            var p: ILevelStateFactoryParam = param;
            if (p.player == null) {
                p.player = createPlayer();
            }

            return stateFactories[param.levelName](paramType, param);
        } else {
            var player = createPlayer();
            var newParam: ILevelStateFactoryParam = {
                player: player,
                levelName: firstLevelName,
                difficulty: 1
            };
            return stateFactories[newParam.levelName](paramType, newParam);
        }
    };
}
