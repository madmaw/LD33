// TODO move to interface
interface IEntityHolder {
    motion?: IMotion;
    motionOffset?: number;
    fullMotionBounds?: PolarBounds;
    entity: IEntity;
    renderer: IEntityRenderer
}



function calculateMotion(holder: IEntityHolder, motionOffset: number, totalMillis: number) {
    holder.motionOffset = motionOffset;
    var remainingTime = totalMillis - motionOffset;
    holder.motion = holder.entity.calculateMotion(remainingTime);
    var entityBounds = holder.entity.bounds;
    var motionBounds = holder.motion.bounds;
    holder.fullMotionBounds = PolarBounds.union(entityBounds, motionBounds);
}


