module Poust.Level.Factory {

    export class DelegatingLevelStateFactory {

        public constructor(
            private _stateFactories: { [_: string]: IStateFactory },
            private _firstLevelName: string,
            private _jumpSound: ISound,
            private _shootSound: ISound,
            private _deathSound: ISound,
            private _winSound: ISound
        ) {

        }


        public createStateFactory(): IStateFactory {
            return (param: LevelStateFactoryParam) => {
                if (param instanceof LevelStateFactoryParam) {
                    return this._stateFactories[param.levelName](param);
                } else {
                    var gun = new Poust.Level.Entity.Gun.AbstractGun(300, 600, 6, 0.1, 1, this._shootSound);
                    var player = new Poust.Level.Entity.PlayerEntity(Poust.Level.GroupId.Player, 1, 0.4, gun, this._deathSound, this._jumpSound, this._winSound);
                    player.setBounds(600, 0, 32, 24);
                    var newParam = new LevelStateFactoryParam(player, this._firstLevelName, 1);
                    //var newParam = new LevelStateFactoryParam(player, "2", 5);
                    return this._stateFactories[newParam.levelName](newParam);
                }
            };
        }

    }

}