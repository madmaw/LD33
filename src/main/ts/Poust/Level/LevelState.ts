class LevelState extends AbstractState implements IState {

    private _groups: IEntityHolder[][];

    private _cameraCenterRadius: number;
    private _cameraCenterAngle: number;

    private _levelAgeMillis: number;
    private _data: ILevelStateData;

    private _previousWidth: number;
    private _previousHeight: number;

    private _listeners: { [_: string]: EventListener };

    private _animationFrameCallback: FrameRequestCallback;
    private _lastUpdateMillis: number;


    public constructor(
        _element: Element,
        private _player: PlayerEntity,
        private _gravity: number,
        private _context: CanvasRenderingContext2D,
        private _rendererFactory: IEntityRendererFactory,
        private _maxCollisionSteps: number,
        private _levelName: string,
        private _levelDifficulty: number,
        private _background: any
        ) {
        super(_element);
        this._cameraCenterAngle = 0;
        this._cameraCenterRadius = 0;
        this._levelAgeMillis = 0;
        this._groups = new Array<IEntityHolder[]>();
        var touchStartListener = (event: TouchEvent) => {
            for (var i in event.changedTouches) {
                var touch = event.changedTouches.item(i);
                this.setTarget(touch.identifier, touch.clientX, touch.clientY, true);
            }
            event.stopPropagation();
        };
        var touchEndListener = (event: TouchEvent) => {
            for (var i in event.changedTouches) {
                var touch = event.changedTouches.item(i);
                this.clearTarget(touch.identifier);
            }
            event.stopPropagation();
        };
        var touchMoveListener = (event: TouchEvent) => {
            for (var i in event.changedTouches) {
                var touch = event.changedTouches.item(i);
                this.setTarget(touch.identifier, touch.clientX, touch.clientY, true);
            }
            event.stopPropagation();
        };

        var mouseDown = false;
        var mouseDownListener = (event: MouseEvent) => {
            this.setTarget(0, event.clientX, event.clientY, false);
            mouseDown = true;
            event.stopPropagation();
        };
        var mouseMoveListener = (event: MouseEvent) => {
            // aiming target
            this.setTarget(1, event.clientX, event.clientY, false, false);
            if (mouseDown) {
                this.setTarget(0, event.clientX, event.clientY, false);
            }
            event.stopPropagation();
        };
        var mouseUpListener = () => {
            this.clearTarget(0);
            mouseDown = false;
            event.stopPropagation();
        };
        var mouseOutListener = () => {
            this.clearTarget(0);
            this.clearTarget(1);
            mouseDown = false;
            event.stopPropagation();
        };
            
        var keysDown : { [_:number]: boolean } = {};
        var keyDownListener = (event: KeyboardEvent) => {
            if (!keysDown[event.keyCode]) {
                keysDown[event.keyCode] = true;
                this._player.setJump();
            }
            event.stopPropagation();
        };
        var keyUpListener = (event: KeyboardEvent) => {
            if (keysDown[event.keyCode]) {
                delete keysDown[event.keyCode];
                var down = false;
                for (var key in keysDown) {
                    var keyDown = keysDown[key];
                    if (keyDown) {
                        down = true;
                        break;
                    }
                }
                if (!down) {
                    this._player.clearJump();
                }
            }
            event.stopPropagation();
        };
        this._listeners = {
            'touchstart': touchStartListener,
            'touchmove': touchMoveListener,
            'touchend': touchEndListener,
            'touchleave': touchEndListener,
            'touchcancel': touchEndListener,
            'mousedown': mouseDownListener,
            'mouseup': mouseUpListener,
            'mousemove': mouseMoveListener,
            'mouseout': mouseOutListener,
            'keydown': keyDownListener,
            'keyup': keyUpListener
        };
        this._animationFrameCallback = (timeMillis: number) => {
            if (this.isStarted()) {
                if (this._lastUpdateMillis != null) {
                    var diff = timeMillis - this._lastUpdateMillis;
                    // don't let it run for too long
                    diff = Math.min(diff, 100);
                    if (diff > 0) {
                        //diff = 20;
                        this.update(diff);
                        this.render();
                    }
                }
                this._lastUpdateMillis = timeMillis;
                if (this.isStarted()) {
                    requestAnimationFrame(this._animationFrameCallback);
                }
            } else {
                this._lastUpdateMillis = null;
            }
        };
    }

    public init() {
        super.init();
        // look up previous best (if any)
        this._data = loadLevelStateData(this._levelDifficulty, this._levelName, true);
    }


    public getGroup(groupId: number) {
        return this._groups[groupId];
    }

    public setCameraCenter(cr: number, ca: number) {
        this._cameraCenterRadius = cr;
        this._cameraCenterAngle = ca;
    }

    public getScreenPoint(r: number, a: number): { x: number, y: number } {

        return null;
    }

    public getPolarPoint(x: number, y: number): IPolarPoint {
        var w = this._element.clientWidth;
        var h = this._element.clientHeight;

        var pr = this._cameraCenterRadius;
        var pa = this._cameraCenterAngle;
        var sin = Math.sin(pa);
        var cos = Math.cos(pa);
        var px = pr * cos;
        var py = pr * sin;

        var scale = this.getScale(w, h);

        var dx = (x - w / 2) * scale;
        var dy = (y - h / 2) * scale;

        var rd = rotate(dx, dy, pa + pid2);

        var wx = px + rd.x;
        var wy = py + rd.y;
        var a = Math.atan2(wy, wx);
        var r = Math.sqrt(wx * wx + wy * wy);

        // TODO scale?

        return { r: r, a: a };
    }

    public getScreenWidth(): number {
        return this._element.clientWidth;
    }

    public getScreenHeight(): number {
        return this._element.clientHeight;
    }

    private setTarget(id: number, x: number, y: number, allowJump: boolean, allowShoot = true) {
        if (this._player.dead) {
            if (allowShoot) {
                //this.fireStateChangeEvent(StateFactoryParamType.LevelRestart, null);
                var param: ILevelStateFactoryParam = {
                    difficulty: this._levelDifficulty,
                    levelName: this._levelName
                };
                this.fireStateChangeEvent(StateFactoryParamType.LevelLoad, param);
            }
        } else {
            var gesture: number;
            if (allowJump) {
                gesture = Gesture.Context;
            } else if (allowShoot) {
                gesture = Gesture.ShootOnly;
            } else {
                gesture = Gesture.AimOnly;
            }
            this._player.setTarget(id, x, y, gesture);
        }
    }

    private clearTarget(id: number) {
        this._player.clearTarget(id);
    }

    start(): void {
        super.start();
        requestAnimationFrame(this._animationFrameCallback);

        // indicate we started this level
        if (this._levelAgeMillis == 0) {
            this._data.attempts++;
            saveLevelStateData(this._levelDifficulty, this._levelName, this._data);
        }
        for (var key in this._listeners) {
            var listener = this._listeners[key];
            var c = key[0];
            if (c == 'k') {
                addEventListener(key, listener);
            } else {
                if (('ontouchstart' in _w) || _w['DocumentTouch']) {
                    if (c == 't') {
                        this._element.addEventListener(key, listener);
                    }
                } else {
                    if (c == 'm') {
                        this._element.addEventListener(key, listener);
                    }
                }
            }
        }
        /*
        if (('ontouchstart' in w) || w['DocumentTouch']) {
            this._element.addEventListener('touchstart', this._touchStartListener);
            this._element.addEventListener('touchmove', this._touchMoveListener);
            this._element.addEventListener('touchend', this._touchEndListener);
            this._element.addEventListener('touchleave', this._touchEndListener);
            this._element.addEventListener('touchcancel', this._touchEndListener);
        } else {
            this._element.addEventListener('mousedown', this._mouseDownListener);
            this._element.addEventListener('mouseup', this._mouseUpListener);
            this._element.addEventListener('mousemove', this._mouseMoveListener);
            this._element.addEventListener('mouseout', this._mouseOutListener);
        }
        w.addEventListener('keydown', this._keyDownListener);
        w.addEventListener('keyup', this._keyUpListener);
        */
    }

    stop(): void {
        super.stop();
        for (var key in this._listeners) {
            var listener = this._listeners[key];
            this._element.removeEventListener(key, listener);
            removeEventListener(key, listener);
        }

        /*
        this._element.removeEventListener('touchstart', this._touchStartListener);
        this._element.removeEventListener('touchmove', this._touchMoveListener);
        this._element.removeEventListener('touchend', this._touchEndListener);
        this._element.removeEventListener('touchleave', this._touchEndListener);
        this._element.removeEventListener('touchcancel', this._touchEndListener);
        this._element.removeEventListener('mousedown', this._mouseDownListener);
        this._element.removeEventListener('mouseup', this._mouseUpListener);
        this._element.removeEventListener('mousemove', this._mouseMoveListener);
        this._element.removeEventListener('mouseout', this._mouseOutListener);
        w.removeEventListener('keydown', this._keyDownListener);
        w.removeEventListener('keyup', this._keyUpListener);
        */
    }


    public getGravity(): number {
        return this._gravity;
    }

    public addEntity(entity: IEntity): IEntityHolder {
        var groupIndex = entity.groupId;
        while (this._groups.length <= groupIndex) {
            this._groups.push(new Array<IEntityHolder>());
        }
        var group = this._groups[groupIndex];
        var renderer = this._rendererFactory(entity);
        var entityHolder = { entity: entity, renderer: renderer };
        group.push(entityHolder);
        return entityHolder;
    }

    public update(diffMillis: number): void {
        var w = document.body.clientWidth;
        var h = document.body.clientHeight;
        if (this._previousHeight != h || this._previousWidth != w) {
            this._element.setAttribute("width", "" + w + "px");
            this._element.setAttribute("height", "" + h + "px");
        }

        if (!this._player.dead && !this._player.isDying()) {
            this._levelAgeMillis += diffMillis;
        }

        this.updateMotion(diffMillis);
        if (this.isStarted()) {
            // do collisions
            var collisions = this.calculateCollisions(diffMillis);

            // resolve collisions
            this.resolveCollisions(diffMillis, collisions);

            // apply all motions
            this.applyMotion();
        }
        if (!this._player.isDying()) {
            var b = this._player.bounds;
            this.setCameraCenter(b.getOuterRadiusPx(), b.getCenterAngleRadians());
        }   
    }

    private resolveCollisions(diffMillis:number, collisions: ICollision[]): void {
        // handle the first collision
        var index = 0;
        while (index < collisions.length) {
            var collision = collisions[index];
            var entity1 = collision.entityHolder1.entity;
            var entity2 = collision.entityHolder2.entity;
            var mass1 = entity1.mass;
            var mass2 = entity2.mass;
            var edge1: number;
            var edge2: number;
            if (mass1 || mass2) {

                // work out relative velocities
                var cr = collision.nearestCollisionIntersection.getCenterRadiusPx();
                var vr1 = entity1.getVelocityRadiusPX();
                var vr2 = entity2.getVelocityRadiusPX();
                var va1 = entity1.getVelocityAngleRadians(cr);
                var va2 = entity2.getVelocityAngleRadians(cr);
                var dvr = vr2 - vr1;
                var dva = va2 - va1;
                // work out the edges that collided (top, left, bottom, right)
                edge1 = this.calculateCollisionEdge(
                    dvr,
                    dva,
                    collision.collisionMotion1.bounds,
                    collision.nearestCollisionIntersection
                    );
                edge2 = this.calculateCollisionEdge(
                    -dvr,
                    -dva,
                    collision.collisionMotion2.bounds,
                    collision.nearestCollisionIntersection
                    );
                // work out velocity (edge should be opposite!)
                if (edge1 == -edge2 && edge1 != POLAR_EDGE_UNDEFINED) {
                    if (edge1 == POLAR_EDGE_TOP || edge1 == POLAR_EDGE_BOTTOM) {
                        if (!mass1) {
                            entity2.setVelocityRadiusPX(vr1);
                            if (entity2.horizontalFriction) {
                                // apply friction
                                // TODO calculate from relative velocity
                                var a2 = (vr2 - collision.entityHolder2.previousVrPx) / diffMillis;
                                var f2 = entity2.mass * a2;
                                var friction = 1 - (entity2.horizontalFriction / (Math.abs(f2) + 1));
                                entity2.setVelocityAngleRadians(va2 * friction, cr);
                            }
                        } else if (!mass2) {
                            entity1.setVelocityRadiusPX(vr2);
                            if (entity1.horizontalFriction) {
                                // apply friction
                                // TODO calculate from relative velocity
                                var a1 = (vr1 - collision.entityHolder1.previousVaPx) / diffMillis;
                                var f1 = entity1.mass * a1;
                                var friction = 1 - (entity1.horizontalFriction / (Math.abs(f2) + 1));
                                entity1.setVelocityAngleRadians(va1 * friction, cr);
                            }
                        } else {
                            var vr = (vr2 * mass2 + vr1 * mass1) / (mass1 + mass2);
                            entity2.setVelocityRadiusPX(vr);
                            entity1.setVelocityRadiusPX(vr);
                        }
                    } else {
                        if (mass1 == null) {
                            entity2.setVelocityAngleRadians(va1, cr);
                            // apply friction
                        } else if (mass2 == null) {
                            entity1.setVelocityAngleRadians(va2, cr);
                            // apply friction
                        } else {
                            var va = (va2 * mass2 + va1 * mass1) / (mass1 + mass2);
                            entity2.setVelocityAngleRadians(va, cr);
                            entity1.setVelocityAngleRadians(va, cr);
                        }
                    }
                    // remove any other collisions with these entities
                    var i = index + 1;
                    while (i < collisions.length) {
                        var nextCollision = collisions[i];
                        if (
                            nextCollision.entityHolder1 == collision.entityHolder1 ||
                            nextCollision.entityHolder1 == collision.entityHolder2 ||
                            nextCollision.entityHolder2 == collision.entityHolder1 ||
                            nextCollision.entityHolder2 == collision.entityHolder2
                            ) {
                            // TODO maybe merge the collision box of this collision if it shares an edge?
                            collisions.splice(i, 1);
                        } else {
                            i++;
                        }
                    }

                    // fix up anchoring
                    if (edge1 == POLAR_EDGE_LEFT || edge2 == POLAR_EDGE_LEFT) {
                        entity1.anchor = edge1;
                        entity2.anchor = edge2;
                    }
                    /*
                    if (edge1 == POLAR_EDGE_LEFT) {
                        entity1.setAnchorRight(false);
                    } else if (edge1 == POLAR_EDGE_RIGHT) {
                        entity1.setAnchorRight(true);
                    }
                    if (edge2 == POLAR_EDGE_LEFT) {
                        entity2.setAnchorRight(false);
                    } else if (edge2 == POLAR_EDGE_RIGHT) {
                        entity2.setAnchorRight(true);
                    }
                    */
                    // move to collision point
                    collision.bestMotion1.apply(this);
                    collision.bestMotion2.apply(this);

                    calculateMotion(collision.entityHolder1, collision.collisionTime, diffMillis);
                    calculateMotion(collision.entityHolder2, collision.collisionTime, diffMillis);

                    // recalculate any collisions with these entities
                    this.calculateCollisionsForEntity(diffMillis, collisions, collision.entityHolder1, this._groups.length);
                    this.calculateCollisionsForEntity(diffMillis, collisions, collision.entityHolder2, this._groups.length);

                } else {
                    // !!!
                    //console.log("unmatched or undefined edges falling through!");
                    edge1 = POLAR_EDGE_UNDEFINED;
                    edge2 = POLAR_EDGE_UNDEFINED;

                    // roll right back and stop moving!!

                }

            } else {
                edge1 = POLAR_EDGE_UNDEFINED;
                edge2 = POLAR_EDGE_UNDEFINED;
            }
            entity1.notifyCollision(entity2, edge1);
            entity2.notifyCollision(entity1, edge2);
            index++;
        }
            
    }

    private calculateCollisionEdge(
        dvr: number,
        dva: number,
        colliderBounds: PolarBounds,
        collisionIntersection: PolarBounds
    ): number {

        // does intersection contain the bottom of the bounds?
        var bottom = collisionIntersection.containsVertically(colliderBounds.innerRadiusPx);
        var left = collisionIntersection.containsHorizontally(colliderBounds.startAngleRadians);
        var vpx = collisionIntersection.heightPx;
        var wpx: number;
        if (bottom) {
            wpx = collisionIntersection.getOuterCircumferencePx();
        } else {
            wpx = collisionIntersection.getInnerCircumferencePx();
        }
        var result: number;
        if (wpx < vpx || bottom && dvr <= 0 || !bottom && dvr >= 0) {
            if (left) {
                if (dva > 0) {
                    result = POLAR_EDGE_LEFT;
                } else {
                    result = POLAR_EDGE_UNDEFINED;
                }
            } else {
                if (dva < 0) {
                    result = POLAR_EDGE_RIGHT;
                } else {
                    result = POLAR_EDGE_UNDEFINED;
                }
            }
        } else {
            if (bottom) {
                result = POLAR_EDGE_BOTTOM;
            } else {
                result = POLAR_EDGE_TOP;
            }
        }
            
        return result;
    }

    private calculateCollisionsForEntity(diffMillis: number, collisions: ICollision[], entityHolderk: IEntityHolder, startingGroupIndex: number) {
        var motionk = entityHolderk.motion;
        var entityk = entityHolderk.entity;
        if (!entityk.ghostly && !entityk.dead) {
            var j = startingGroupIndex;
            while (j > 0) {
                j--;
                // never check your own group!
                if (j != entityk.groupId) {
                    var groupj = this._groups[j];
                    var l = groupj.length;
                    while (l > 0) {
                        l--;
                        // is there a collision?
                        var entityHolderl = groupj[l];
                        var entityl = entityHolderl.entity;
                        if (!entityl.ghostly && !entityl.dead) {
                            var motionl = entityHolderl.motion;
                            var collision = this.calculateCollision(diffMillis, entityHolderk, entityHolderl);
                            if (collision) {
                                // insert in order of collision time
                                var index = 0;
                                while (index < collisions.length) {
                                    var existingCollision = collisions[index];
                                    if (existingCollision.collisionTime > collision.collisionTime) {
                                        break;
                                    }
                                    index++;
                                }
                                collisions.splice(index, 0, collision);
                            }
                        }
                    }
                }
            }
        }
    }

    private calculateCollisions(diffMillis: number): ICollision[] {
        var collisions: ICollision[] = new Array<ICollision>();
        var i = this._groups.length;
        while (i > 0) {
            i--;
            var groupi = this._groups[i];
            var j = groupi.length;
            while (j > 0) {
                j--;
                var entityHolder = groupi[j];
                this.calculateCollisionsForEntity(diffMillis, collisions, entityHolder, i);
            }
        }
        return collisions;
    }

    private calculateContinuousSamples(diffMillis: number, entityHolder: IEntityHolder): number {
        var result = 1;
        if (entityHolder.entity.continuousCollisions) {
            var done = false;
            while (!done) {
                var continuousMillis = diffMillis / result;
                var continuousSample = entityHolder.entity.calculateMotion(continuousMillis);
                if (continuousSample.bounds.overlaps(entityHolder.entity.bounds)) {
                    done = true;
                } else {
                    result++;
                }
            }
        }
        return result;
    }

    private calculateCollision(diffMillis: number, entityHolder1: IEntityHolder, entityHolder2: IEntityHolder): ICollision {
        // is there a collision?

        var motion1 = entityHolder1.motion;
        var motion2 = entityHolder2.motion;
        var entity1 = entityHolder1.entity;
        var entity2 = entityHolder2.entity;

        var collision: ICollision;
        if (motion1 && motion2 && !entity1.dead && !entity2.dead) {

            var maxCollisionTime: number;
            var maxCollisionMotion1: IMotion;
            var maxCollisionMotion2: IMotion;
            var overlap: PolarBounds;

            // test for possibility of collision by checking movement boundaries
            var motionOverlaps = entityHolder1.fullMotionBounds.overlaps(entityHolder2.fullMotionBounds);
            if (motionOverlaps) {

                var entity1Samples = this.calculateContinuousSamples(diffMillis, entityHolder1);
                var entity2Samples = this.calculateContinuousSamples(diffMillis, entityHolder2);
                var samples = Math.max(entity1Samples, entity2Samples);
                if (samples > 1) {
                    // smear it until the continuous entity has full overlap with itself
                    var sample = 1;
                    overlap = null;
                    while (sample <= samples) {
                        var sampleTime = (diffMillis * sample) / samples;
                        var sampleMotion1 = entity1.calculateMotion(sampleTime);
                        var sampleMotion2 = entity2.calculateMotion(sampleTime);
                        overlap = PolarBounds.intersect(sampleMotion1.bounds, sampleMotion2.bounds);
                        if (overlap) {
                            maxCollisionMotion1 = sampleMotion1;
                            maxCollisionMotion2 = sampleMotion2;
                            maxCollisionTime = sampleTime;
                            break;
                        }
                        sample++;
                    }
                } else {
                    maxCollisionMotion1 = motion1;
                    maxCollisionMotion2 = motion2;
                    maxCollisionTime = diffMillis;
                    overlap = PolarBounds.intersect(maxCollisionMotion1.bounds, maxCollisionMotion2.bounds);
                }
            } else {
                // they're not even close
                overlap = null;
            }

            /*
            if (overlap == null && motionOverlaps) {
                console.log("sus");
                // debug only, infinite recursion!
                this.calculateCollision(diffMillis, entityHolder1, entityHolder2);
            }
            */

            if (overlap) {
                
                // is either a sensor or did they start collided?
                if (entityHolder1.entity.bounds.overlaps(entityHolder2.entity.bounds)) {
                    collision = {

                        collisionTime: diffMillis,
                        nearestCollisionIntersection: overlap,
                        entityHolder1: entityHolder1,
                        bestMotion1: maxCollisionMotion1,
                        collisionMotion1: maxCollisionMotion2,
                        entityHolder2: entityHolder2,
                        bestMotion2: motion2,
                        collisionMotion2: motion2
                    };
                } else {
                    // when did the collision happen?
                    var collisionSteps = 0;
                    var preCollisionTime = Math.max(entityHolder1.motionOffset, entityHolder2.motionOffset);
                    var postCollisionTime = maxCollisionTime;
                    var previousOverlap = overlap;
                    var bestMotion1: IMotion = null;
                    var bestMotion2: IMotion = null;
                    var collisionMotion1 = maxCollisionMotion1;
                    var collisionMotion2 = maxCollisionMotion2;
                    while (collisionSteps < this._maxCollisionSteps) {
                        var testCollisionTime = (preCollisionTime + postCollisionTime) / 2;
                        var testMotion1 = entityHolder1.entity.calculateMotion(testCollisionTime);
                        var testMotion2 = entityHolder2.entity.calculateMotion(testCollisionTime);
                        var testOverlap = PolarBounds.intersect(testMotion1.bounds, testMotion2.bounds);
                        if (testOverlap) {
                            postCollisionTime = testCollisionTime;
                            previousOverlap = testOverlap;
                            collisionMotion1 = testMotion1;
                            collisionMotion2 = testMotion2;
                        } else {
                            preCollisionTime = testCollisionTime;
                            bestMotion1 = testMotion1;
                            bestMotion2 = testMotion2;
                        }
                        collisionSteps++;
                    }
                    if (!bestMotion1 && !bestMotion2) {
                        // roll right back to starting position!
                        //preCollisionTime = 0;
                        bestMotion1 = entityHolder1.entity.calculateMotion(preCollisionTime - entityHolder1.motionOffset);
                        bestMotion2 = entityHolder2.entity.calculateMotion(preCollisionTime - entityHolder2.motionOffset);
                    }
                    collision = {
                        collisionTime: preCollisionTime,
                        nearestCollisionIntersection: previousOverlap,
                        entityHolder1: entityHolder1,
                        bestMotion1: bestMotion1,
                        collisionMotion1: collisionMotion1,
                        entityHolder2: entityHolder2,
                        bestMotion2: bestMotion2,
                        collisionMotion2: collisionMotion2
                    };
                }
            } else {
                collision = null;
            }
        } else {
            collision = null;
        }
        return collision;
    }

    private updateMotion(diffMillis: number) {
        var createdEntities: IEntity[] = [];
        for (var i in this._groups) {
            var group = this._groups[i];
            var j = group.length;
            while (j > 0) {
                j--;
                var entityHolder = group[j];
                var entity = entityHolder.entity;
                entityHolder.previousVrPx = entity.getVelocityRadiusPX();
                entityHolder.previousVaPx = entity.getVelocityAngleRadians(entity.bounds.getCenterRadiusPx());
                entity.update(this, diffMillis, createdEntities);
                if (entity.dead) {
                    group.splice(j, 1);
                } else {
                    // do motion
                    calculateMotion(entityHolder, 0, diffMillis);
                }
            }
        }
        for (var i in createdEntities) {
            // update them, then add them
            var createdEntity = createdEntities[i];
            var createdEntityHolder = this.addEntity(createdEntity);
            createdEntity.update(this, diffMillis, createdEntities);
            calculateMotion(createdEntityHolder, 0, diffMillis);
        }
    }

    private applyMotion() {
        for (var i in this._groups) {
            var group = this._groups[i];
            for (var j in group) {
                var entityHolder = group[j];
                // do motion
                var motion = entityHolder.motion;
                if (motion) {
                    motion.apply(this);
                }
            }
        }
    }

    public getScale(w: number, h: number): number {
        return Math.min(1, w / 600, h / 500);
    }

    public render(): void {

        var w = this._element.clientWidth;
        var h = this._element.clientHeight;



        //            this._context.translate(w / 2, h / 2);
        var pr = this._cameraCenterRadius;
        var pa = this._cameraCenterAngle;
        var sin = Math.sin(pa);
        var cos = Math.cos(pa);
        var px = -pr * cos;
        var py = -pr * sin;
        var scale = this.getScale(w, h);

        this._context.save();
        //this._context.scale(scale, scale);
        this._context.translate(w/2, pr);
        this._context.fillStyle = this._background;
        this._context.fillRect(-w/2, -pr, w, h);
        this._context.restore();

        this._context.save();
        this._context.translate(w / 2, h / 2);
        this._context.scale(scale, scale);
        this._context.rotate(-pa - pid2);
        this._context.translate(px, py);


        var i = this._groups.length;
        while (i > 0) {
            i--;
            var group = this._groups[i];
            var j = group.length;
            while (j > 0) {
                j--;
                var entityHolder = group[j];
                var entity = entityHolder.entity;
                if (!entity.dead) {
                    var renderer = entityHolder.renderer;
                    renderer(this._context, entity);
                }
            }
        }

        this._context.restore();

        var fontHeight = Math.floor(Math.min(h / 15, w / 15));
        this._context.fillStyle = "#FFF";
        this._context.font = "bold " + fontHeight + "px Courier";

        var levelString = "" + this._levelDifficulty + "-" + this._levelName; 
        var timeString = levelString+" " + toTimeString(this._levelAgeMillis);
        this._context.fillText(timeString, fontHeight, fontHeight * 1.5);

        if (this._data.bestTime) {
            var bestTimeString = "BEST " + toTimeString(this._data.bestTime);
            var bestTimeStringMetric = this._context.measureText(bestTimeString);
            this._context.fillText(bestTimeString, w - bestTimeStringMetric.width - fontHeight, fontHeight + fontHeight / 2);

        }

        var displayAttemptTime = 2000;
        if (this._data.attempts && this._levelAgeMillis < displayAttemptTime) {
            if (this._levelAgeMillis > displayAttemptTime / 2) {
                this._context.globalAlpha = ((displayAttemptTime - this._levelAgeMillis) * 2) / displayAttemptTime;
            }
            var text = levelString;
            var textMetric = this._context.measureText(text);
            this._context.fillText(text, (w - textMetric.width) / 2, (h + fontHeight) / 2 - fontHeight);

            var text = "Attempt " + this._data.attempts;
            var textMetric = this._context.measureText(text);
            this._context.fillText(text, (w - textMetric.width) / 2, (h + fontHeight) / 2 + fontHeight * 1.5);

            this._context.globalAlpha = 1;
        }

        if (this._player.dead || this._player.isDying()) {
            var text = "GAME OVER";
            var textMetric = this._context.measureText(text);
            this._context.fillText(text, (w - textMetric.width) / 2, (h + fontHeight) / 2);
        }

    }

    public winLevel(param: ILevelStateFactoryParam) {
        if (!this._data.bestTime || this._data.bestTime > this._levelAgeMillis) {
            this._data.bestTime = this._levelAgeMillis;
            saveLevelStateData(this._levelDifficulty, this._levelName, this._data);
        }
        this.fireStateChangeEvent(StateFactoryParamType.LevelLoad, param);
    }
}

