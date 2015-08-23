module Poust.Level.Factory {

    export class HardCodedEntityRendererFactory {

        

        public constructor(
            private _defaultEntityRenderer: IEntityRenderer,
            private _spikeEntityRenderer: IEntityRenderer,
            private _flappyEntityRenderer: IEntityRenderer,
            private _bouncyEntityRenderer: IEntityRenderer,
            private _seekerEntityRenderer: IEntityRenderer) {

        }

        createEntityRendererFactory(): IEntityRendererFactory {
            return (entity: IEntity) => {
                if (entity instanceof Poust.Level.Entity.SeekerEntity) {
                    return this._seekerEntityRenderer;
                } else if (entity instanceof Poust.Level.Entity.BouncyEntity) {
                    return this._bouncyEntityRenderer;
                } else if (entity instanceof Poust.Level.Entity.FlappyEntity) {
                    return this._flappyEntityRenderer;
                } else if (entity instanceof Poust.Level.Entity.ObstacleEntity) {
                    return this._spikeEntityRenderer;
                } else {
                    return this._defaultEntityRenderer;
                }
            };
        }


    }

}