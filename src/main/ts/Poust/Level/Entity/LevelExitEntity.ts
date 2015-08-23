module Poust.Level.Entity{

    export class LevelExitEntity extends AbstractEntity {

        constructor(public _nextLevelParamsFactory: (player: PlayerEntity) => any) {
            super(GroupId.Enemy);
            this.setSensor(true);
        }

    }

}