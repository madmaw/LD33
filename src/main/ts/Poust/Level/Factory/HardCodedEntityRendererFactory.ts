module Poust.Level.Factory {

    export function hardCodedEntityRendererFactory(
            defaultEntityRenderer: IEntityRenderer,
            spikeEntityRenderer: IEntityRenderer,
            flappyEntityRenderer: IEntityRenderer,
            bouncyEntityRenderer: IEntityRenderer,
            seekerEntityRenderer: IEntityRenderer,
            exitEntityRenderer: IEntityRenderer,
            playerEntityRenderer: IEntityRenderer,
            bulletEntityRenderer: IEntityRenderer)
    {

        return (entity: IEntity) => {
            if (entity instanceof Poust.Level.Entity.SeekerEntity) {
                return seekerEntityRenderer;
            } else if (entity instanceof Poust.Level.Entity.BouncyEntity) {
                return bouncyEntityRenderer;
            } else if (entity instanceof Poust.Level.Entity.FlappyEntity) {
                return flappyEntityRenderer;
            } else if (entity instanceof Poust.Level.Entity.ObstacleEntity) {
                return spikeEntityRenderer;
            } else if (entity instanceof Poust.Level.Entity.LevelExitEntity) {
                return exitEntityRenderer;
            } else if (entity instanceof Poust.Level.Entity.PlayerEntity) {
                return playerEntityRenderer;
            } else if (entity instanceof Poust.Level.Entity.BulletEntity) {
                return bulletEntityRenderer;
            } else {
                return defaultEntityRenderer;
            }
        };
    }

}