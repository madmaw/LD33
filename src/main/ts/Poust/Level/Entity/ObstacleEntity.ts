function obstacleEntity() {
    var result = new AbstractPolarEntity(GroupId.Enemy, null, false);
    result.setSensor(true);
    return result;
}