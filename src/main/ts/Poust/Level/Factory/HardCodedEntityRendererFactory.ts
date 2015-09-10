function hardCodedEntityRendererFactory(renderers: {[_:number]: IEntityRenderer})
{

    return (entity: IEntity) => {
        var entityTypeId = entity.entityTypeId;
        var result: IEntityRenderer = renderers[entityTypeId];
        return result;
    };
}

