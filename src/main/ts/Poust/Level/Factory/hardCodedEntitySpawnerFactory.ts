function hardCodedEntitySpawnerFactory(deathSound: ISound): IEntitySpawnerFactory {

    return function (rng: IRandomNumberGenerator): IEntitySpawner {

        // are we doing something special?
        var numTypes = 5;
        var preference;
        if (rng() < 0.1 ) {
            preference = Math.floor(rng() * numTypes);
        } else {
            preference = null;
        }

        return function (a: number, r: number, maxHeight: number, arc: number, difficulty: number) {
            var entities: IEntity[] = [];
            var quantity = (difficulty * rng() * arc * r) / 500 + rng() * difficulty;

            var maxCost = Math.ceil(difficulty);

            while (quantity > 1 && difficulty > 0) {

                var cost = (rng() * quantity) % numTypes;
                cost = Math.min(cost, maxCost);
                var amount = Math.floor(cost);
                if (amount && preference) {
                    // are you suuure?
                    if (rng() < 0.8 && preference <= difficulty) {
                        amount = preference;
                    }
                }
                var entity: AbstractPolarEntity;
                var entityWidth = 32;
                var entityR = r;
                switch (amount) {
                    case 0:
                        entity = null;
                        break;
                    case 1:
                        {
                            var obstacle: AbstractPolarEntity;
                            if (difficulty * rng() < 3) {
                                obstacle = createChomperEntity(deathSound, rng() > 0.5);
                            } else {
                                obstacle = obstacleEntity();
                                entityWidth = 22 + difficulty * rng();
                            }
                            entity = obstacle;
                        }
                        break;
                    case 2:
                        {
                            var flappy = new FlappyEntity(GroupId.Enemy, 1, deathSound, rng() > 0.5, 0.06 + difficulty * 0.01, 0.3, r + maxHeight * rng() / 4);
                            //flappy.setBounds(r + maxHeight / 2, a + rng() * arc, 32, 32);
                            entityR = r + maxHeight / 2;
                            entity = flappy;
                        }
                        break;
                    case 3:
                        {
                            var bouncer = new BouncyEntity(GroupId.Enemy, 1, deathSound, 0.05 + difficulty * 0.02, rng() > 0.5, rng() > 0.5);
                            //bouncer.setBounds(r, a + rng() * arc, 32, 32);
                            entity = bouncer;
                        }
                        break;
                    case 4:
                        {
                            var seeker = new SeekerEntity(GroupId.Enemy, 1, deathSound, 200 + 30 * difficulty, 0.1, 1.1, 0.1, 0.3, 0.65);
                            //seeker.setBounds(r, a + rng() * arc, 40, 40);
                            entityWidth = 40;
                            entity = seeker;
                        }
                }
                if (entity) {
                    var livingEntity = <AbstractLivingPolarEntity>entity;
                    if (livingEntity._health) {
                        var health = livingEntity._health;
                        var maxh = maxHeight - (entityR - r);
                        while (entityWidth * 2 < maxh && rng() * 100 < difficulty * quantity) {
                            entityWidth *= 1.5;
                            entity.mass *= 2;
                            health++;
                            quantity -= cost;
                        }
                        livingEntity._health = health;
                    }
                    var ae = a + rng() * (arc - entityWidth / entityR);
                    entity.setBounds(r, ae, entityWidth, entityWidth);
                    entities.push(entity);
                }
                // what can we buy?
                quantity -= cost;

            }
            return entities;
        }
    }

}
