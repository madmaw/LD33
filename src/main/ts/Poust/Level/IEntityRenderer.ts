module Poust.Level {

    export interface IEntityRenderer {

        render(context: CanvasRenderingContext2D, entity: IEntity): void;

    }

}