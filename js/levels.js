/**
 * Ink Wash Level Designs and Platform Renderers (水墨关卡与雅致场景)
 * Level 1: 瓦顶飞檐 (Jumping over ancient town buildings/roofs)
 * Level 2: 碧溪浮萍 (Jumping across river stones, lily pads, bamboo rafts)
 * Level 3: 翠竹凌霄 (Climbing bamboo grove and ancient pine branches)
 * Level 4: 夜月古刹 (Moonlit pagoda and floating sky lanterns)
 */

class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevelIndex = 0;
        this.initLevels();
    }

    initLevels() {
        this.levels = [
            // ==========================================
            // Level 1: 瓦顶飞檐 (Ancient Town Rooftops)
            // ==========================================
            {
                id: 1,
                name: "第一关 · 瓦顶飞檐",
                subtitle: "烟雨江南 · 踏瓦轻行",
                type: "rooftop",
                themeColor: "#424b52",
                startX: 80,
                startY: 420,
                width: 3200,
                height: 700,
                deadY: 650,
                parTime: 45,
                backgroundStyle: {
                    skyTop: "#e8e3d8",
                    skyBottom: "#dcd6c5",
                    mountainColor1: "rgba(165, 175, 178, 0.4)",
                    mountainColor2: "rgba(110, 125, 130, 0.6)",
                    mountainColor3: "rgba(65, 78, 85, 0.8)",
                    hasGeese: true
                },
                platforms: [
                    // Start house
                    { x: 30, y: 460, w: 260, h: 240, type: "roof", style: "tile", slope: 0 },
                    // Low eaves gap
                    { x: 350, y: 430, w: 200, h: 270, type: "roof", style: "tile", slope: -0.1 },
                    // Chimney bounce post
                    { x: 610, y: 360, w: 55, h: 340, type: "chimney", style: "brick" },
                    // High building
                    { x: 730, y: 310, w: 280, h: 390, type: "roof", style: "tile", slope: 0.08 },
                    // Bouncy lantern hanging from eave
                    { x: 1060, y: 380, w: 45, h: 45, type: "lantern", bounce: 1.25 },
                    // Long sloping roof
                    { x: 1160, y: 350, w: 320, h: 350, type: "roof", style: "tile", slope: -0.15 },
                    // Triple stepping posts (梅花桩 / wooden pillars)
                    { x: 1540, y: 420, w: 45, h: 280, type: "pillar", style: "wood" },
                    { x: 1650, y: 380, w: 45, h: 320, type: "pillar", style: "wood" },
                    { x: 1760, y: 340, w: 45, h: 360, type: "pillar", style: "wood" },
                    // Two tiered pavilion roof
                    { x: 1870, y: 290, w: 220, h: 410, type: "roof", style: "tile", slope: 0 },
                    { x: 2150, y: 390, w: 180, h: 310, type: "roof", style: "tile", slope: 0.12 },
                    // High clothesline / bamboo pole
                    { x: 2380, y: 330, w: 90, h: 20, type: "bamboo_pole", bounce: 1.35 },
                    // Bell tower entrance
                    { x: 2540, y: 260, w: 240, h: 440, type: "roof", style: "tile", slope: -0.05 },
                    // Goal structure: Grand Clock/Bell Tower Pavilion
                    { x: 2860, y: 220, w: 300, h: 480, type: "bell_tower", isGoalArea: true }
                ],
                collectibles: [
                    { x: 180, y: 410, type: "ink", collected: false },
                    { x: 440, y: 370, type: "fish", collected: false },
                    { x: 635, y: 310, type: "ink", collected: false },
                    { x: 860, y: 260, type: "fish", collected: false },
                    { x: 1080, y: 320, type: "ink", collected: false },
                    { x: 1300, y: 290, type: "ink", collected: false },
                    { x: 1700, y: 290, type: "fish", collected: false },
                    { x: 2000, y: 230, type: "ink", collected: false },
                    { x: 2420, y: 270, type: "fish", collected: false },
                    { x: 2700, y: 200, type: "ink", collected: false }
                ],
                goal: {
                    x: 3020,
                    y: 220,
                    w: 60,
                    h: 80,
                    text: "归家暖榻"
                }
            },

            // ==========================================
            // Level 2: 碧溪浮萍 (River & Lily Pads)
            // ==========================================
            {
                id: 2,
                name: "第二关 · 碧溪浮萍",
                subtitle: "清波掠影 · 踏石穿渡",
                type: "river",
                themeColor: "#395b5c",
                startX: 80,
                startY: 400,
                width: 3300,
                height: 700,
                deadY: 580, // Falling into water resets or loses life
                waterY: 530,
                parTime: 50,
                backgroundStyle: {
                    skyTop: "#e5ece6",
                    skyBottom: "#d8e2d8",
                    mountainColor1: "rgba(145, 170, 160, 0.4)",
                    mountainColor2: "rgba(95, 125, 115, 0.6)",
                    mountainColor3: "rgba(50, 80, 75, 0.75)",
                    hasRiverReeds: true
                },
                platforms: [
                    // Grassy riverbank start
                    { x: 20, y: 440, w: 220, h: 260, type: "bank", style: "grass" },
                    // River stepping stones (汀步)
                    { x: 300, y: 460, w: 75, h: 140, type: "stone", style: "rock" },
                    { x: 440, y: 450, w: 70, h: 150, type: "stone", style: "rock" },
                    // Giant floating lotus pad (sinks slightly when stood on)
                    { x: 570, y: 470, w: 90, h: 30, type: "lotus", sinkable: true, sinkDepth: 0 },
                    // Drifting bamboo raft (moves horizontally back and forth)
                    { x: 740, y: 475, w: 130, h: 25, type: "raft", moving: true, range: 120, speed: 1.2, dir: 1, originX: 740 },
                    // Large mossy river rock
                    { x: 970, y: 420, w: 110, h: 180, type: "stone", style: "moss" },
                    // Pair of lotus pads
                    { x: 1150, y: 470, w: 85, h: 30, type: "lotus", sinkable: true, sinkDepth: 0 },
                    { x: 1290, y: 465, w: 85, h: 30, type: "lotus", sinkable: true, sinkDepth: 0 },
                    // Wooden fishing dock / pier
                    { x: 1440, y: 410, w: 160, h: 190, type: "pier", style: "wood" },
                    // Second moving bamboo raft (faster, larger gap)
                    { x: 1680, y: 475, w: 140, h: 25, type: "raft", moving: true, range: 160, speed: 1.6, dir: -1, originX: 1680 },
                    // High stone arch bridge ruins
                    { x: 1960, y: 350, w: 120, h: 250, type: "stone", style: "rock" },
                    { x: 2140, y: 310, w: 140, h: 290, type: "stone", style: "rock" },
                    // Lily pad sequence across deep rapids
                    { x: 2360, y: 465, w: 80, h: 30, type: "lotus", sinkable: true, sinkDepth: 0 },
                    { x: 2500, y: 470, w: 85, h: 30, type: "lotus", sinkable: true, sinkDepth: 0 },
                    { x: 2640, y: 450, w: 90, h: 150, type: "stone", style: "moss" },
                    // Opposite riverbank: Peach Blossom Pier
                    { x: 2800, y: 390, w: 460, h: 310, type: "bank", style: "grass", isGoalArea: true }
                ],
                collectibles: [
                    { x: 150, y: 390, type: "ink", collected: false },
                    { x: 340, y: 410, type: "fish", collected: false },
                    { x: 610, y: 420, type: "ink", collected: false },
                    { x: 800, y: 420, type: "fish", collected: false },
                    { x: 1020, y: 360, type: "ink", collected: false },
                    { x: 1220, y: 410, type: "ink", collected: false },
                    { x: 1520, y: 350, type: "fish", collected: false },
                    { x: 1750, y: 420, type: "ink", collected: false },
                    { x: 2020, y: 290, type: "fish", collected: false },
                    { x: 2420, y: 410, type: "ink", collected: false },
                    { x: 2950, y: 330, type: "fish", collected: false }
                ],
                goal: {
                    x: 3050,
                    y: 390,
                    w: 70,
                    h: 90,
                    text: "桃花渡口"
                }
            },

            // ==========================================
            // Level 3: 翠竹凌霄 (Bamboo Grove & Ancient Pines)
            // ==========================================
            {
                id: 3,
                name: "第三关 · 翠竹凌霄",
                subtitle: "风动修竹 · 踏枝凌云",
                type: "bamboo",
                themeColor: "#324838",
                startX: 80,
                startY: 550,
                width: 3100,
                height: 850,
                deadY: 780,
                parTime: 55,
                backgroundStyle: {
                    skyTop: "#e0e7dd",
                    skyBottom: "#d3dbce",
                    mountainColor1: "rgba(130, 155, 135, 0.4)",
                    mountainColor2: "rgba(85, 115, 92, 0.6)",
                    mountainColor3: "rgba(42, 68, 48, 0.8)",
                    hasBambooSilhouettes: true
                },
                platforms: [
                    // Mountain base cliff
                    { x: 30, y: 600, w: 220, h: 250, type: "cliff", style: "rock" },
                    // Springy bamboo stalk (弹跳竹枝)
                    { x: 300, y: 530, w: 100, h: 18, type: "bamboo_spring", bounce: 1.55, flex: 0 },
                    // Sturdy pine branch
                    { x: 460, y: 440, w: 140, h: 26, type: "pine_branch", style: "bark" },
                    // High springy bamboo
                    { x: 670, y: 360, w: 110, h: 18, type: "bamboo_spring", bounce: 1.6, flex: 0 },
                    // Ancient twisted pine trunk ledge
                    { x: 860, y: 280, w: 160, h: 35, type: "pine_branch", style: "bark" },
                    // Descending mist cloud (soft floating platform)
                    { x: 1090, y: 340, w: 120, h: 20, type: "cloud", floatPhase: 0 },
                    // Super bouncy bamboo catapult
                    { x: 1280, y: 420, w: 100, h: 18, type: "bamboo_spring", bounce: 1.7, flex: 0 },
                    // Cloud stepping stones in sea of fog
                    { x: 1470, y: 310, w: 110, h: 20, type: "cloud", floatPhase: 1.2 },
                    { x: 1660, y: 250, w: 120, h: 20, type: "cloud", floatPhase: 2.5 },
                    // Towering pine apex
                    { x: 1860, y: 200, w: 170, h: 32, type: "pine_branch", style: "bark" },
                    // Bamboo descent to cliff
                    { x: 2100, y: 290, w: 110, h: 18, type: "bamboo_spring", bounce: 1.5, flex: 0 },
                    { x: 2280, y: 380, w: 120, h: 25, type: "pine_branch", style: "bark" },
                    { x: 2470, y: 460, w: 100, h: 18, type: "bamboo_spring", bounce: 1.65, flex: 0 },
                    // Final cloud step to peak
                    { x: 2640, y: 340, w: 130, h: 20, type: "cloud", floatPhase: 0.8 },
                    // Summit: Cloud Pavilion Peak (绝顶望云亭)
                    { x: 2820, y: 240, w: 260, h: 610, type: "cliff", style: "summit", isGoalArea: true }
                ],
                collectibles: [
                    { x: 140, y: 540, type: "ink", collected: false },
                    { x: 350, y: 470, type: "fish", collected: false },
                    { x: 530, y: 380, type: "ink", collected: false },
                    { x: 720, y: 290, type: "fish", collected: false },
                    { x: 940, y: 220, type: "ink", collected: false },
                    { x: 1150, y: 280, type: "fish", collected: false },
                    { x: 1330, y: 330, type: "ink", collected: false },
                    { x: 1520, y: 240, type: "fish", collected: false },
                    { x: 1940, y: 140, type: "fish", collected: false },
                    { x: 2150, y: 220, type: "ink", collected: false },
                    { x: 2700, y: 270, type: "ink", collected: false }
                ],
                goal: {
                    x: 2950,
                    y: 240,
                    w: 80,
                    h: 90,
                    text: "云绝之巅"
                }
            },

            // ==========================================
            // Level 4: 夜月古刹 (Moonlit Pagoda & Sky Lanterns)
            // ==========================================
            {
                id: 4,
                name: "第四关 · 夜月古刹",
                subtitle: "银蟾皎皎 · 浮灯飞渡",
                type: "pagoda",
                themeColor: "#252b36",
                startX: 80,
                startY: 520,
                width: 3200,
                height: 800,
                deadY: 740,
                parTime: 60,
                backgroundStyle: {
                    skyTop: "#1c222d",
                    skyBottom: "#2f3747",
                    moon: { x: 500, y: 160, radius: 65 },
                    mountainColor1: "rgba(50, 60, 75, 0.4)",
                    mountainColor2: "rgba(35, 45, 58, 0.6)",
                    mountainColor3: "rgba(18, 24, 34, 0.8)",
                    hasLanterns: true
                },
                platforms: [
                    // Monastery courtyard roof
                    { x: 30, y: 560, w: 240, h: 240, type: "roof", style: "pagoda_tile" },
                    // Tier 1 Pagoda eave
                    { x: 330, y: 490, w: 180, h: 310, type: "roof", style: "pagoda_tile" },
                    // Floating giant Sky Lantern (孔明灯 - bobs up and down)
                    { x: 570, y: 420, w: 70, h: 25, type: "sky_lantern", bounce: 1.4, bobPhase: 0 },
                    // Tier 2 Pagoda eave
                    { x: 710, y: 380, w: 200, h: 420, type: "roof", style: "pagoda_tile" },
                    // Sky lantern pair
                    { x: 970, y: 340, w: 65, h: 25, type: "sky_lantern", bounce: 1.45, bobPhase: 1.5 },
                    { x: 1100, y: 280, w: 65, h: 25, type: "sky_lantern", bounce: 1.45, bobPhase: 3.0 },
                    // High temple bell beam
                    { x: 1240, y: 240, w: 160, h: 30, type: "beam", style: "wood" },
                    // Pagoda roof slope
                    { x: 1470, y: 300, w: 220, h: 500, type: "roof", style: "pagoda_tile" },
                    // Sky lanterns fleet
                    { x: 1750, y: 260, w: 65, h: 25, type: "sky_lantern", bounce: 1.5, bobPhase: 0.5 },
                    { x: 1880, y: 210, w: 65, h: 25, type: "sky_lantern", bounce: 1.5, bobPhase: 2.2 },
                    { x: 2010, y: 270, w: 65, h: 25, type: "sky_lantern", bounce: 1.4, bobPhase: 4.1 },
                    // High pagoda upper balcony
                    { x: 2140, y: 220, w: 190, h: 580, type: "roof", style: "pagoda_tile" },
                    // Sky lanterns ascending towards the moon
                    { x: 2400, y: 190, w: 65, h: 25, type: "sky_lantern", bounce: 1.55, bobPhase: 1.0 },
                    { x: 2530, y: 150, w: 65, h: 25, type: "sky_lantern", bounce: 1.55, bobPhase: 2.8 },
                    // Golden spire pinnacle of the Grand Pagoda
                    { x: 2720, y: 120, w: 320, h: 680, type: "pagoda_spire", isGoalArea: true }
                ],
                collectibles: [
                    { x: 150, y: 500, type: "ink", collected: false },
                    { x: 420, y: 430, type: "fish", collected: false },
                    { x: 605, y: 360, type: "ink", collected: false },
                    { x: 810, y: 320, type: "fish", collected: false },
                    { x: 1000, y: 280, type: "ink", collected: false },
                    { x: 1130, y: 220, type: "fish", collected: false },
                    { x: 1320, y: 180, type: "ink", collected: false },
                    { x: 1580, y: 240, type: "fish", collected: false },
                    { x: 1800, y: 200, type: "ink", collected: false },
                    { x: 2230, y: 160, type: "fish", collected: false },
                    { x: 2430, y: 130, type: "ink", collected: false },
                    { x: 2850, y: 70, type: "fish", collected: false }
                ],
                goal: {
                    x: 2900,
                    y: 120,
                    w: 80,
                    h: 90,
                    text: "古刹宝顶"
                }
            }
        ];
    }

    getCurrentLevel() {
        return this.levels[this.currentLevelIndex];
    }

    setLevel(index) {
        if (index >= 0 && index < this.levels.length) {
            this.currentLevelIndex = index;
            // Reset collectibles
            const lvl = this.levels[index];
            lvl.collectibles.forEach(c => c.collected = false);
            return lvl;
        }
        return null;
    }

    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            return this.setLevel(this.currentLevelIndex);
        }
        return null; // All levels complete!
    }

    // Update dynamic platform states (moving rafts, floating lilies, bobbing lanterns)
    updatePlatforms() {
        const lvl = this.getCurrentLevel();
        if (!lvl) return;

        for (const p of lvl.platforms) {
            // Moving bamboo raft in river level
            if (p.moving && p.originX !== undefined) {
                p.x += p.speed * p.dir;
                if (Math.abs(p.x - p.originX) > p.range) {
                    p.dir *= -1;
                }
            }

            // Lotus pad recovery when not stood on
            if (p.sinkable && p.sinkDepth > 0) {
                p.sinkDepth = Math.max(0, p.sinkDepth - 0.4);
            }

            // Springy bamboo flex recovery
            if (p.bounce && p.flex !== undefined && p.flex > 0) {
                p.flex = Math.max(0, p.flex - 0.8);
            }

            // Bobbing sky lanterns & clouds
            if (p.bobPhase !== undefined) {
                p.bobPhase += 0.04;
                p.currentY = p.y + Math.sin(p.bobPhase) * 6;
            } else {
                p.currentY = p.y;
            }

            if (p.floatPhase !== undefined) {
                p.floatPhase += 0.03;
                p.currentY = p.y + Math.sin(p.floatPhase) * 4;
            }
        }
    }

    // ==========================================
    // Procedural Calligraphic Art Renderers
    // ==========================================

    renderBackground(ctx, camX, camY, screenW, screenH) {
        const lvl = this.getCurrentLevel();
        if (!lvl) return;
        const bg = lvl.backgroundStyle;

        // 1. Xuan Paper Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, screenH);
        skyGrad.addColorStop(0, bg.skyTop);
        skyGrad.addColorStop(1, bg.skyBottom);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, screenW, screenH);

        // Moon in Pagoda night level
        if (bg.moon) {
            ctx.save();
            const moonScreenX = bg.moon.x - camX * 0.05;
            const moonScreenY = bg.moon.y;
            
            // Moon halo
            const haloGrad = ctx.createRadialGradient(moonScreenX, moonScreenY, bg.moon.radius * 0.5, moonScreenX, moonScreenY, bg.moon.radius * 2.2);
            haloGrad.addColorStop(0, 'rgba(255, 252, 230, 0.45)');
            haloGrad.addColorStop(1, 'rgba(255, 250, 220, 0)');
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(moonScreenX, moonScreenY, bg.moon.radius * 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Moon body with ink wash craters
            ctx.fillStyle = '#f8f4dc';
            ctx.beginPath();
            ctx.arc(moonScreenX, moonScreenY, bg.moon.radius, 0, Math.PI * 2);
            ctx.fill();

            // Subtle ink crater wash (桂树兔影)
            ctx.fillStyle = 'rgba(180, 175, 150, 0.25)';
            ctx.beginPath();
            ctx.arc(moonScreenX - 12, moonScreenY - 10, bg.moon.radius * 0.45, 0, Math.PI * 2);
            ctx.arc(moonScreenX + 15, moonScreenY + 12, bg.moon.radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 2. Parallax Mountain Layers (远山如黛 · 墨分五色)
        this.renderMountainLayer(ctx, camX * 0.08, screenW, screenH, bg.mountainColor1, 260, 85, 0);
        this.renderMountainLayer(ctx, camX * 0.22, screenW, screenH, bg.mountainColor2, 200, 110, 42);
        this.renderMountainLayer(ctx, camX * 0.45, screenW, screenH, bg.mountainColor3, 140, 140, 99);

        // Wild geese flying in distance (大雁南飞)
        if (bg.hasGeese) {
            this.renderGeese(ctx, camX * 0.12, screenW);
        }
    }

    renderMountainLayer(ctx, offsetX, screenW, screenH, color, baseY, heightAmp, seed) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, screenH);

        const step = 45;
        const totalPoints = Math.ceil(screenW / step) + 3;
        const startIdx = Math.floor(offsetX / step);

        for (let i = -1; i <= totalPoints; i++) {
            const worldIdx = startIdx + i;
            const x = (worldIdx * step) - offsetX;
            // Smooth mountain ridges using multi-frequency sines
            const noise = Math.sin(worldIdx * 0.15 + seed) * heightAmp * 0.7 
                        + Math.cos(worldIdx * 0.06 + seed * 2) * heightAmp * 0.5;
            const y = screenH - baseY + noise;
            if (i === -1) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.lineTo(screenW, screenH);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    renderGeese(ctx, offsetX, screenW) {
        ctx.save();
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.4)';
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';

        const flockX = (screenW - (offsetX % (screenW + 300))) - 100;
        const flockY = 110;

        const geese = [
            { x: 0, y: 0 },
            { x: -22, y: 12 },
            { x: -44, y: 24 },
            { x: -26, y: -10 },
            { x: -50, y: -18 }
        ];

        for (const g of geese) {
            const gx = flockX + g.x;
            const gy = flockY + g.y;
            if (gx > -20 && gx < screenW + 20) {
                // V-shaped wing stroke
                ctx.beginPath();
                ctx.moveTo(gx - 6, gy + 3);
                ctx.quadraticCurveTo(gx - 3, gy - 2, gx, gy);
                ctx.quadraticCurveTo(gx + 3, gy - 2, gx + 6, gy + 3);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // Render water body for river level
    renderWater(ctx, camX, camY, screenW, screenH) {
        const lvl = this.getCurrentLevel();
        if (lvl.type !== 'river' || !lvl.waterY) return;

        const screenWaterY = lvl.waterY - camY;
        if (screenWaterY > screenH) return;

        ctx.save();
        // Emerald/ink water gradient
        const waterGrad = ctx.createLinearGradient(0, screenWaterY, 0, screenH);
        waterGrad.addColorStop(0, 'rgba(68, 102, 105, 0.82)');
        waterGrad.addColorStop(0.3, 'rgba(45, 78, 80, 0.92)');
        waterGrad.addColorStop(1, 'rgba(25, 48, 50, 0.98)');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(0, screenWaterY, screenW, screenH - screenWaterY);

        // Water surface line with subtle waves
        ctx.strokeStyle = 'rgba(215, 235, 230, 0.65)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        const waveStep = 30;
        const time = Date.now() * 0.002;
        ctx.moveTo(0, screenWaterY);
        for (let x = 0; x <= screenW; x += waveStep) {
            const waveY = screenWaterY + Math.sin(x * 0.03 + time) * 2.5;
            ctx.lineTo(x, waveY);
        }
        ctx.stroke();

        // Subtle swimming Koi fish silhouettes in river depth
        const koiX = ((Date.now() * 0.02) % (lvl.width + 200)) - camX;
        const koiY = screenWaterY + 35;
        if (koiX > -40 && koiX < screenW + 40) {
            ctx.fillStyle = 'rgba(195, 65, 45, 0.45)'; // Vermilion koi
            ctx.beginPath();
            ctx.ellipse(koiX, koiY, 15, 6, 0.1, 0, Math.PI * 2);
            ctx.fill();
            // Tail fin
            ctx.beginPath();
            ctx.moveTo(koiX - 12, koiY);
            ctx.lineTo(koiX - 22, koiY - 5);
            ctx.lineTo(koiX - 20, koiY + 5);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    // Render all platforms in current level
    renderPlatforms(ctx, camX, camY) {
        const lvl = this.getCurrentLevel();
        if (!lvl) return;

        for (const p of lvl.platforms) {
            const rx = p.x - camX;
            const ry = (p.currentY !== undefined ? p.currentY : p.y) + (p.sinkDepth || 0) + (p.flex || 0) - camY;

            ctx.save();
            switch (p.type) {
                case 'roof':
                case 'pagoda_tile':
                    this.drawRoof(ctx, rx, ry, p.w, p.h, p.slope || 0, p.type === 'pagoda_tile');
                    break;
                case 'chimney':
                case 'pillar':
                    this.drawPillar(ctx, rx, ry, p.w, p.h);
                    break;
                case 'stone':
                    this.drawStone(ctx, rx, ry, p.w, p.h, p.style);
                    break;
                case 'lotus':
                    this.drawLotusPad(ctx, rx, ry, p.w, p.h);
                    break;
                case 'raft':
                    this.drawBambooRaft(ctx, rx, ry, p.w, p.h);
                    break;
                case 'pier':
                case 'bank':
                case 'cliff':
                    this.drawCliffOrBank(ctx, rx, ry, p.w, p.h, p.style);
                    break;
                case 'bamboo_spring':
                case 'bamboo_pole':
                    this.drawBambooSpring(ctx, rx, ry, p.w, p.h, p.flex || 0);
                    break;
                case 'pine_branch':
                    this.drawPineBranch(ctx, rx, ry, p.w, p.h);
                    break;
                case 'cloud':
                    this.drawCloud(ctx, rx, ry, p.w, p.h);
                    break;
                case 'lantern':
                    this.drawHangingLantern(ctx, rx, ry, p.w, p.h);
                    break;
                case 'sky_lantern':
                    this.drawSkyLantern(ctx, rx, ry, p.w, p.h);
                    break;
                case 'bell_tower':
                case 'pagoda_spire':
                    this.drawGrandBuilding(ctx, rx, ry, p.w, p.h, p.type);
                    break;
                case 'ink_bridge':
                    this.drawInkBridge(ctx, rx, ry, p.w, p.h, p);
                    break;
            }
            ctx.restore();
        }
    }

    // Traditional Ink Wash Bridge (泼墨水墨飞桥)
    drawInkBridge(ctx, x, y, w, h, p) {
        ctx.save();
        // Progress of brush stroke appear animation
        const elapsed = (performance.now() - (p.spawnTime || 0)) / 380;
        const progress = Math.min(1.0, Math.max(0.1, elapsed));
        const currentW = w * progress;

        // 1. Mist aura under the bridge
        ctx.fillStyle = 'rgba(235, 230, 220, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x + currentW * 0.5, y + h + 8, currentW * 0.45, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Main ink wood board
        ctx.fillStyle = '#222124'; // Deep charcoal ink
        ctx.strokeStyle = '#100f12';
        ctx.lineWidth = 1.8;
        
        ctx.beginPath();
        // Slightly curved organic calligraphic edges
        ctx.moveTo(x, y + 3);
        ctx.quadraticCurveTo(x + currentW * 0.5, y - 2, x + currentW, y + 3);
        ctx.lineTo(x + currentW - 2, y + h);
        ctx.quadraticCurveTo(x + currentW * 0.5, y + h + 2, x + 2, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3. Wooden grain plank lines
        ctx.strokeStyle = 'rgba(65, 62, 68, 0.65)';
        ctx.lineWidth = 1.2;
        const plankStep = 30;
        for (let px = x + 24; px < x + currentW - 10; px += plankStep) {
            ctx.beginPath();
            ctx.moveTo(px, y + 2);
            ctx.lineTo(px, y + h - 1);
            ctx.stroke();
        }

        // 4. Red Cinnabar Seal Stamps at bridge joints (朱砂固梁印)
        if (progress > 0.55) {
            const sealX = x + 10;
            const sealY = y + 4;
            ctx.fillStyle = 'rgba(184, 56, 40, 0.88)';
            ctx.fillRect(sealX, sealY, 11, 11);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px "Noto Serif SC", serif';
            ctx.fillText('稳', sealX + 2, sealY + 9);
        }

        // 5. Plum blossom paw marks on the bridge
        if (progress > 0.75) {
            ctx.fillStyle = 'rgba(215, 180, 110, 0.45)';
            for (let px = x + 40; px < x + currentW - 30; px += 55) {
                ctx.beginPath();
                ctx.arc(px, y + 7, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(px - 2.5, y + 4, 1.0, 0, Math.PI * 2);
                ctx.arc(px, y + 3, 1.0, 0, Math.PI * 2);
                ctx.arc(px + 2.5, y + 4, 1.0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    // Traditional Chinese Roof with Upturned Eaves (青瓦飞檐)
    drawRoof(ctx, x, y, w, h, slope, isPagoda = false) {
        ctx.save();

        // Building wall below roof
        ctx.fillStyle = '#e4dfd3'; // Whitewashed plaster wall (白粉墙)
        ctx.strokeStyle = '#2b2a28';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.rect(x + 15, y + 18, w - 30, h - 18);
        ctx.fill();
        ctx.stroke();

        // Ink wash wooden window grille (花窗)
        if (w > 120 && h > 80) {
            ctx.strokeStyle = '#5a524a';
            ctx.lineWidth = 1.5;
            const winW = 34;
            const winH = 44;
            const winX = x + w * 0.5 - winW * 0.5;
            const winY = y + 45;
            ctx.strokeRect(winX, winY, winW, winH);
            // Diamond lattice
            ctx.beginPath();
            ctx.moveTo(winX + winW * 0.5, winY);
            ctx.lineTo(winX + winW, winY + winH * 0.5);
            ctx.lineTo(winX + winW * 0.5, winY + winH);
            ctx.lineTo(winX, winY + winH * 0.5);
            ctx.closePath();
            ctx.stroke();
        }

        // Upturned eave line (飞檐)
        const leftEaveTip = y - 10 + (slope < 0 ? -15 : 0);
        const rightEaveTip = y - 10 + (slope > 0 ? -15 : 0);

        ctx.fillStyle = '#26292b'; // Pitch black slate tile
        ctx.strokeStyle = '#181a1b';
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        // Roof top curve
        ctx.moveTo(x - 14, leftEaveTip);
        ctx.quadraticCurveTo(x + w * 0.5, y + 8, x + w + 14, rightEaveTip);
        // Roof lower thickness
        ctx.lineTo(x + w + 12, rightEaveTip + 16);
        ctx.quadraticCurveTo(x + w * 0.5, y + 24, x - 12, leftEaveTip + 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Scalloped tile ridges (瓦垄笔纹)
        ctx.strokeStyle = 'rgba(75, 80, 85, 0.7)';
        ctx.lineWidth = 1.2;
        const ridges = Math.floor(w / 18);
        for (let i = 1; i < ridges; i++) {
            const rx = x + i * 18;
            ctx.beginPath();
            ctx.moveTo(rx, y + 8);
            ctx.lineTo(rx, y + 20);
            ctx.stroke();
        }

        // Hanging red tassel or wind chime under eave tip
        ctx.strokeStyle = 'rgba(180, 50, 40, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 12, leftEaveTip + 16);
        ctx.lineTo(x - 14, leftEaveTip + 28);
        ctx.moveTo(x + w + 12, rightEaveTip + 16);
        ctx.lineTo(x + w + 14, rightEaveTip + 28);
        ctx.stroke();

        ctx.restore();
    }

    // River stepping stone (乱石汀步) with Cun fa (皴法) rock texture
    drawStone(ctx, x, y, w, h, style) {
        ctx.save();
        ctx.fillStyle = style === 'moss' ? '#4a574a' : '#54585c';
        ctx.strokeStyle = '#222527';
        ctx.lineWidth = 2.2;

        ctx.beginPath();
        ctx.moveTo(x + 8, y + 5);
        ctx.quadraticCurveTo(x + w * 0.5, y - 6, x + w - 8, y + 4);
        ctx.quadraticCurveTo(x + w + 6, y + h * 0.4, x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.quadraticCurveTo(x - 6, y + h * 0.4, x + 8, y + 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Axe-cut brush strokes (斧劈皴)
        ctx.strokeStyle = 'rgba(30, 32, 35, 0.6)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x + 15, y + 10);
        ctx.lineTo(x + 28, y + 24);
        ctx.moveTo(x + w - 25, y + 12);
        ctx.lineTo(x + w - 15, y + 30);
        ctx.stroke();

        // Moss green accent on top
        if (style === 'moss') {
            ctx.fillStyle = 'rgba(85, 125, 80, 0.55)';
            ctx.beginPath();
            ctx.ellipse(x + w * 0.5, y + 4, w * 0.4, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // Giant Floating Lotus Pad (碧荷浮萍)
    drawLotusPad(ctx, x, y, w, h) {
        ctx.save();
        // Emerald green ink wash
        ctx.fillStyle = '#3f6c56';
        ctx.strokeStyle = '#1d3b2c';
        ctx.lineWidth = 2.0;

        // Circular lotus pad with traditional notch (荷叶缺角)
        ctx.beginPath();
        ctx.ellipse(x + w * 0.5, y + 10, w * 0.5, 9, 0, 0.15, Math.PI * 1.85);
        ctx.lineTo(x + w * 0.5, y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Radiating leaf veins (荷叶脉络)
        ctx.strokeStyle = 'rgba(95, 155, 125, 0.65)';
        ctx.lineWidth = 1.0;
        const centerX = x + w * 0.5;
        const centerY = y + 10;
        for (let angle = 0.3; angle < Math.PI * 1.8; angle += 0.45) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * (w * 0.42), centerY + Math.sin(angle) * 7.5);
            ctx.stroke();
        }

        // Dewdrop on lotus pad (叶面朝露)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(centerX + 6, centerY - 2, 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Drifting Bamboo Raft (青竹浮排)
    drawBambooRaft(ctx, x, y, w, h) {
        ctx.save();
        ctx.strokeStyle = '#1c2e22';
        ctx.lineWidth = 1.6;

        // Number of lashed bamboo stalks
        const stalks = 6;
        const stalkW = w / stalks;
        for (let i = 0; i < stalks; i++) {
            const bx = x + i * stalkW;
            ctx.fillStyle = i % 2 === 0 ? '#54755a' : '#47674d';
            ctx.beginPath();
            ctx.roundRect(bx + 1, y, stalkW - 2, 14, 4);
            ctx.fill();
            ctx.stroke();

            // Bamboo joints (竹节)
            ctx.fillStyle = '#223828';
            ctx.fillRect(bx + 1, y + 4, stalkW - 2, 2);
            ctx.fillRect(bx + 1, y + 10, stalkW - 2, 2);
        }

        // Hemp rope lashing (麻绳捆扎)
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x + 5, y + 3);
        ctx.lineTo(x + w - 5, y + 3);
        ctx.moveTo(x + 5, y + 11);
        ctx.lineTo(x + w - 5, y + 11);
        ctx.stroke();

        ctx.restore();
    }

    // Springy Bamboo Bough (弹跳竹枝)
    drawBambooSpring(ctx, x, y, w, h, flex) {
        ctx.save();
        ctx.fillStyle = '#4b7050';
        ctx.strokeStyle = '#233d27';
        ctx.lineWidth = 2.2;

        // Bending arc
        const midY = y + flex * 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + w * 0.5, midY + 4, x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.quadraticCurveTo(x + w * 0.5, midY + h + 4, x, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Stalk joints
        ctx.strokeStyle = '#1d3221';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.35, y);
        ctx.lineTo(x + w * 0.35, y + h);
        ctx.moveTo(x + w * 0.7, y);
        ctx.lineTo(x + w * 0.7, y + h);
        ctx.stroke();

        // Clustered fresh bamboo leaves shooting out
        ctx.fillStyle = '#395e3e';
        this.drawLeaf(ctx, x + w + 6, y - 2, 18, 0.4);
        this.drawLeaf(ctx, x + w + 12, y + 4, 16, 0.1);
        this.drawLeaf(ctx, x + w + 8, y + 10, 15, -0.3);

        ctx.restore();
    }

    drawLeaf(ctx, lx, ly, len, angle) {
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(-len * 0.5, 0);
        ctx.quadraticCurveTo(0, -3.5, len * 0.5, 0);
        ctx.quadraticCurveTo(0, 3.5, -len * 0.5, 0);
        ctx.fill();
        ctx.restore();
    }

    // Sturdy Pine Branch (苍松虬枝)
    drawPineBranch(ctx, x, y, w, h) {
        ctx.save();
        // Twisted bark (古松干)
        ctx.fillStyle = '#443a32';
        ctx.strokeStyle = '#221a15';
        ctx.lineWidth = 2.4;

        ctx.beginPath();
        ctx.moveTo(x, y + 4);
        ctx.quadraticCurveTo(x + w * 0.5, y - 4, x + w, y + 2);
        ctx.lineTo(x + w, y + h);
        ctx.quadraticCurveTo(x + w * 0.5, y + h + 4, x, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pine needle clusters (松针点苔 / 扇形针叶)
        ctx.strokeStyle = '#2e4734';
        ctx.lineWidth = 1.4;
        const clusters = [x + 20, x + w * 0.5, x + w - 20];
        for (const cx of clusters) {
            for (let a = -Math.PI * 0.8; a <= -Math.PI * 0.2; a += 0.22) {
                ctx.beginPath();
                ctx.moveTo(cx, y + 2);
                ctx.lineTo(cx + Math.cos(a) * 16, y + 2 + Math.sin(a) * 16);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // Soft Mist Cloud Platform (流云借力)
    drawCloud(ctx, x, y, w, h) {
        ctx.save();
        ctx.fillStyle = 'rgba(240, 243, 245, 0.82)';
        ctx.strokeStyle = 'rgba(160, 175, 185, 0.7)';
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        const r = h * 0.8;
        ctx.arc(x + 18, y + 8, r, Math.PI * 0.5, Math.PI * 1.5);
        ctx.arc(x + w * 0.35, y - 2, r * 1.3, Math.PI * 0.9, Math.PI * 2.1);
        ctx.arc(x + w * 0.7, y - 1, r * 1.1, Math.PI * 0.8, Math.PI * 2.0);
        ctx.arc(x + w - 18, y + 8, r, Math.PI * 1.5, Math.PI * 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    // Floating Sky Lantern (孔明灯)
    drawSkyLantern(ctx, x, y, w, h) {
        ctx.save();
        const cx = x + w * 0.5;
        const cy = y + h * 0.5;

        // Lantern body glowing warm vermilion/amber
        const glowGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 28);
        glowGrad.addColorStop(0, 'rgba(255, 230, 140, 0.95)');
        glowGrad.addColorStop(0.5, 'rgba(220, 110, 45, 0.85)');
        glowGrad.addColorStop(1, 'rgba(160, 40, 30, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.fill();

        // Paper frame
        ctx.fillStyle = 'rgba(240, 180, 80, 0.88)';
        ctx.strokeStyle = '#5a1c12';
        ctx.lineWidth = 1.6;

        ctx.beginPath();
        ctx.moveTo(cx - 16, cy + 12);
        ctx.quadraticCurveTo(cx - 22, cy - 14, cx, cy - 20);
        ctx.quadraticCurveTo(cx + 22, cy - 14, cx + 16, cy + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Wooden bottom rim (platform top where cat lands)
        ctx.fillStyle = '#3a1b12';
        ctx.fillRect(x, y + 8, w, 6);

        ctx.restore();
    }

    // Hanging paper lantern under eaves
    drawHangingLantern(ctx, x, y, w, h) {
        ctx.save();
        const cx = x + w * 0.5;
        const cy = y + h * 0.5;

        // Warm radial glow
        const glowGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 26);
        glowGrad.addColorStop(0, 'rgba(255, 220, 120, 0.85)');
        glowGrad.addColorStop(0.6, 'rgba(200, 60, 40, 0.5)');
        glowGrad.addColorStop(1, 'rgba(200, 60, 40, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fill();

        // Red lantern body
        ctx.fillStyle = '#b23528'; // 朱砂红
        ctx.strokeStyle = '#4a1510';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 15, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Vertical ribbed lines
        ctx.strokeStyle = 'rgba(80, 15, 10, 0.7)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 7, 18, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Golden tassel
        ctx.strokeStyle = '#dfa538';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 18);
        ctx.lineTo(cx, cy + 32);
        ctx.stroke();

        ctx.restore();
    }

    // Wooden pillar or chimney
    drawPillar(ctx, x, y, w, h) {
        ctx.save();
        ctx.fillStyle = '#42372f';
        ctx.strokeStyle = '#1e1814';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.fill();
        ctx.stroke();

        // Top landing cap
        ctx.fillStyle = '#2e2620';
        ctx.fillRect(x - 3, y - 4, w + 6, 6);
        ctx.strokeRect(x - 3, y - 4, w + 6, 6);

        ctx.restore();
    }

    // Cliff or Riverbank
    drawCliffOrBank(ctx, x, y, w, h, style) {
        ctx.save();
        ctx.fillStyle = style === 'grass' ? '#5a6d54' : '#454a4f';
        ctx.strokeStyle = '#222629';
        ctx.lineWidth = 2.2;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Grassy / mossy tufts on edge
        ctx.strokeStyle = '#2d452b';
        ctx.lineWidth = 1.5;
        for (let gx = x + 10; gx < x + w - 10; gx += 16) {
            ctx.beginPath();
            ctx.moveTo(gx, y);
            ctx.lineTo(gx - 3, y - 6);
            ctx.moveTo(gx, y);
            ctx.lineTo(gx + 3, y - 7);
            ctx.stroke();
        }

        ctx.restore();
    }

    // Grand building / Bell tower / Pagoda Spire
    drawGrandBuilding(ctx, x, y, w, h, type) {
        ctx.save();
        this.drawRoof(ctx, x, y, w, h, 0, true);

        // Calligraphic Goal Pavilion / Pagoda Spire
        const midX = x + w * 0.5;
        ctx.fillStyle = '#26292b';
        ctx.strokeStyle = '#181a1b';
        ctx.lineWidth = 2.0;

        // Second tiered upper roof
        ctx.beginPath();
        ctx.moveTo(midX - 70, y - 45);
        ctx.quadraticCurveTo(midX, y - 35, midX + 70, y - 45);
        ctx.lineTo(midX + 55, y - 28);
        ctx.lineTo(midX - 55, y - 28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Finial / Bronze spire tip (宝顶)
        ctx.fillStyle = '#d4af37'; // Golden bronze
        ctx.beginPath();
        ctx.moveTo(midX, y - 85);
        ctx.lineTo(midX - 8, y - 45);
        ctx.lineTo(midX + 8, y - 45);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    // Render Collectibles (墨滴 / 小鱼干)
    renderCollectibles(ctx, camX, camY) {
        const lvl = this.getCurrentLevel();
        if (!lvl) return;

        const time = Date.now() * 0.004;

        for (const item of lvl.collectibles) {
            if (item.collected) continue;

            const rx = item.x - camX;
            const floatY = item.y + Math.sin(time + item.x) * 4 - camY;

            ctx.save();
            if (item.type === 'fish') {
                // Golden Dried Fish Treat (金黄小鱼干)
                ctx.translate(rx, floatY);
                ctx.rotate(Math.sin(time * 0.7) * 0.15);

                // Glow
                ctx.fillStyle = 'rgba(235, 185, 75, 0.35)';
                ctx.beginPath();
                ctx.arc(0, 0, 16, 0, Math.PI * 2);
                ctx.fill();

                // Fish body
                ctx.fillStyle = '#d49b38';
                ctx.strokeStyle = '#4e3310';
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Fish tail
                ctx.beginPath();
                ctx.moveTo(-9, 0);
                ctx.lineTo(-17, -6);
                ctx.lineTo(-15, 0);
                ctx.lineTo(-17, 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Eye
                ctx.fillStyle = '#111';
                ctx.beginPath();
                ctx.arc(6, -1.5, 1.2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Ink Droplet (水墨宝滴)
                ctx.translate(rx, floatY);

                // Soft ink aura
                ctx.fillStyle = 'rgba(30, 30, 30, 0.25)';
                ctx.beginPath();
                ctx.arc(0, 0, 15, 0, Math.PI * 2);
                ctx.fill();

                // Tear drop ink shape
                ctx.fillStyle = '#1c1c1f';
                ctx.strokeStyle = '#0e0e11';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, -9);
                ctx.quadraticCurveTo(8, 0, 6, 6);
                ctx.arc(0, 6, 6, 0, Math.PI);
                ctx.quadraticCurveTo(-8, 0, 0, -9);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // White light glint
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(-2, 4, 1.6, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // Render Level Goal Banner / Portal (终点目标标志)
    renderGoal(ctx, camX, camY) {
        const lvl = this.getCurrentLevel();
        if (!lvl || !lvl.goal) return;

        const g = lvl.goal;
        const rx = g.x - camX;
        const ry = g.y - camY;

        ctx.save();
        // Cinnabar Red Seal Stamp Banner (朱砂红印章旗)
        const time = Date.now() * 0.003;
        const bannerWave = Math.sin(time) * 3;

        ctx.fillStyle = 'rgba(180, 42, 30, 0.9)'; // Cinnabar red
        ctx.strokeStyle = '#3d100c';
        ctx.lineWidth = 2.0;

        // Flag body
        ctx.beginPath();
        ctx.moveTo(rx, ry - 70);
        ctx.lineTo(rx + 55 + bannerWave, ry - 70);
        ctx.lineTo(rx + 45 + bannerWave, ry - 35);
        ctx.lineTo(rx + 55 + bannerWave, ry);
        ctx.lineTo(rx, ry);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Flagpole
        ctx.strokeStyle = '#2b2118';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        ctx.moveTo(rx, ry - 75);
        ctx.lineTo(rx, ry + 15);
        ctx.stroke();

        // Calligraphy Text on Banner
        ctx.fillStyle = '#f9f6ef';
        ctx.font = 'bold 15px "PingFang SC", "Songti SC", "SimSun", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(g.text.charAt(0) + g.text.charAt(1), rx + 26, ry - 48);
        ctx.fillText(g.text.charAt(2) + g.text.charAt(3), rx + 26, ry - 24);

        ctx.restore();
    }
}

window.LevelManager = LevelManager;
