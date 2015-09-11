interface IChomperEntity extends AbstractLivingPolarEntity {
    flipped: boolean;
}


function createChomperEntity(deathSound: ISound) {
    var result = <IChomperEntity>(new AbstractLivingPolarEntity(GROUP_ID_ENEMY, ENTITY_TYPE_ID_CHOMPER, deathSound));
    result.mass = 1;
    //result._flipped = flipped;
    return result;
}