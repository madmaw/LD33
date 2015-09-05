function ageToScale(entity: IEntity, mod: number): number {

    var age = entity.getStateAgeMillis() % mod;
    age -= mod/2;
    age = Math.abs(age);    
    return (age * 2) / mod;
}