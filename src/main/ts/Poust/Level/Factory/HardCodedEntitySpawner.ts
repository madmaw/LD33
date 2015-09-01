function hardCodedEntitySpawner(deathSound: ISound): IEntitySpawner {

    return function (a: number, r: number, maxHeight: number, arc: number, difficulty: number) {
        var entities: IEntity[] = [];
        var quantity = difficulty * Math.random() * 2;

        while (quantity > 1) {

            var cost = (Math.random() * quantity) % 5;
            var amount = Math.floor(cost);
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
                        if (difficulty < Math.random() * 10 + 1) {
                            obstacle = new ChomperEntity(GroupId.Enemy, 1, deathSound, Math.random() > 0.5);
                            height = 32 + difficulty * 2;
                            width = 28 + difficulty * 1.9;
                        } else {
                            obstacle = new ObstacleEntity(GroupId.Enemy);
                            height = 22 + difficulty;
                            width = 22 + difficulty;
                        }
                        var ae = a + Math.random() * (arc - width / r);
                        obstacle.setBounds(r, ae, height, width);
                        entity = obstacle;
                    }
                    break;
                case 2:
                    {
                        var flappy = new FlappyEntity(GroupId.Enemy, 1, deathSound, Math.random() > 0.5, 0.06 + difficulty * 0.01, 0.3, r + maxHeight * Math.random() / 2);
                        flappy.setBounds(r + maxHeight / 2, a + Math.random() * arc, 24 + difficulty, 24 + difficulty);
                        entity = flappy;
                    }
                    break;
                case 3:
                    {
                        var bouncer = new BouncyEntity(GroupId.Enemy, 1, deathSound, 0.05 + difficulty * 0.02, Math.random() > 0.5, Math.random() > 0.5);
                        bouncer.setBounds(r, a + Math.random() * arc, 30, 30);
                        entity = bouncer;
                    }
                    break;
                case 4:
                    {
                        var seeker = new SeekerEntity(GroupId.Enemy, 1, deathSound, 200 + 30 * difficulty, 0.1, 1.1, 0.1, 0.3, 0.65);
                        var width = Math.max(16, 40 - difficulty * Math.random());
                        seeker.setBounds(r, a + Math.random() * arc, width, width);
                        entity = seeker;
                    }
            }
            if (entity != null) {
                entities.push(entity);
            }
            // what can we buy?
            quantity -= cost;

        }
        return entities;
    };

}
