interface IGridFactory {
    (rng: IRandomNumberGenerator, width: number, height: number, wrap: boolean, fromX: number, fromY: number, toX: number, toY: number, difficulty: number, ringOffset: number): Grid;

}