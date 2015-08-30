class ObstacleEntity extends AbstractPolarEntity {

    public constructor(groupId: number) {
        super(groupId, null, false);
        this.setSensor(true);
    }

}