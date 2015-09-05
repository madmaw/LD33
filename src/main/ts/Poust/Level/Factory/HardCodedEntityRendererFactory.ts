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
        } else if ((<ILevelExitEntity>entity).nextLevelParamsFactory) {
            return exitEntityRenderer;
        } else if (entity instanceof PlayerEntity) {
            return playerEntityRenderer;
        } else if (entity instanceof BulletEntity) {
            return bulletEntityRenderer;
        } else if (entity instanceof AbstractLivingPolarEntity) {
            return chomperEntityRenderer;
        } else if (entity instanceof AbstractPolarEntity) {
            return spikeEntityRenderer;
        } else {
            return defaultEntityRenderer;
        }
    };
}

