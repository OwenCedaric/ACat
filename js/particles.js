/**
 * Ink Wash Particle System (水墨粒子与意境特效)
 * Manages ink splatters, ink bleed stains, atmospheric weather, and water ripples.
 */

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.ripples = [];
        this.ambientParticles = [];
        this.stains = []; // Persistent ink stains on paper
        this.footprints = []; // Plum-blossom paw prints (踏雪留痕)
        this.floatingTexts = []; // Calligraphic ink floating prompt texts
    }

    reset() {
        this.particles = [];
        this.ripples = [];
        this.ambientParticles = [];
        this.stains = [];
        this.footprints = [];
        this.floatingTexts = [];
    }

    // Spawn floating calligraphic ink message
    createFloatingText(x, y, text, color = '#b83828') {
        this.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            color: color,
            alpha: 1.0,
            vy: -1.2,
            life: 65,
            maxLife: 65
        });
    }

    // Spawn tiny fading ink paw prints on platforms
    createFootprint(x, y, facing) {
        if (this.footprints.length > 50) {
            this.footprints.shift();
        }
        this.footprints.push({
            x: x,
            y: y,
            facing: facing,
            alpha: 0.6,
            decay: 0.006 // Fades gracefully
        });
    }

    // Spawn an ink splatter when cat jumps or lands
    createInkSplatter(x, y, count = 8, scale = 1.0, color = 'rgba(26, 26, 26, ') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 3 + 1) * scale;
            const size = (Math.random() * 4 + 2) * scale;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - (Math.random() * 1.5 * scale),
                size: size,
                baseSize: size,
                alpha: 0.8 + Math.random() * 0.2,
                decay: 0.02 + Math.random() * 0.02,
                colorPrefix: color,
                type: 'ink'
            });
        }
    }

    // Spawn ink trail from cat tail/body during leap
    createTrail(x, y, size = 6, alpha = 0.5) {
        this.particles.push({
            x: x + (Math.random() * 4 - 2),
            y: y + (Math.random() * 4 - 2),
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: size,
            baseSize: size,
            growth: 0.25, // Ink bleeds outward
            alpha: alpha,
            decay: 0.035,
            colorPrefix: 'rgba(30, 30, 30, ',
            type: 'smoke'
        });
    }

    // Create a circular water ripple (for river/stream surfaces)
    createRipple(x, y, maxRadius = 35) {
        this.ripples.push({
            x: x,
            y: y,
            radius: 4,
            maxRadius: maxRadius,
            growth: 1.2,
            alpha: 0.6,
            decay: 0.015
        });
    }

    // Initialize atmospheric particles according to level theme
    initAmbient(levelType, width, height) {
        this.ambientParticles = [];
        const count = 40;
        for (let i = 0; i < count; i++) {
            this.ambientParticles.push(this.createRandomAmbient(levelType, width, height, true));
        }
    }

    createRandomAmbient(levelType, width, height, randomStart = false) {
        const x = randomStart ? Math.random() * width : (Math.random() > 0.5 ? Math.random() * width : width + 20);
        const y = randomStart ? Math.random() * height : -20;

        if (levelType === 'rooftop') {
            // Rain drizzle / mist
            return {
                x: x,
                y: y,
                vx: -1.5 - Math.random() * 1.0,
                vy: 5.0 + Math.random() * 3.0,
                length: 12 + Math.random() * 10,
                alpha: 0.2 + Math.random() * 0.25,
                type: 'rain'
            };
        } else if (levelType === 'river') {
            // Drifting peach blossom / lotus petals or fireflies
            const isFirefly = Math.random() < 0.35;
            if (isFirefly) {
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: 2.5 + Math.random() * 2,
                    alpha: 0.3 + Math.random() * 0.5,
                    pulse: Math.random() * Math.PI * 2,
                    type: 'firefly'
                };
            } else {
                return {
                    x: x,
                    y: y,
                    vx: -1.0 - Math.random() * 1.5,
                    vy: 1.0 + Math.random() * 1.0,
                    rotation: Math.random() * Math.PI * 2,
                    rotSpeed: (Math.random() - 0.5) * 0.04,
                    size: 4 + Math.random() * 3,
                    alpha: 0.5 + Math.random() * 0.3,
                    type: 'petal'
                };
            }
        } else if (levelType === 'bamboo') {
            // Bamboo leaves drifting in mountain wind
            return {
                x: x,
                y: y,
                vx: -2.0 - Math.random() * 2.0,
                vy: 0.8 + Math.random() * 1.5,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.05,
                size: 5 + Math.random() * 4,
                alpha: 0.4 + Math.random() * 0.4,
                type: 'bamboo_leaf'
            };
        } else {
            // Pagoda: golden embers & night mist
            return {
                x: Math.random() * width,
                y: y,
                vx: (Math.random() - 0.5) * 1.0,
                vy: -0.5 - Math.random() * 1.2,
                size: 2 + Math.random() * 3,
                alpha: 0.4 + Math.random() * 0.4,
                type: 'ember'
            };
        }
    }

    update(levelType, screenW, screenH, camX = 0) {
        // Update splatters and trails
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.growth) p.size += p.growth;
            p.alpha -= p.decay;

            if (p.type === 'ink') {
                p.vy += 0.12; // Gravity on ink droplets
            }

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update water ripples
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.radius += r.growth;
            r.alpha -= r.decay;
            if (r.alpha <= 0 || r.radius >= r.maxRadius) {
                this.ripples.splice(i, 1);
            }
        }

        // Update ink paw footprints
        for (let i = this.footprints.length - 1; i >= 0; i--) {
            const fp = this.footprints[i];
            fp.alpha -= fp.decay;
            if (fp.alpha <= 0) {
                this.footprints.splice(i, 1);
            }
        }

        // Update floating calligraphic texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.vy *= 0.96;
            ft.life--;
            ft.alpha = ft.life / ft.maxLife;
            if (ft.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }

        // Update ambient weather
        for (let i = 0; i < this.ambientParticles.length; i++) {
            const a = this.ambientParticles[i];
            a.x += a.vx;
            a.y += a.vy;

            if (a.type === 'firefly') {
                a.pulse += 0.05;
                a.x += Math.sin(a.pulse) * 0.5;
                a.y += Math.cos(a.pulse * 0.8) * 0.3;
            } else if (a.rotation !== undefined) {
                a.rotation += a.rotSpeed;
            }

            // Wrap around screen bounds
            if (a.y > screenH + 30 || a.x < -30 || a.x > screenW + 50 || a.y < -30) {
                this.ambientParticles[i] = this.createRandomAmbient(levelType, screenW, screenH, false);
            }
        }
    }

    renderWorldParticles(ctx, camX, camY) {
        // Draw delicate ink paw prints on surfaces (踏雪留痕 / 梅花爪印)
        for (const fp of this.footprints) {
            const rx = fp.x - camX;
            const ry = fp.y - camY;
            ctx.save();
            ctx.translate(rx, ry);
            ctx.scale(fp.facing, 1);
            ctx.fillStyle = `rgba(32, 32, 35, ${fp.alpha})`;

            // Main palm pad
            ctx.beginPath();
            ctx.ellipse(0, 0, 3.2, 2.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // 4 tiny toe dots (梅花四瓣)
            const toes = [
                { dx: -2.8, dy: -3.4, r: 1.1 },
                { dx: -1.0, dy: -4.5, r: 1.2 },
                { dx: 1.0, dy: -4.5, r: 1.2 },
                { dx: 2.8, dy: -3.4, r: 1.1 }
            ];
            for (const t of toes) {
                ctx.beginPath();
                ctx.arc(t.dx, t.dy, t.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Draw water ripples in world coordinates
        for (const r of this.ripples) {
            ctx.save();
            ctx.strokeStyle = `rgba(50, 70, 75, ${r.alpha})`;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            // Draw slightly squished ellipse for 2.5D perspective
            ctx.ellipse(r.x - camX, r.y - camY, r.radius * 1.5, r.radius * 0.6, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Inner faint ripple ring
            if (r.radius > 10) {
                ctx.strokeStyle = `rgba(60, 80, 85, ${r.alpha * 0.5})`;
                ctx.beginPath();
                ctx.ellipse(r.x - camX, r.y - camY, (r.radius - 8) * 1.5, (r.radius - 8) * 0.6, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        // Draw ink drops and smoke trails in world coordinates
        for (const p of this.particles) {
            ctx.save();
            ctx.fillStyle = `${p.colorPrefix}${Math.max(0, p.alpha)})`;
            ctx.beginPath();
            if (p.type === 'smoke') {
                // Soft fuzzy ink smoke
                ctx.arc(p.x - camX, p.y - camY, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Irregular ink droplet with organic feel
                ctx.arc(p.x - camX, p.y - camY, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Draw floating calligraphic messages in world space
        for (const ft of this.floatingTexts) {
            ctx.save();
            ctx.font = 'bold 15px "Noto Serif SC", "Songti SC", serif';
            ctx.textAlign = 'center';
            ctx.fillStyle = ft.color;
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
            ctx.shadowBlur = 6;
            ctx.fillText(ft.text, ft.x - camX, ft.y - camY);
            ctx.restore();
        }
    }

    renderScreenParticles(ctx, screenW, screenH) {
        // Render screen-space weather & atmosphere (rain, leaves, petals, fireflies)
        for (const a of this.ambientParticles) {
            ctx.save();
            if (a.type === 'rain') {
                ctx.strokeStyle = `rgba(80, 95, 105, ${a.alpha})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(a.x + a.vx * 2.5, a.y + a.length);
                ctx.stroke();
            } else if (a.type === 'petal') {
                ctx.translate(a.x, a.y);
                ctx.rotate(a.rotation);
                // Soft wash pink-ink petal
                ctx.fillStyle = `rgba(185, 95, 105, ${a.alpha})`;
                ctx.beginPath();
                ctx.ellipse(0, 0, a.size, a.size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (a.type === 'bamboo_leaf') {
                ctx.translate(a.x, a.y);
                ctx.rotate(a.rotation);
                // Slender bamboo leaf shape
                ctx.fillStyle = `rgba(65, 88, 68, ${a.alpha})`;
                ctx.beginPath();
                ctx.moveTo(-a.size, 0);
                ctx.quadraticCurveTo(0, -a.size * 0.35, a.size, 0);
                ctx.quadraticCurveTo(0, a.size * 0.35, -a.size, 0);
                ctx.fill();
            } else if (a.type === 'firefly') {
                const currentAlpha = a.alpha * (0.6 + 0.4 * Math.sin(a.pulse));
                // Firefly golden-green glow
                const grad = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, a.size * 2.5);
                grad.addColorStop(0, `rgba(220, 240, 140, ${currentAlpha})`);
                grad.addColorStop(1, 'rgba(200, 230, 120, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.size * 2.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (a.type === 'ember') {
                ctx.fillStyle = `rgba(215, 160, 70, ${a.alpha})`;
                ctx.beginPath();
                ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }
}

window.ParticleSystem = ParticleSystem;
