class ChomperEntity extends AbstractLivingPolarEntity {

    constructor(groupId: number, mass: number, deathSound: ISound, public _flipped: boolean) {
        super(groupId, mass, false, deathSound);
        this.setSensor(true);
    }


    notifyCollision(withEntity: IEntity, onEdge: number): void {
        if (withEntity instanceof BulletEntity) {
            // we're dead
            this.setDying(withEntity);
        } 
    }


}