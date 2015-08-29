module Poust.Level {

    export interface IEntityRenderer {

        (context: CanvasRenderingContext2D, entity: IEntity): void;

    }

}