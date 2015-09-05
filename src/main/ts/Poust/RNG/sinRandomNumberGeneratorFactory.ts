function sinRandomNumberGeneratorFactory(): IRandomNumberGeneratorFactory {
    return function (seed: number): IRandomNumberGenerator {
        return function (): number {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }
    }
}