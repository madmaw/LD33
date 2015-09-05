interface IChomperEntity extends AbstractLivingPolarEntity {
    _flipped: boolean;
}


function createChomperEntity(deathSound: ISound, flipped: boolean) {
    var result = <IChomperEntity>(new AbstractLivingPolarEntity(GroupId.Enemy, 1, false, deathSound));
    result.setSensor(true);
    result._flipped = flipped;
    return result;
}