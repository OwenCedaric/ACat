/**
 * Smooth Tracking Camera with Dynamic Look-Ahead & Screen Shake
 * (平滑镜头跟随与屏幕微震系统)
 */

class Camera {
    constructor(viewportWidth, viewportHeight) {
        this.x = 0;
        this.y = 0;
        this.viewportW = viewportWidth;
        this.viewportH = viewportHeight;
        
        // Target tracking
        this.targetX = 0;
        this.targetY = 0;
        this.lerpSpeed = 0.085;
        
        // Look-ahead
        this.lookAheadX = 0;
        this.lookAheadDistance = 90;
        
        // Screen shake
        this.shakeDuration = 0;
        this.shakeIntensity = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    }

    resize(w, h) {
        this.viewportW = w;
        this.viewportH = h;
    }

    shake(intensity = 6, duration = 12) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
    }

    update(target, levelWidth, levelHeight) {
        if (!target.isAlive) {
            // Keep camera steady when cat falls
            return;
        }

        // Look-ahead based on cat's facing and velocity
        const desiredLookAhead = target.facing * this.lookAheadDistance + target.vx * 12;
        this.lookAheadX += (desiredLookAhead - this.lookAheadX) * 0.06;

        // Ideal camera center
        const desiredX = target.x - (this.viewportW * 0.38) + this.lookAheadX;
        const desiredY = target.y - (this.viewportH * 0.55);

        // Smooth Lerp
        this.x += (desiredX - this.x) * this.lerpSpeed;
        this.y += (desiredY - this.y) * this.lerpSpeed;

        // Screen shake update
        if (this.shakeDuration > 0) {
            this.shakeDuration--;
            const decay = this.shakeDuration / 12;
            this.shakeOffsetX = (Math.random() * 2 - 1) * this.shakeIntensity * decay;
            this.shakeOffsetY = (Math.random() * 2 - 1) * this.shakeIntensity * decay;
        } else {
            this.shakeOffsetX = 0;
            this.shakeOffsetY = 0;
        }

        // Clamp to level bounds
        const minX = 0;
        const maxX = Math.max(0, levelWidth - this.viewportW);
        this.x = Math.max(minX, Math.min(maxX, this.x));

        // Vertical clamp
        const minY = -50;
        const maxY = Math.max(minY, levelHeight - this.viewportH + 60);
        this.y = Math.max(minY, Math.min(maxY, this.y));
    }

    getRenderX() {
        return Math.floor(this.x + this.shakeOffsetX);
    }

    getRenderY() {
        return Math.floor(this.y + this.shakeOffsetY);
    }
}

window.Camera = Camera;
