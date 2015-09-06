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
            var d = difficulty;

            var maxCost = Math.ceil(difficulty);

            while (quantity > 1 && difficulty > 0) {

                var cost = (rng() * quantity) % numTypes;
                cost = Math.min(cost, maxCost);
                var amount = Math.floor(cost);
                if (amount && preference) {
                    // are you suuure?
                    if (Math.floor(rng() % numTypes) != amount && preference <= difficulty) {
                        amount = preference;
                    }
                }
                var entity: IEntity;
                switch (amount) {
                    case 0:
                        entity = null;
                        break;
                    case 1:
                        {
                            var width: number;
                            var height: number;
                            var obstacle: AbstractPolarEntity;
                            if (difficulty < rng() * 10 + 1) {
                                obstacle = createChomperEntity(deathSound, rng() > 0.5);
                                height = 32;
                                width = 32;
                            } else {
                                obstacle = obstacleEntity();
                                var d = difficulty * rng();
                                height = 22 + d;
                                width = 22 + d;
                            }
                            var ae = a + rng() * (arc - width / r);
                            obstacle.setBounds(r, ae, height, width);
                            entity = obstacle;
                        }
                        break;
                    case 2:
                        {
                            var flappy = new FlappyEntity(GroupId.Enemy, 1, deathSound, rng() > 0.5, 0.06 + difficulty * 0.01, 0.3, r + maxHeight * rng() / 2);
                            flappy.setBounds(r + maxHeight / 2, a + rng() * arc, 32, 32);
                            entity = flappy;
                        }
                        break;
                    case 3:
                        {
                            var bouncer = new BouncyEntity(GroupId.Enemy, 1, deathSound, 0.05 + difficulty * 0.02, rng() > 0.5, rng() > 0.5);
                            bouncer.setBounds(r, a + rng() * arc, 32, 32);
                            entity = bouncer;
                        }
                        break;
                    case 4:
                        {
                            var seeker = new SeekerEntity(GroupId.Enemy, 1, deathSound, 200 + 30 * difficulty, 0.1, 1.1, 0.1, 0.3, 0.65);
                            seeker.setBounds(r, a + rng() * arc, 40, 40);
                            entity = seeker;
                        }
                }
                if (entity) {
                    entities.push(entity);
                }
                var livingEntity = <AbstractLivingPolarEntity>entity;
                if (livingEntity && livingEntity._health) {
                    var health = livingEntity._health;
                    var h = livingEntity._heightPx;
                    var w = livingEntity._widthPx;
                    var maxh = maxHeight - (livingEntity.getBounds()._r - r);
                    while (h * 2 < maxh && rng() * 50 < d) {
                        w *= 1.5;
                        h *= 1.5;
                        health++;
                        d--;
                    }
                    livingEntity._health = health;
                    livingEntity._widthPx = w;
                    livingEntity._heightPx = h;
                }
                // what can we buy?
                quantity -= cost;

            }
            return entities;
        }
    }

}
