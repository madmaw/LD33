module Poust.Level {

    export interface IEntityRendererFactory {
        (entity: IEntity): IEntityRenderer;
    }

}