/**
 * Ink Wash Cat (水墨素色猫)
 * Procedurally animated ink cat with spring-physics tail, brush-line spine,
 * dynamic postures (idle, run, crouch, leap, wall-cling, land squish).
 */

class InkCat {
    constructor(x, y) {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        
        // Physics constants
        this.width = 38;
        this.height = 28;
        this.radius = 16;
        this.gravity = 0.52;
        this.maxSpeed = 5.5;
        this.friction = 0.86;
        this.airFriction = 0.98;
        
        // State
        this.facing = 1; // 1 = right, -1 = left
        this.isGrounded = false;
        this.isJumpHeld = false;
        this.isCharging = false;
        this.chargeTime = 0;
        this.maxChargeTime = 30; // Very fast charge if used
        this.chargePower = 0;
        this.aimAngle = -Math.PI / 3; // Default ~60 deg upward
        this.hasDoubleJumped = false;
        this.state = 'idle'; // idle, run, crouch, jump, fall, land, dead, victory
        this.isAlive = true;
        this.hasWon = false;

        // Visual squash & stretch
        this.scaleX = 1;
        this.scaleY = 1;
        this.squashVelX = 0;
        this.squashVelY = 0;

        // Tail physics (spring-chain of 6 segments)
        this.tailSegments = [];
        this.numTailSegments = 6;
        this.tailSegmentLength = 5.5;
        for (let i = 0; i < this.numTailSegments; i++) {
            this.tailSegments.push({ x: this.x - i * 4, y: this.y, vx: 0, vy: 0 });
        }

        // Animation counters
        this.animTimer = 0;
        this.walkCycle = 0;
        this.lastStepCycle = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.idlePawTwitch = 0;

        // Ink spirit aura
        this.auraPhase = 0;
    }

    reset(x = this.startX, y = this.startY) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.isGrounded = false;
        this.isCharging = false;
        this.chargeTime = 0;
        this.chargePower = 0;
        this.hasDoubleJumped = false;
        this.state = 'idle';
        this.isAlive = true;
        this.hasWon = false;
        this.facing = 1;
        this.walkCycle = 0;
        this.lastStepCycle = 0;
        
        for (let i = 0; i < this.numTailSegments; i++) {
            this.tailSegments[i] = { x: this.x - i * 4, y: this.y, vx: 0, vy: 0 };
        }
    }

    // Apply movement input
    move(dir) {
        if (!this.isAlive || this.hasWon) return;
        if (dir !== 0) {
            this.facing = dir > 0 ? 1 : -1;
            const accel = this.isGrounded ? 0.8 : 0.45;
            this.vx += dir * accel;
            if (Math.abs(this.vx) > this.maxSpeed) {
                this.vx = Math.sign(this.vx) * this.maxSpeed;
            }
        }
    }

    // Direct instant jump with variable height support (即时飞跃，零蓄力延迟)
    jump(particleSystem = null) {
        if (!this.isAlive || this.hasWon) return;

        if (this.isGrounded) {
            // Immediate leap!
            this.vy = -12.6;
            // Running leap carries agile forward momentum
            const forwardSpeed = Math.abs(this.vx) > 0.5 ? Math.max(Math.abs(this.vx), 4.8) : 3.6;
            this.vx = this.facing * forwardSpeed;

            this.isGrounded = false;
            this.hasDoubleJumped = false;
            this.isJumpHeld = true;

            // Takeoff stretch
            this.scaleX = 0.68;
            this.scaleY = 1.38;

            if (window.soundManager) {
                window.soundManager.playJump(0.85);
            }

            if (particleSystem) {
                particleSystem.createInkSplatter(this.x, this.y + 10, 8, 1.2);
            }
        } else if (!this.hasDoubleJumped) {
            // Air double jump
            this.performDoubleJump(particleSystem);
        }
    }

    setJumpHeld(held) {
        this.isJumpHeld = held;
    }

    // Direct slingshot / aimed fling
    fling(angle, powerRatio = 0.8, particleSystem = null) {
        if (!this.isAlive || this.hasWon) return;
        const power = Math.max(0.4, Math.min(1.0, powerRatio));
        const jumpSpeed = 9.5 + power * 8.5;

        this.vx = Math.cos(angle) * jumpSpeed;
        this.vy = Math.sin(angle) * jumpSpeed;

        this.isGrounded = false;
        this.hasDoubleJumped = false;
        this.isJumpHeld = true;

        this.scaleX = 0.65;
        this.scaleY = 1.4;

        if (window.soundManager) {
            window.soundManager.playJump(power);
        }

        if (particleSystem) {
            particleSystem.createInkSplatter(this.x, this.y + 10, 10, 1.3);
        }
    }

    // Start charging jump (optional quick aim)
    startCharge(angle = null) {
        if (!this.isAlive || this.hasWon) return;
        if (this.isGrounded) {
            this.isCharging = true;
            this.chargeTime = 0;
            this.chargePower = 0.5; // Start with decent power immediately
            if (angle !== null) {
                this.aimAngle = angle;
            } else {
                this.aimAngle = this.facing > 0 ? -Math.PI * 0.35 : -Math.PI * 0.65;
            }
        } else if (!this.hasDoubleJumped) {
            this.performDoubleJump();
        }
    }

    // Update charging aim angle
    setAim(angle, powerRatio = null) {
        this.aimAngle = angle;
        if (powerRatio !== null) {
            this.chargePower = Math.min(1.0, Math.max(0.4, powerRatio));
        }
    }

    // Release charge to jump
    releaseCharge(particleSystem = null) {
        if (!this.isCharging || !this.isAlive || this.hasWon) return;
        this.isCharging = false;
        
        const power = Math.max(0.4, this.chargePower);
        const jumpSpeed = 9.0 + power * 8.5;

        this.vx = Math.cos(this.aimAngle) * jumpSpeed;
        this.vy = Math.sin(this.aimAngle) * jumpSpeed;

        this.isGrounded = false;
        this.hasDoubleJumped = false;
        this.isJumpHeld = true;

        this.scaleX = 0.7;
        this.scaleY = 1.4;

        if (window.soundManager) {
            window.soundManager.playJump(power);
        }

        if (particleSystem) {
            particleSystem.createInkSplatter(this.x, this.y + 10, Math.floor(6 + power * 8), 1.2);
        }
    }

    // Immediate quick jump
    quickJump(particleSystem = null) {
        this.jump(particleSystem);
    }

    // Double jump (踏墨二段跳)
    performDoubleJump(particleSystem = null) {
        if (!this.isAlive || this.hasWon || this.hasDoubleJumped) return;
        this.hasDoubleJumped = true;
        this.vy = -11.5;
        this.vx = this.facing * Math.max(Math.abs(this.vx), 5.2);
        this.isJumpHeld = true;

        // Squash/Stretch
        this.scaleX = 0.65;
        this.scaleY = 1.35;

        if (window.soundManager) {
            window.soundManager.playJump(0.95);
        }

        if (particleSystem) {
            particleSystem.createInkSplatter(this.x, this.y + 8, 12, 1.4);
            particleSystem.createTrail(this.x, this.y, 10, 0.8);
        }
    }

    // Land on a surface
    land(groundY, surfaceType = 'tile', particleSystem = null) {
        this.y = groundY - this.height * 0.5;
        const impactVy = this.vy;
        this.vy = 0;
        this.isGrounded = true;
        this.hasDoubleJumped = false;

        // Squash on landing
        const squishFactor = Math.min(0.4, Math.max(0.1, impactVy * 0.03));
        this.scaleX = 1 + squishFactor * 1.5;
        this.scaleY = 1 - squishFactor * 1.2;

        if (window.soundManager && impactVy > 2.5) {
            window.soundManager.playLand(surfaceType);
        }

        if (particleSystem && impactVy > 2.0) {
            particleSystem.createInkSplatter(this.x, this.y + 12, Math.floor(4 + impactVy * 0.8), 0.9);
            if (surfaceType === 'water' || surfaceType === 'lotus') {
                particleSystem.createRipple(this.x, this.y + 12, 35);
            } else {
                // Plum-blossom paw prints on landing
                particleSystem.createFootprint(this.x - 6, this.y + 13, this.facing);
                particleSystem.createFootprint(this.x + 6, this.y + 13, this.facing);
            }
        }
    }

    update(particleSystem = null) {
        this.animTimer++;
        this.auraPhase += 0.05;

        if (!this.isAlive) {
            // Fall into oblivion (capped)
            if (this.vy < 14) this.vy += this.gravity * 0.8;
            this.y += this.vy;
            this.x += this.vx * 0.9;
            return;
        }

        // Charge accumulation
        if (this.isCharging) {
            this.chargeTime++;
            this.chargePower = Math.min(1.0, this.chargeTime / this.maxChargeTime);
            // Crouch squash while charging
            const crouch = this.chargePower * 0.45;
            this.scaleX = 1.0 + crouch * 0.8;
            this.scaleY = 1.0 - crouch * 0.6;
            this.vx *= 0.5; // Cannot slide fast while crouching
        }

        // Physics integration
        if (!this.isGrounded) {
            // Variable jump height: if jump key is held while ascending, gravity is reduced (graceful high float)
            const currentGravity = (this.isJumpHeld && this.vy < 0) ? 0.32 : this.gravity;
            this.vy += currentGravity;
            this.vx *= this.airFriction;
            
            // Spawn ink smoke trail during leap
            if (particleSystem && (Math.abs(this.vx) > 3 || Math.abs(this.vy) > 3) && this.animTimer % 2 === 0) {
                particleSystem.createTrail(this.x, this.y, 5 + Math.random() * 3, 0.45);
            }
        } else {
            this.vx *= this.friction;
            if (Math.abs(this.vx) < 0.05) this.vx = 0;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Spring recovery of squash & stretch
        const k = 0.2; // Spring stiffness
        const d = 0.72; // Damping
        this.squashVelX += (1 - this.scaleX) * k;
        this.squashVelX *= d;
        this.scaleX += this.squashVelX;

        this.squashVelY += (1 - this.scaleY) * k;
        this.squashVelY *= d;
        this.scaleY += this.squashVelY;

        // Determine state
        if (this.isCharging) {
            this.state = 'crouch';
        } else if (!this.isGrounded) {
            this.state = this.vy < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.vx) > 0.4) {
            this.state = 'run';
            this.walkCycle += Math.abs(this.vx) * 0.18;
            if (this.isGrounded && particleSystem && Math.floor(this.walkCycle * 0.45) !== this.lastStepCycle) {
                this.lastStepCycle = Math.floor(this.walkCycle * 0.45);
                particleSystem.createFootprint(this.x - this.facing * 6, this.y + 13, this.facing);
            }
        } else {
            this.state = 'idle';
        }

        // Blinking
        this.blinkTimer++;
        if (this.blinkTimer > 180 && Math.random() < 0.02) {
            this.isBlinking = true;
            if (this.blinkTimer > 195) {
                this.isBlinking = false;
                this.blinkTimer = 0;
            }
        }

        // Tail physics update
        this.updateTail();
    }

    updateTail() {
        // Base attachment at cat's rear
        const rearOffset = -this.facing * 14 * this.scaleX;
        const baseHeight = this.y - 2 * this.scaleY;
        let prevX = this.x + rearOffset;
        let prevY = baseHeight;

        for (let i = 0; i < this.numTailSegments; i++) {
            const seg = this.tailSegments[i];
            
            // Target position based on cat movement
            let targetAngle = (this.facing > 0 ? Math.PI * 0.9 : Math.PI * 0.1);
            if (this.state === 'run') {
                targetAngle += Math.sin(this.walkCycle + i * 0.5) * 0.35;
            } else if (this.state === 'jump') {
                targetAngle = (this.facing > 0 ? Math.PI * 1.15 : -Math.PI * 0.15);
            } else if (this.state === 'crouch') {
                // Tail curls tightly
                targetAngle = (this.facing > 0 ? Math.PI * 0.6 : Math.PI * 0.4);
            }

            const targetX = prevX + Math.cos(targetAngle) * this.tailSegmentLength;
            const targetY = prevY + Math.sin(targetAngle) * this.tailSegmentLength;

            // Spring force towards target
            seg.vx += (targetX - seg.x) * 0.35;
            seg.vy += (targetY - seg.y) * 0.35;
            seg.vx *= 0.68;
            seg.vy *= 0.68;

            seg.x += seg.vx;
            seg.y += seg.vy;

            // Constrain distance to previous segment
            const dx = seg.x - prevX;
            const dy = seg.y - prevY;
            const dist = Math.hypot(dx, dy);
            if (dist > this.tailSegmentLength) {
                seg.x = prevX + (dx / dist) * this.tailSegmentLength;
                seg.y = prevY + (dy / dist) * this.tailSegmentLength;
            }

            prevX = seg.x;
            prevY = seg.y;
        }
    }

    // Trajectory arc preview for aiming
    drawTrajectory(ctx, camX, camY) {
        if (!this.isCharging || !this.isAlive) return;

        const power = Math.max(0.35, this.chargePower);
        const jumpSpeed = 8.0 + power * 9.5;
        let simX = this.x;
        let simY = this.y;
        let simVx = Math.cos(this.aimAngle) * jumpSpeed;
        let simVy = Math.sin(this.aimAngle) * jumpSpeed;

        ctx.save();
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = 'rgba(40, 40, 40, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(simX - camX, simY - camY);

        const steps = 28;
        for (let i = 0; i < steps; i++) {
            simX += simVx;
            simY += simVy;
            simVy += this.gravity;
            simVx *= this.airFriction;
            ctx.lineTo(simX - camX, simY - camY);
        }
        ctx.stroke();

        // End target ink splash dot
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(180, 40, 40, 0.85)'; // 朱砂红瞄准印记
        ctx.beginPath();
        ctx.arc(simX - camX, simY - camY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Render ink cat using Chinese calligraphy aesthetics
    render(ctx, camX, camY) {
        const renderX = this.x - camX;
        const renderY = this.y - camY;

        // 1. Draw Tail first in world coordinates (physics match)
        this.renderTail(ctx, camX, camY);

        // 2. Draw Cat Body, Head & Paws in local transformed coordinates
        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.scale(this.facing * this.scaleX, this.scaleY);

        this.renderBody(ctx);
        this.renderHead(ctx);
        this.renderPaws(ctx);

        ctx.restore();

        // 3. Ink Charge Aura (when crouching)
        if (this.isCharging) {
            ctx.save();
            ctx.strokeStyle = `rgba(30, 30, 30, ${0.3 + this.chargePower * 0.4})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([3, 4]);
            ctx.beginPath();
            ctx.ellipse(renderX, renderY + 5, 24 * (1 + this.chargePower * 0.3), 12, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    renderTail(ctx, camX, camY) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Connect tail segments with tapering brush stroke
        for (let i = 0; i < this.tailSegments.length - 1; i++) {
            const p1 = this.tailSegments[i];
            const p2 = this.tailSegments[i + 1];
            
            // Width tapers towards tip: 5.5px -> 1.8px
            const strokeWidth = 5.5 - i * 0.75;
            ctx.lineWidth = strokeWidth;
            ctx.strokeStyle = `rgba(22, 22, 24, ${0.95 - i * 0.05})`;

            ctx.beginPath();
            ctx.moveTo(p1.x - camX, p1.y - camY);
            ctx.lineTo(p2.x - camX, p2.y - camY);
            ctx.stroke();
        }
        ctx.restore();
    }

    renderBody(ctx) {
        ctx.save();

        // Ink Cat body: pitch ink (焦墨) with soft wash gradient
        // Curved spine Bezier
        const spineY = this.state === 'crouch' ? 3 : (this.state === 'jump' ? -5 : 0);

        ctx.fillStyle = '#1c1b1a'; // Deepest Chinese ink black
        ctx.strokeStyle = '#11100f';
        ctx.lineWidth = 1.8;

        ctx.beginPath();
        // Back curve
        ctx.moveTo(-16, 4 + spineY);
        ctx.quadraticCurveTo(-10, -14 + spineY, 4, -10 + spineY);
        // Chest & Neck
        ctx.quadraticCurveTo(14, -6, 12, 4);
        // Belly & Hindquarters
        ctx.quadraticCurveTo(0, 10, -16, 4 + spineY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Traditional "踏雪" white chest patch / subtle ink wash highlight
        ctx.fillStyle = 'rgba(240, 238, 230, 0.25)';
        ctx.beginPath();
        ctx.ellipse(3, 1, 5, 7, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    renderHead(ctx) {
        ctx.save();
        const headX = 12;
        const headY = this.state === 'crouch' ? 2 : (this.state === 'jump' ? -8 : -7);

        // Head shape
        ctx.fillStyle = '#1c1b1a';
        ctx.beginPath();
        ctx.ellipse(headX, headY, 9.5, 8.5, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Left & Right pointed ears (水墨猫耳)
        const earAngle = this.state === 'crouch' ? -0.4 : 0;
        
        // Left Ear
        ctx.beginPath();
        ctx.moveTo(headX - 6, headY - 4);
        ctx.lineTo(headX - 9 + earAngle * 4, headY - 15);
        ctx.lineTo(headX - 1, headY - 8);
        ctx.closePath();
        ctx.fill();

        // Right Ear
        ctx.beginPath();
        ctx.moveTo(headX + 1, headY - 8);
        ctx.lineTo(headX + 6 + earAngle * 4, headY - 16);
        ctx.lineTo(headX + 9, headY - 4);
        ctx.closePath();
        ctx.fill();

        // Inner ear delicate cinnabar pink wash
        ctx.fillStyle = 'rgba(215, 125, 115, 0.4)';
        ctx.beginPath();
        ctx.moveTo(headX - 5, headY - 5);
        ctx.lineTo(headX - 7 + earAngle * 3, headY - 13);
        ctx.lineTo(headX - 2, headY - 7);
        ctx.fill();

        // Eyes (Golden amber / Zen ink slit)
        if (this.isBlinking || this.state === 'crouch') {
            // Serene curved closed ink line
            ctx.strokeStyle = '#dfc888';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(headX + 3, headY - 1);
            ctx.quadraticCurveTo(headX + 6, headY, headX + 9, headY - 2);
            ctx.stroke();
        } else {
            // Bright amber glowing eye with sharp ink pupil
            ctx.fillStyle = '#e8ba45'; // Amber gold
            ctx.beginPath();
            ctx.ellipse(headX + 6, headY - 1, 3.2, 3.8, 0.1, 0, Math.PI * 2);
            ctx.fill();

            // Pupil
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.ellipse(headX + 6.2, headY - 1, 1.2, 3.2, 0.05, 0, Math.PI * 2);
            ctx.fill();

            // Highlight glint
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(headX + 5.2, headY - 2.5, 0.9, 0, Math.PI * 2);
            ctx.fill();
        }

        // Whiskers (细毫胡须)
        ctx.strokeStyle = 'rgba(240, 240, 240, 0.65)';
        ctx.lineWidth = 0.9;
        // Upper whisker
        ctx.beginPath();
        ctx.moveTo(headX + 7, headY + 2);
        ctx.lineTo(headX + 17, headY - 1);
        ctx.stroke();
        // Lower whisker
        ctx.beginPath();
        ctx.moveTo(headX + 7, headY + 4);
        ctx.lineTo(headX + 16, headY + 5);
        ctx.stroke();

        ctx.restore();
    }

    renderPaws(ctx) {
        ctx.save();
        ctx.fillStyle = '#1c1b1a';

        if (this.state === 'run') {
            // Dynamic running paws
            const legSwing1 = Math.sin(this.walkCycle) * 8;
            const legSwing2 = Math.cos(this.walkCycle) * 8;

            // Front paws
            ctx.beginPath();
            ctx.arc(8 + legSwing1, 11, 3.2, 0, Math.PI * 2);
            ctx.fill();

            // Hind paws
            ctx.beginPath();
            ctx.arc(-10 + legSwing2, 11, 3.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.state === 'jump') {
            // Paws extended / reaching
            ctx.beginPath();
            ctx.arc(14, 8, 3.2, 0, Math.PI * 2);
            ctx.arc(-12, 12, 3.5, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.state === 'crouch') {
            // Paws tucked under
            ctx.beginPath();
            ctx.arc(10, 8, 3.5, 0, Math.PI * 2);
            ctx.arc(-10, 8, 3.8, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Idle standing paws (踏雪白爪: pure white tips)
            ctx.beginPath();
            ctx.arc(8, 11, 3.5, 0, Math.PI * 2);
            ctx.arc(-8, 11, 3.8, 0, Math.PI * 2);
            ctx.fill();

            // Subtle white paw soles ("踏雪")
            ctx.fillStyle = 'rgba(245, 243, 238, 0.6)';
            ctx.beginPath();
            ctx.arc(8, 12.5, 1.8, 0, Math.PI * 2);
            ctx.arc(-8, 12.5, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

window.InkCat = InkCat;
