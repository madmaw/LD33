interface ILevelExitEntity extends AbstractPolarEntity {
    nextLevelParamsFactory: (player: PlayerEntity) => any;
}

function createLevelExitEntity(nextLevelParamsFactory: (player: PlayerEntity) => any) {
    var result = <ILevelExitEntity>(new AbstractPolarEntity(GROUP_ID_ENEMY, ENTITY_TYPE_ID_EXIT));
    result.nextLevelParamsFactory = nextLevelParamsFactory;
    return result;
}
