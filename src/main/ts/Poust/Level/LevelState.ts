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

        public constructor(
            _element: Element,
            private _player: Poust.Level.Entity.PlayerEntity,
            private _gravity: number,
            private _context: CanvasRenderingContext2D,
            private _defaultRenderer: IEntityRenderer,
            private _maxCollisionSteps: number
        ) {
            super(_element);
            this._groups = new Array<EntityHolder[]>();
            this._touchStartListener = (event: TouchEvent) => {
                for (var i in event.changedTouches) {
                    var touch = event.changedTouches.item(i);
                    this.setTarget(touch.identifier, touch.clientX, touch.clientY, true);
                }
            };
            this._touchEndListener = (event: TouchEvent) => {
                for (var i in event.changedTouches) {
                    var touch = event.changedTouches.item(i);
                    this.clearTarget(touch.identifier);
                }
            };
            this._touchMoveListener = (event: TouchEvent) => {
                for (var i in event.changedTouches) {
                    var touch = event.changedTouches.item(i);
                    this.setTarget(touch.identifier, touch.clientX, touch.clientY, true);
                }
            };

            var mouseDown = false;
            this._mouseDownListener = (event: MouseEvent) => {
                this.setTarget(0, event.clientX, event.clientY, false);
                mouseDown = true;
            };
            this._mouseMoveListener = (event: MouseEvent) => {
                if (mouseDown) {
                    this.setTarget(0, event.clientX, event.clientY, false);
                }
            };
            this._mouseUpListener = (event: MouseEvent) => {
                this.clearTarget(0);
                mouseDown = false;
            };
            this._keyDownListener = (event: KeyboardEvent) => {
                if (event.char = ' ') {
                    this._player.setJump();
                }
            };
            this._keyUpListener = (event: KeyboardEvent) => {
                if (event.char = ' ') {
                    this._player.clearJump();
                }
            };
        }

        private setTarget(id: number, x: number, y: number, allowJump: boolean) {
            var w = this._element.clientWidth;
            var h = this._element.clientHeight;
            var dx = w / 2 - x;
            var dy = h / 2 - y;
            var angle = Math.atan2(dy, dx);
            // not right
            var r = Math.sqrt(dx*dx + dy*dy);
            var a = angle;
            this._player.setTarget(id, r, a, allowJump);
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

        public addEntity(entity: IEntity): void {
            var groupIndex = entity.getGroupId();
            while (this._groups.length <= groupIndex) {
                this._groups.push(new Array<EntityHolder>());
            }
            var group = this._groups[groupIndex];
            var renderer = this._defaultRenderer;
            group.push(new EntityHolder(entity, renderer));
        }

        public update(diffMillis: number): void {
            this.updateMotion(diffMillis);


            // do collisions
            var collisions = this.calculateCollisions(diffMillis);


            // resolve collisions
            this.resolveCollisions(diffMillis, collisions);
            /*
            for (var i in collisions) {
                var collision = collisions[i];
                collision.entityHolder1.motion = collision.bestMotion1;
                collision.entityHolder2.motion = collision.bestMotion2;
            }
            */

            // apply all motions
            this.applyMotion();
            
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

                        // move to collision point
                        collision.bestMotion1.apply();
                        collision.entityHolder1.motionOffset = collision.collisionTime;
                        collision.bestMotion2.apply();
                        collision.entityHolder2.motionOffset = collision.collisionTime;
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

                        // report the collision
                        var remainingTime = diffMillis - collision.collisionTime;
                        collision.entityHolder1.motion = entity1.calculateMotion(remainingTime);
                        collision.entityHolder2.motion = entity2.calculateMotion(remainingTime);
                    
                        // recalculate any collisions with these entities
                        this.calculateCollisionsForEntity(diffMillis, collisions, collision.entityHolder1, this._groups.length);
                        this.calculateCollisionsForEntity(diffMillis, collisions, collision.entityHolder2, this._groups.length);

                    } else {
                        // !!!
                        console.log("unmatched or undefined edges falling through!");
                        edge1 = PolarEdge.Undefined;
                        edge2 = PolarEdge.Undefined;
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
            var entity1 = entityHolder1.entity;
            var entity2 = entityHolder2.entity;

            var motion1 = entityHolder1.motion;
            var motion2 = entityHolder2.motion;

            var maxCollisionTime: number;
            var maxCollisionMotion1: IMotion;
            var maxCollisionMotion2: IMotion;
            var overlap: PolarBounds;

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

            var collision: Collision;
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
                        // !
                        preCollisionTime = 0;
                        bestMotion1 = entityHolder1.entity.calculateMotion(0);
                        bestMotion2 = entityHolder2.entity.calculateMotion(0);
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
            return collision;
        }

        private updateMotion(diffMillis: number) {
            for (var i in this._groups) {
                var group = this._groups[i];
                for (var j in group) {
                    var entityHolder = group[j];
                    var entity = entityHolder.entity;
                    entity.update(this, diffMillis);
                    // do motion
                    var motion = entity.calculateMotion(diffMillis);
                    entityHolder.motion = motion;
                    entityHolder.motionOffset = 0;
                }
            }
        }

        private applyMotion() {
            for (var i in this._groups) {
                var group = this._groups[i];
                for (var j in group) {
                    var entityHolder = group[j];
                    // do motion
                    var motion = entityHolder.motion;
                    motion.apply();
                }
            }
        }

        public render(): void {

            var w = this._element.clientWidth;
            var h = this._element.clientHeight;

            this._context.fillStyle = "#000000";
            this._context.fillRect(0, 0, w, h);

            this._context.save();
            //            this._context.translate(w / 2, h / 2);
            var playerBounds = this._player.getBounds();
            var pr = playerBounds.getCenterRadiusPx();
            var pa = playerBounds.getCenterAngleRadians();
            var sin = Math.sin(pa);
            var cos = Math.cos(pa);
            var px = -pr * cos;
            var py = -pr * sin;
            this._context.translate(w / 2, h / 2);
            //this._context.rotate(-pa - Math.PI/2);
            this._context.translate(px, py);

            for (var i in this._groups) {
                var group = this._groups[i];
                var j = group.length;
                while (j > 0) {
                    j--;
                    var entityHolder = group[j];
                    var entity = entityHolder.entity;
                    var renderer = entityHolder.renderer;
                    renderer.render(this._context, entity);
                }
            }

            this._context.restore();
        }
        

    }

}