module Poust.Level.Factory {

    export class DelegatingLevelStateFactory {

        public constructor(private _stateFactories: { [_: string]: IStateFactory }, private _firstLevelName: string) {

        }


        public createStateFactory(): IStateFactory {
            return (param: LevelStateFactoryParam) => {
                if (param instanceof LevelStateFactoryParam) {
                    return this._stateFactories[param.levelName](param);
                } else {
                    var gun = new Poust.Level.Entity.Gun.AbstractGun(300, 600, 6, 0.1, 1);
                    var player = new Poust.Level.Entity.PlayerEntity(Poust.Level.GroupId.Player, 1, 0.4, gun);
                    player.setBounds(600, 0, 32, 24);
                    var newParam = new LevelStateFactoryParam(player, this._firstLevelName, 1);
                    return this._stateFactories[this._firstLevelName](newParam);
                }
            };
        }

    }

}