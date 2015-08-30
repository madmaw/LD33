class EntityHolder {

    public motion: IMotion;

    public motionOffset: number;

    public fullMotionBounds: PolarBounds;

    public constructor(public entity: IEntity, public renderer: IEntityRenderer) {

    }

    public calculateMotion(motionOffset: number, totalMillis: number) {
        this.motionOffset = motionOffset;
        var remainingTime = totalMillis - motionOffset;
        this.motion = this.entity.calculateMotion(remainingTime);
        var entityBounds = this.entity.getBounds();
        var motionBounds = this.motion.getBounds();
        this.fullMotionBounds = PolarBounds.union(entityBounds, motionBounds);
    }
}

