function hardCodedEntityRendererFactory(
        defaultEntityRenderer: IEntityRenderer,
        spikeEntityRenderer: IEntityRenderer,
        flappyEntityRenderer: IEntityRenderer,
        bouncyEntityRenderer: IEntityRenderer,
        seekerEntityRenderer: IEntityRenderer,
        exitEntityRenderer: IEntityRenderer,
        playerEntityRenderer: IEntityRenderer,
        bulletEntityRenderer: IEntityRenderer,
        chomperEntityRenderer: IEntityRenderer)
{

    return (entity: IEntity) => {
        if (entity instanceof SeekerEntity) {
            return seekerEntityRenderer;
        } else if (entity instanceof BouncyEntity) {
            return bouncyEntityRenderer;
        } else if (entity instanceof FlappyEntity) {
            return flappyEntityRenderer;
        } else if (entity instanceof ObstacleEntity) {
            return spikeEntityRenderer;
        } else if (entity instanceof LevelExitEntity) {
            return exitEntityRenderer;
        } else if (entity instanceof PlayerEntity) {
            return playerEntityRenderer;
        } else if (entity instanceof BulletEntity) {
            return bulletEntityRenderer;
        } else if (entity instanceof ChomperEntity) {
            return chomperEntityRenderer;
        } else {
            return defaultEntityRenderer;
        }
    };
}

