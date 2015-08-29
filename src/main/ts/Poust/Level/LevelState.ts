module Poust.Level {

    export class LevelState extends AbstractUpdatingState implements IState {

        private _groups: EntityHolder[][];

        private _touchStartListener: EventListener;
        private _touchEndListener: EventListener;
        private _touchMoveListener: EventListener;
        private _mouseDownListener: EventListener;
        private _mouseMoveListener: EventListener;
        private _mouseUpListener: EventListener;
        private _keyDownListener: EventListener;
        private _keyUpListener: EventListener;

        private _cameraCenterRadius: number;
        private _cameraCenterAngle: number;

        private _levelAgeMillis: number;
        private _bestLevelTime: number;

        public constructor(
            _element: Element,
            private _player: Poust.Level.Entity.PlayerEntity,
            private _gravity: number,
            private _context: CanvasRenderingContext2D,
            private _rendererFactory: IEntityRendererFactory,
            private _maxCollisionSteps: number,
            private _levelName: string,
            private _levelDifficulty: number
            ) {
            super(_element);
            this._cameraCenterAngle = 0;
            this._cameraCenterRadius = 0;
            this._levelAgeMillis = 0;
            this._groups = new Array<EntityHolder[]>();
            this._touchStartListener = (event: TouchEvent) => {
                for (var i in event.changedTouches) {
                    var touch = event.changedTouches.item(i);
                    this.setTarget(touch.identifier, touch.clientX, touch.clientY, true);
                }
                event.stopPropagation();
            };
            this._touchEndListener = (event: TouchEvent) => {
                for (var i in event.changedTouches) {
                    var touch = event.changedTouches.item(i);
                    this.clearTarget(touch.identifier);
                }
                event.stopPropagation();
            };
            this._touchMoveListener = (event: TouchEvent) => {
                for (var i in event.changedTouches) {
                    var touch = event.changedTouches.item(i);
                    this.setTarget(touch.identifier, touch.clientX, touch.clientY, true);
                }
                event.stopPropagation();
            };

            var mouseDown = false;
            this._mouseDownListener = (event: MouseEvent) => {
                this.setTarget(0, event.clientX, event.clientY, false);
                mouseDown = true;
                event.stopPropagation();
            };
            this._mouseMoveListener = (event: MouseEvent) => {
                if (mouseDown) {
                    this.setTarget(0, event.clientX, event.clientY, false);
                } else {
                    this.setTarget(0, event.clientX, event.clientY, false, false);
                }
                event.stopPropagation();
            };
            this._mouseUpListener = (event: MouseEvent) => {
                this.clearTarget(0);
                mouseDown = false;
                event.stopPropagation();
            };
            var keysDown : { [_:number]: boolean } = {};
            this._keyDownListener = (event: KeyboardEvent) => {
                if (!keysDown[event.keyCode]) {
                    keysDown[event.keyCode] = true;
                    this._player.setJump();
                }
                event.stopPropagation();
            };
            this._keyUpListener = (event: KeyboardEvent) => {
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
        }

        public init() {
            super.init();
            // look up previous best (if any)
            var bestLevelTimeString = window.localStorage.getItem(this._levelName + "-" + this._levelDifficulty);
            if (bestLevelTimeString) {
                this._bestLevelTime = parseInt(bestLevelTimeString);
            }
        }

        public getGroup(groupId: GroupId) {
            return this._groups[groupId];
        }

        public setCameraCenter(cr: number, ca: number) {
            this._cameraCenterRadius = cr;
            this._cameraCenterAngle = ca;
        }

        public getScreenPoint(r: number, a: number): { x: number, y: number } {

            return null;
        }

        public getPolarPoint(x: number, y: number): PolarPoint {
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

            var rd = PolarPoint.rotate(dx, dy, pa + Math.PI / 2);

            var wx = px + rd.x;
            var wy = py + rd.y;
            var a = Math.atan2(wy, wx);
            var r = Math.sqrt(wx * wx + wy * wy);

            // TODO scale?

            return new PolarPoint(r, a);
        }

        public getScreenWidth(): number {
            return this._element.clientWidth;
        }

        public getScreenHeight(): number {
            return this._element.clientHeight;
        }

        private setTarget(id: number, x: number, y: number, allowJump: boolean, allowShoot = true) {
            if (this._player.isDead()) {
                if (allowShoot) {
                    this.fireStateChangeEvent(new LevelStateRestartParam());
                }
            } else {
                var gesture: Gesture;
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
            if (('ontouchstart' in window) || window['DocumentTouch']) {
                this._element.addEventListener('touchstart', this._touchStartListener);
                this._element.addEventListener('touchmove', this._touchMoveListener);
                this._element.addEventListener('touchend', this._touchEndListener);
                this._element.addEventListener('touchleave', this._touchEndListener);
                this._element.addEventListener('touchcancel', this._touchEndListener);
            } else {
                this._element.addEventListener('mousedown', this._mouseDownListener);
                this._element.addEventListener('mouseup', this._mouseUpListener);
                this._element.addEventListener('mousemove', this._mouseMoveListener);
            }
            window.addEventListener('keydown', this._keyDownListener);
            window.addEventListener('keyup', this._keyUpListener);
        }

        stop(): void {
            super.stop();
            this._element.removeEventListener('touchstart', this._touchStartListener);
            this._element.removeEventListener('touchmove', this._touchMoveListener);
            this._element.removeEventListener('touchend', this._touchEndListener);
            this._element.removeEventListener('touchleave', this._touchEndListener);
            this._element.removeEventListener('touchcancel', this._touchEndListener);
            this._element.removeEventListener('mousedown', this._mouseDownListener);
            this._element.removeEventListener('mouseup', this._mouseUpListener);
            this._element.removeEventListener('mousemove', this._mouseMoveListener);
            window.removeEventListener('keydown', this._keyDownListener);
            window.removeEventListener('keyup', this._keyUpListener);
        }


        public getGravity(): number {
            return this._gravity;
        }

        public addEntity(entity: IEntity): EntityHolder {
            var groupIndex = entity.getGroupId();
            while (this._groups.length <= groupIndex) {
                this._groups.push(new Array<EntityHolder>());
            }
            var group = this._groups[groupIndex];
            var renderer = this._rendererFactory(entity);
            var entityHolder = new EntityHolder(entity, renderer);
            group.push(entityHolder);
            return entityHolder;
        }

        public update(diffMillis: number): void {
            if (!this._player.isDead() && !this._player.isDying()) {
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
            
        }

        private resolveCollisions(diffMillis:number, collisions: Collision[]): void {
            // handle the first collision
            var index = 0;
            while (index < collisions.length) {
                var collision = collisions[index];
                var entity1 = collision.entityHolder1.entity;
                var entity2 = collision.entityHolder2.entity;
                var mass1 = entity1.getMass();
                var mass2 = entity2.getMass();
                var edge1: PolarEdge;
                var edge2: PolarEdge;
                if (!collision.sensorCollision && (mass1 != null || mass2 != null)) {

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
                        collision.collisionMotion1.getBounds(),
                        collision.nearestCollisionIntersection
                        );
                    edge2 = this.calculateCollisionEdge(
                        -dvr,
                        -dva,
                        collision.collisionMotion2.getBounds(),
                        collision.nearestCollisionIntersection
                        );
                    // work out velocity (edge should be opposite!)
                    if (edge1 == -edge2 && edge1 != PolarEdge.Undefined) {
                        if (edge1 == PolarEdge.Top || edge1 == PolarEdge.Bottom) {
                            if (mass1 == null) {
                                entity2.setVelocityRadiusPX(vr1);
                            } else if (mass2 == null) {
                                entity1.setVelocityRadiusPX(vr2);
                            } else {
                                var vr = (vr2 * mass2 + vr1 * mass1) / (mass1 + mass2);
                                entity2.setVelocityRadiusPX(vr);
                                entity1.setVelocityRadiusPX(vr);
                            }
                        } else {
                            if (mass1 == null) {
                                entity2.setVelocityAngleRadians(va1, cr);
                            } else if (mass2 == null) {
                                entity1.setVelocityAngleRadians(va2, cr);
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
                        if (edge1 == PolarEdge.Left) {
                            entity1.setAnchorRight(false);
                        } else if (edge1 == PolarEdge.Right) {
                            entity1.setAnchorRight(true);
                        }
                        if (edge2 == PolarEdge.Left) {
                            entity2.setAnchorRight(false);
                        } else if (edge2 == PolarEdge.Right) {
                            entity2.setAnchorRight(true);
                        }
                        // move to collision point
                        collision.bestMotion1.apply(this);
                        collision.bestMotion2.apply(this);

                        collision.entityHolder1.calculateMotion(collision.collisionTime, diffMillis);
                        collision.entityHolder2.calculateMotion(collision.collisionTime, diffMillis);
                    
                        // recalculate any collisions with these entities
                        this.calculateCollisionsForEntity(diffMillis, collisions, collision.entityHolder1, this._groups.length);
                        this.calculateCollisionsForEntity(diffMillis, collisions, collision.entityHolder2, this._groups.length);

                    } else {
                        // !!!
                        console.log("unmatched or undefined edges falling through!");
                        edge1 = PolarEdge.Undefined;
                        edge2 = PolarEdge.Undefined;

                        // roll right back and stop moving!!

                    }

                } else {
                    edge1 = PolarEdge.Undefined;
                    edge2 = PolarEdge.Undefined;
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
        ): PolarEdge {

            // does intersection contain the bottom of the bounds?
            var bottom = collisionIntersection.containsVertically(colliderBounds.getInnerRadiusPx());
            var left = collisionIntersection.containsHorizontally(colliderBounds.getStartAngleRadians());
            var vpx = collisionIntersection.getHeightPx();
            var wpx: number;
            if (bottom) {
                wpx = collisionIntersection.getOuterCircumferencePx();
            } else {
                wpx = collisionIntersection.getInnerCircumferencePx();
            }
            var result: PolarEdge;
            if (wpx < vpx || bottom && dvr <= 0 || !bottom && dvr >= 0) {
                if (left) {
                    if (dva > 0) {
                        result = PolarEdge.Left;
                    } else {
                        result = PolarEdge.Undefined;
                    }
                } else {
                    if (dva < 0) {
                        result = PolarEdge.Right;
                    } else {
                        result = PolarEdge.Undefined;
                    }
                }
            } else {
                if (bottom) {
                    result = PolarEdge.Bottom;
                } else {
                    result = PolarEdge.Top;
                }
            }
            
            return result;
        }

        private calculateCollisionsForEntity(diffMillis: number, collisions: Collision[], entityHolderk: EntityHolder, startingGroupIndex: number) {
            var motionk = entityHolderk.motion;
            var entityk = entityHolderk.entity;
            if (entityk.isCollidable() && !entityk.isDead()) {
                var j = startingGroupIndex;
                while (j > 0) {
                    j--;
                    // never check your own group!
                    if (j != entityk.getGroupId()) {
                        var groupj = this._groups[j];
                        var l = groupj.length;
                        while (l > 0) {
                            l--;
                            // is there a collision?
                            var entityHolderl = groupj[l];
                            var entityl = entityHolderl.entity;
                            if (entityl.isCollidable() && !entityl.isDead()) {
                                var motionl = entityHolderl.motion;
                                var collision = this.calculateCollision(diffMillis, entityHolderk, entityHolderl);
                                if (collision != null) {
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

        private calculateCollisions(diffMillis: number): Collision[] {
            var collisions: Collision[] = new Array<Collision>();
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

        private calculateContinuousSamples(diffMillis: number, entityHolder: EntityHolder): number {
            var result = 1;
            if (entityHolder.entity.isContinuousCollisions()) {
                var done = false;
                while (!done) {
                    var continuousMillis = diffMillis / result;
                    var continuousSample = entityHolder.entity.calculateMotion(continuousMillis);
                    if (continuousSample.getBounds().overlaps(entityHolder.entity.getBounds())) {
                        done = true;
                    } else {
                        result++;
                    }
                }
            }
            return result;
        }

        private calculateCollision(diffMillis: number, entityHolder1: EntityHolder, entityHolder2: EntityHolder): Collision {
            // is there a collision?

            var motion1 = entityHolder1.motion;
            var motion2 = entityHolder2.motion;

            var collision: Collision;
            if (motion1 != null && motion2 != null) {
                var entity1 = entityHolder1.entity;
                var entity2 = entityHolder2.entity;

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
                            overlap = PolarBounds.intersect(sampleMotion1.getBounds(), sampleMotion2.getBounds());
                            if (overlap != null) {
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
                        overlap = PolarBounds.intersect(maxCollisionMotion1.getBounds(), maxCollisionMotion2.getBounds());
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

                if (overlap != null) {
                
                    // is either a sensor or did they start collided?
                    if (entityHolder1.entity.isSensor() || entityHolder2.entity.isSensor() || entityHolder1.entity.getBounds().overlaps(entityHolder2.entity.getBounds())) {
                        collision = new Collision(
                            true,
                            diffMillis,
                            overlap,
                            entityHolder1,
                            maxCollisionMotion1,
                            maxCollisionMotion2,
                            entityHolder2,
                            motion2,
                            motion2
                            );
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
                            var testOverlap = PolarBounds.intersect(testMotion1.getBounds(), testMotion2.getBounds());
                            if (testOverlap != null) {
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
                        if (bestMotion1 == null && bestMotion2 == null) {
                            // roll right back to starting position!
                            //preCollisionTime = 0;
                            bestMotion1 = entityHolder1.entity.calculateMotion(preCollisionTime - entityHolder1.motionOffset);
                            bestMotion2 = entityHolder2.entity.calculateMotion(preCollisionTime - entityHolder2.motionOffset);
                        }
                        collision = new Collision(
                            false,
                            preCollisionTime,
                            previousOverlap,
                            entityHolder1,
                            bestMotion1,
                            collisionMotion1,
                            entityHolder2,
                            bestMotion2,
                            collisionMotion2
                            );
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
                    entity.update(this, diffMillis, createdEntities);
                    if (entity.isDead()) {
                        group.splice(j, 1);
                    } else {
                        // do motion
                        entityHolder.calculateMotion(0, diffMillis);
                    }
                }
            }
            for (var i in createdEntities) {
                // update them, then add them
                var createdEntity = createdEntities[i];
                var createdEntityHolder = this.addEntity(createdEntity);
                createdEntity.update(this, diffMillis, createdEntities);
                createdEntityHolder.calculateMotion(0, diffMillis);
            }
        }

        private applyMotion() {
            for (var i in this._groups) {
                var group = this._groups[i];
                for (var j in group) {
                    var entityHolder = group[j];
                    // do motion
                    var motion = entityHolder.motion;
                    if (motion != null) {
                        motion.apply(this);
                    }
                }
            }
        }

        private toTimeString(timeMillis: number) {
            var timeSeconds = Math.floor(timeMillis / 1000);
            var timeMinutes = Math.floor(timeSeconds / 60);
            timeSeconds = timeSeconds % 60;
            var timeSecondsString = "" + timeSeconds;
            while (timeSecondsString.length < 2) {
                timeSecondsString = "0" + timeSecondsString;
            }
            return timeMinutes + ":" + timeSecondsString;
        }

        public getScale(w: number, h: number): number {
            return Math.min(1, w / 600, h / 500);
        }

        public render(): void {

            var w = this._element.clientWidth;
            var h = this._element.clientHeight;
            var fontHeight = Math.floor(Math.min(h / 20, w / 20));
            this._context.font = "bold "+fontHeight + "px Courier";
            this._context.fillStyle = "#000000";
            this._context.fillRect(0, 0, w, h);

            this._context.save();
            //            this._context.translate(w / 2, h / 2);
            var pr = this._cameraCenterRadius;
            var pa = this._cameraCenterAngle;
            var sin = Math.sin(pa);
            var cos = Math.cos(pa);
            var px = -pr * cos;
            var py = -pr * sin;
            var scale = this.getScale(w, h);
            this._context.translate(w / 2, h / 2);
            this._context.rotate(-pa - Math.PI/2);
            this._context.scale(scale, scale);
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
                    if (!entity.isDead()) {
                        var renderer = entityHolder.renderer;
                        renderer(this._context, entity);
                    }
                }
            }

            this._context.restore();

            this._context.fillStyle = "#FFFFFF";

            var timeString = this.toTimeString(this._levelAgeMillis);
            this._context.fillText(timeString, fontHeight, fontHeight * 1.5);

            var bestTimeString;
            if (this._bestLevelTime) {
                bestTimeString = "BEST " + this.toTimeString(this._bestLevelTime);
            } else {
                bestTimeString = "Unbeaten!";
            }
            var bestTimeStringMetric = this._context.measureText(bestTimeString);
            this._context.fillText(bestTimeString, w - bestTimeStringMetric.width - fontHeight, fontHeight + fontHeight / 2);

            if (this._player.isDead() || this._player.isDying()) {
                var text = "GAME OVER";
                var textMetric = this._context.measureText(text);
                this._context.fillText(text, (w - textMetric.width) / 2, (h + fontHeight) / 2);
            }


        }

        public winLevel(param: LevelStateFactoryParam) {
            if (this._bestLevelTime == null || this._bestLevelTime > this._levelAgeMillis) {
                window.localStorage.setItem(this._levelName + "-" + this._levelDifficulty, ""+this._levelAgeMillis);
            }
            this.fireStateChangeEvent(param);
        }
    }

}