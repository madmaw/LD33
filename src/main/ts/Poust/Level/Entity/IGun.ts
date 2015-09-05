interface IGun {

    update(
        diffMillis: number,
        state: LevelState,
        onGround: boolean,
        charging: boolean,
        r: number,
        a: number,
        vr: number, 
        va: number,
        targets: IPolarPoint[], 
        createdEntities: IEntity[]
    ): IPolarPoint;

}