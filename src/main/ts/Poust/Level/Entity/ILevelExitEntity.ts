interface ILevelExitEntity extends AbstractEntity {
    nextLevelParamsFactory: (player: PlayerEntity) => any;
}

function createLevelExitEntity(nextLevelParamsFactory: (player: PlayerEntity) => any) {
    var result = <ILevelExitEntity>(new AbstractEntity(GroupId.Enemy));
    result.nextLevelParamsFactory = nextLevelParamsFactory;
    return result;
}
