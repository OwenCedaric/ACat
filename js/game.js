/**
 * Ink Cat Web Game - Main Game Loop & Interaction Controller
 * (水墨猫咪跃尘 · 核心游戏引擎与触控交互)
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.particles = new ParticleSystem();
        this.levelManager = new LevelManager();
        this.cat = new InkCat(80, 400);
        this.camera = new Camera(window.innerWidth, window.innerHeight);

        // Game states: 'start', 'playing', 'paused', 'victory', 'gameover'
        this.state = 'start';
        this.score = 0;
        this.collectedFish = 0;
        this.collectedInk = 0;
        this.totalFish = 0;
        this.totalInk = 0;
        this.levelStartTime = 0;
        this.elapsedTime = 0;

        // Gameplay mechanics & power-ups (九命灵猫护体 & 泼墨成桥)
        this.lives = 0;
        this.bridgeCount = 0;
        this.lastSafeSpot = null;

        // Input state (unified pointer & keyboard)
        this.keys = {};
        this.touchMoveDir = 0;
        this.pointerStartX = 0;
        this.pointerStartY = 0;
        this.pointerCurrentX = 0;
        this.pointerCurrentY = 0;
        this.isPointerDown = false;
        this.hasDraggedToAim = false;

        // Performance / Frame loop
        this.lastTime = performance.now();
        this.rafId = null;

        // Sound state
        this.soundMuted = false;

        // Local persistent save data (progress, unlocked levels, records)
        this.saveData = this.loadRecords();

        this.init();
        this.initServiceWorker();
        this.initPwaInstall();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 150));

        this.setupKeyboardInput();
        this.setupTouchInput();
        this.setupUIEvents();

        // Restore sound setting
        try {
            const savedMute = localStorage.getItem('ink_cat_sound_muted');
            if (savedMute === 'true' && window.soundManager) {
                this.soundMuted = window.soundManager.toggleMute();
                const soundText = document.getElementById('soundText');
                if (soundText) soundText.textContent = '静音';
            }
        } catch (e) {}

        // Load level 0
        this.loadLevel(0);

        // Start render loop
        this.loop = this.loop.bind(this);
        this.rafId = requestAnimationFrame(this.loop);
    }

    loadRecords() {
        try {
            const data = localStorage.getItem('ink_cat_records');
            const defaultData = {
                unlockedLevels: [1],
                records: {},
                totalFish: 0,
                totalInk: 0
            };
            if (!data) return defaultData;
            const parsed = JSON.parse(data);

            // Handle legacy format where root object was directly the records dictionary: { "1": { stars: 3, bestTime: 23.4 } }
            if (parsed && typeof parsed === 'object') {
                if (!parsed.records && (parsed['1'] || parsed['2'] || parsed['3'] || parsed['4'])) {
                    const legacyRecords = {};
                    const unlocked = [1];
                    for (const k in parsed) {
                        if (parsed[k] && typeof parsed[k] === 'object' && parsed[k].stars !== undefined) {
                            legacyRecords[k] = parsed[k];
                            const numK = parseInt(k, 10);
                            if (!unlocked.includes(numK)) unlocked.push(numK);
                            if (!unlocked.includes(numK + 1) && numK < 4) unlocked.push(numK + 1);
                        }
                    }
                    const migrated = {
                        unlockedLevels: unlocked,
                        records: legacyRecords,
                        totalFish: 0,
                        totalInk: 0
                    };
                    localStorage.setItem('ink_cat_records', JSON.stringify(migrated));
                    return migrated;
                }
            }

            if (!parsed.unlockedLevels || !Array.isArray(parsed.unlockedLevels)) {
                parsed.unlockedLevels = [1];
            }
            if (!parsed.records) parsed.records = {};
            return parsed;
        } catch (e) {
            return { unlockedLevels: [1], records: {}, totalFish: 0, totalInk: 0 };
        }
    }

    saveRecords(lvlId, stars, time) {
        try {
            // Unlock next level upon beating current level
            const nextLvlId = lvlId + 1;
            if (!this.saveData.unlockedLevels.includes(nextLvlId) && nextLvlId <= this.levelManager.levels.length) {
                this.saveData.unlockedLevels.push(nextLvlId);
            }

            const existing = this.saveData.records[lvlId];
            if (!existing || stars > existing.stars || (stars === existing.stars && time < existing.bestTime)) {
                this.saveData.records[lvlId] = {
                    stars: Math.max(existing ? existing.stars : 0, stars),
                    bestTime: existing && existing.bestTime ? Math.min(existing.bestTime, time) : time,
                    fish: this.collectedFish,
                    ink: this.collectedInk
                };
            }

            this.saveData.totalFish = (this.saveData.totalFish || 0) + this.collectedFish;
            this.saveData.totalInk = (this.saveData.totalInk || 0) + this.collectedInk;

            localStorage.setItem('ink_cat_records', JSON.stringify(this.saveData));
        } catch (e) {}
    }

    resetProgress() {
        try {
            localStorage.removeItem('ink_cat_records');
            this.saveData = { unlockedLevels: [1], records: {}, totalFish: 0, totalInk: 0 };
            this.showLevelSelect();
        } catch (e) {}
    }

    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((reg) => {
                        console.log('[PWA] 离线服务已就绪，缓存已生效');
                    })
                    .catch((err) => {
                        console.warn('[PWA] 服务注册异常', err);
                    });
            });
        }
    }

    initPwaInstall() {
        let deferredPrompt = null;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            const installBtns = document.querySelectorAll('.btn-pwa-install');
            installBtns.forEach(btn => {
                btn.style.display = 'inline-flex';
                btn.onclick = async () => {
                    if (deferredPrompt) {
                        deferredPrompt.prompt();
                        const { outcome } = await deferredPrompt.userChoice;
                        if (outcome === 'accepted') {
                            installBtns.forEach(b => b.style.display = 'none');
                        }
                        deferredPrompt = null;
                    }
                };
            });
        });

        // Click handler for iOS or browsers without beforeinstallprompt
        const installBtns = document.querySelectorAll('.btn-pwa-install');
        installBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!deferredPrompt) {
                    alert('在 Safari 或移动浏览器中轻触【分享】或【菜单】图标，选择【添加到主屏幕】，即可像本地应用一样全屏离线游玩！');
                }
            });
        });
    }

    resize() {
        this.dpr = Math.min(window.devicePixelRatio || 1, 2.0); // Cap at 2x for smooth 60fps
        const w = window.innerWidth;
        const h = window.innerHeight;

        this.canvas.width = Math.floor(w * this.dpr);
        this.canvas.height = Math.floor(h * this.dpr);
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';

        this.displayWidth = w;
        this.displayHeight = h;
        this.camera.resize(w, h);
    }

    loadLevel(index) {
        const lvl = this.levelManager.setLevel(index);
        if (!lvl) return;

        this.cat.reset(lvl.startX, lvl.startY);
        this.camera.x = 0;
        this.camera.y = 0;
        this.particles.reset();
        this.particles.initAmbient(lvl.type, this.displayWidth, this.displayHeight);

        this.collectedFish = 0;
        this.collectedInk = 0;
        this.lives = 0;
        this.bridgeCount = 0;
        this.lastSafeSpot = { x: lvl.startX, y: lvl.startY };
        this.totalFish = lvl.collectibles.filter(c => c.type === 'fish').length;
        this.totalInk = lvl.collectibles.filter(c => c.type === 'ink').length;
        this.levelStartTime = performance.now();
        this.elapsedTime = 0;

        // Update Level Title HUD
        const titleEl = document.getElementById('levelTitleHud');
        if (titleEl) {
            titleEl.textContent = lvl.name;
        }

        this.updateHUD();
    }

    restartLevel() {
        this.loadLevel(this.levelManager.currentLevelIndex);
        this.state = 'playing';
        this.hideModals();
    }

    startNewGame(levelIndex = 0) {
        if (window.soundManager) window.soundManager.resume();
        this.loadLevel(levelIndex);
        this.state = 'playing';
        this.hideModals();
    }

    nextLevel() {
        if (this.levelManager.currentLevelIndex < this.levelManager.levels.length - 1) {
            this.loadLevel(this.levelManager.currentLevelIndex + 1);
            this.state = 'playing';
            this.hideModals();
        } else {
            // All levels finished! Back to select
            this.showLevelSelect();
        }
    }

    // ==========================================
    // Inputs (Keyboard, Touch Gestures & Virtual HUD)
    // ==========================================

    setupKeyboardInput() {
        window.addEventListener('keydown', (e) => {
            if (window.soundManager) window.soundManager.resume();

            if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys['left'] = true;
            } else if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys['right'] = true;
            } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                if (!this.keys['jump']) {
                    this.keys['jump'] = true;
                    if (this.state === 'playing') {
                        this.cat.jump(this.particles);
                    }
                }
                e.preventDefault();
            } else if (e.key === 'b' || e.key === 'B' || e.key === 'e' || e.key === 'E') {
                this.spawnInkBridge();
                e.preventDefault();
            } else if (e.key === 'r' || e.key === 'R') {
                this.restartLevel();
            } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
                this.togglePause();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.keys['left'] = false;
            } else if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.keys['right'] = false;
            } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                this.keys['jump'] = false;
                this.cat.setJumpHeld(false);
            }
        });
    }

    setupTouchInput() {
        const c = this.canvas;

        // Unified Canvas Pointer Handling (Mouse, Pen & Touch)
        const getPointerPos = (e) => {
            const rect = c.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        c.addEventListener('pointerdown', (e) => {
            if (this.state !== 'playing') return;
            if (window.soundManager) window.soundManager.resume();
            if (e.target !== c) return;

            const pos = getPointerPos(e);
            this.pointerStartX = pos.x;
            this.pointerStartY = pos.y;
            this.pointerCurrentX = pos.x;
            this.pointerCurrentY = pos.y;
            this.isPointerDown = true;
            this.hasDraggedToAim = false;

            if (c.setPointerCapture) {
                try { c.setPointerCapture(e.pointerId); } catch (err) {}
            }
            e.preventDefault();
        });

        c.addEventListener('pointermove', (e) => {
            if (!this.isPointerDown || this.state !== 'playing') return;
            const pos = getPointerPos(e);
            this.pointerCurrentX = pos.x;
            this.pointerCurrentY = pos.y;

            // Slingshot pull calculation (向后下方拉动，向前上方弹射)
            const dx = this.pointerStartX - pos.x;
            const dy = this.pointerStartY - pos.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 14) {
                this.hasDraggedToAim = true;
                let angle = Math.atan2(dy, dx);
                // Ensure launch angle is directed upward into the sky
                if (angle > -0.15 && angle <= Math.PI * 0.5) {
                    angle = -0.15;
                } else if (angle > Math.PI * 0.5) {
                    angle = -Math.PI + 0.15;
                }

                const powerRatio = Math.min(1.0, Math.max(0.35, dist / 115));
                this.cat.updateAim(angle, powerRatio);
                this.cat.facing = dx >= 0 ? 1 : -1;
            }
            e.preventDefault();
        });

        const handlePointerEnd = (e) => {
            if (!this.isPointerDown || this.state !== 'playing') return;
            this.isPointerDown = false;
            if (c.releasePointerCapture) {
                try { c.releasePointerCapture(e.pointerId); } catch (err) {}
            }

            if (this.hasDraggedToAim && this.cat.isAiming) {
                // Fling along calculated ink trajectory!
                this.cat.fling(this.cat.aimAngle, this.cat.aimPower, this.particles);
            } else {
                // Quick tap jump / double jump
                this.cat.jump(this.particles);
                this.cat.setJumpHeld(false);
            }

            this.cat.stopAim();
            this.hasDraggedToAim = false;
            e.preventDefault();
        };

        c.addEventListener('pointerup', handlePointerEnd);
        c.addEventListener('pointercancel', handlePointerEnd);

        // Virtual On-Screen Buttons (for Mobile / Tablet)
        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');
        const btnCharge = document.getElementById('btnCharge');
        const btnJump = document.getElementById('btnJump');
        const btnTouchBridge = document.getElementById('btnTouchBridge');
        const btnBridgeSkill = document.getElementById('btnBridgeSkill');

        const bindButton = (el, onStart, onEnd) => {
            if (!el) return;
            el.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (window.soundManager) window.soundManager.resume();
                onStart();
            }, { passive: false });
            el.addEventListener('touchend', (e) => {
                e.stopPropagation();
                e.preventDefault();
                onEnd();
            }, { passive: false });
            el.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                if (window.soundManager) window.soundManager.resume();
                onStart();
            });
            el.addEventListener('mouseup', (e) => {
                e.stopPropagation();
                onEnd();
            });
            el.addEventListener('mouseleave', () => onEnd());
        };

        bindButton(btnLeft, () => { this.touchMoveDir = -1; }, () => { if (this.touchMoveDir === -1) this.touchMoveDir = 0; });
        bindButton(btnRight, () => { this.touchMoveDir = 1; }, () => { if (this.touchMoveDir === 1) this.touchMoveDir = 0; });

        // Primary Jump Button 【起跳】：Instant jump on touch + hold for higher float!
        bindButton(btnCharge, () => {
            if (this.state !== 'playing') return;
            this.cat.jump(this.particles);
            this.cat.setJumpHeld(true);
        }, () => {
            this.cat.setJumpHeld(false);
        });

        // Double Jump Button 【踏墨二段】：Direct double jump in air!
        if (btnJump) {
            bindButton(btnJump, () => {
                if (this.state !== 'playing') return;
                this.cat.performDoubleJump(this.particles);
                this.cat.setJumpHeld(true);
            }, () => {
                this.cat.setJumpHeld(false);
            });
        }

        // Ink Bridge Button 【墨桥】
        if (btnTouchBridge) {
            bindButton(btnTouchBridge, () => {
                this.spawnInkBridge();
            }, () => {});
        }

        if (btnBridgeSkill) {
            btnBridgeSkill.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.soundManager) window.soundManager.resume();
                this.spawnInkBridge();
            });
        }
    }

    setupUIEvents() {
        // Start Game button
        const btnStart = document.getElementById('btnStartGame');
        if (btnStart) {
            btnStart.addEventListener('click', () => {
                this.startNewGame(0);
            });
        }

        // Level Select button in menu
        const btnSelectLvl = document.getElementById('btnSelectLevel');
        if (btnSelectLvl) {
            btnSelectLvl.addEventListener('click', () => {
                this.showLevelSelect();
            });
        }

        // Sound Toggle
        const btnSound = document.getElementById('btnSound');
        const soundText = document.getElementById('soundText');
        const iconSound = document.getElementById('iconSound');
        if (btnSound) {
            btnSound.addEventListener('click', () => {
                if (window.soundManager) {
                    this.soundMuted = window.soundManager.toggleMute();
                    if (soundText) soundText.textContent = this.soundMuted ? '静音' : '雅乐';
                    if (iconSound) {
                        iconSound.innerHTML = this.soundMuted 
                            ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>'
                            : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
                    }
                }
            });
        }

        // Pause button
        const btnPause = document.getElementById('btnPause');
        if (btnPause) {
            btnPause.addEventListener('click', () => {
                this.togglePause();
            });
        }

        // Resume button in pause modal
        const btnResume = document.getElementById('btnResume');
        if (btnResume) {
            btnResume.addEventListener('click', () => {
                this.state = 'playing';
                this.hideModals();
            });
        }

        // Restart buttons
        document.querySelectorAll('.btn-restart').forEach(btn => {
            btn.addEventListener('click', () => this.restartLevel());
        });

        // Next Level button in victory modal
        const btnNext = document.getElementById('btnNextLevel');
        if (btnNext) {
            btnNext.addEventListener('click', () => this.nextLevel());
        }

        // Back to Menu button
        document.querySelectorAll('.btn-menu').forEach(btn => {
            btn.addEventListener('click', () => this.showStartScreen());
        });

        // Reset progress button
        const btnReset = document.getElementById('btnResetProgress');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (confirm('是否确认重新封卷？这将清空本地所有关卡解锁进度与评级记录。')) {
                    this.resetProgress();
                }
            });
        }

        // Cat Meow click
        const catAvatar = document.getElementById('hudCatAvatar');
        if (catAvatar) {
            catAvatar.addEventListener('click', () => {
                if (window.soundManager) window.soundManager.playMeow();
            });
        }
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            document.getElementById('pauseModal').classList.remove('hidden');
        } else if (this.state === 'paused') {
            this.state = 'playing';
            document.getElementById('pauseModal').classList.add('hidden');
        }
    }

    showStartScreen() {
        this.state = 'start';
        this.hideModals();
        document.getElementById('startScreen').classList.remove('hidden');
    }

    showLevelSelect() {
        this.state = 'select';
        this.hideModals();
        const modal = document.getElementById('levelSelectModal');
        modal.classList.remove('hidden');

        // Populate level cards
        const container = document.getElementById('levelGrid');
        container.innerHTML = '';

        this.levelManager.levels.forEach((lvl, idx) => {
            const card = document.createElement('div');
            const isUnlocked = this.saveData.unlockedLevels.includes(lvl.id);
            card.className = isUnlocked ? 'level-card' : 'level-card locked';
            const rec = this.saveData.records[lvl.id] || { stars: 0, bestTime: null };
            
            const starTexts = ['尚未涉足', '一品达成', '二品达成', '三品圆满'];
            const starHtml = isUnlocked ? (starTexts[rec.stars] || '尚未涉足') : '封锁 · 待通前卷';

            card.innerHTML = `
                <div class="card-stamp">${isUnlocked ? lvl.id : '锁'}</div>
                <div class="card-title">${lvl.name}</div>
                <div class="card-subtitle">${lvl.subtitle}</div>
                <div class="card-stars">${starHtml}</div>
                ${rec.bestTime ? `<div class="card-time">最快: ${rec.bestTime.toFixed(1)}秒</div>` : ''}
                <button class="btn-card-play"${isUnlocked ? '' : ' disabled'}>${isUnlocked ? '启程' : '未解锁'}</button>
            `;

            if (isUnlocked) {
                card.querySelector('.btn-card-play').addEventListener('click', () => {
                    this.startNewGame(idx);
                });
            }

            container.appendChild(card);
        });
    }

    hideModals() {
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('pauseModal').classList.add('hidden');
        document.getElementById('victoryModal').classList.add('hidden');
        document.getElementById('defeatModal').classList.add('hidden');
        document.getElementById('levelSelectModal').classList.add('hidden');
    }

    // ==========================================
    // Game Physics & Collisions
    // ==========================================

    update() {
        if (this.state !== 'playing') {
            // Keep background particles moving even when in start/select
            const lvl = this.levelManager.getCurrentLevel();
            this.particles.update(lvl ? lvl.type : 'rooftop', this.displayWidth, this.displayHeight);
            return;
        }

        this.elapsedTime = (performance.now() - this.levelStartTime) / 1000;
        this.updateHUD();

        // 1. Process movement inputs
        let moveDir = 0;
        if (this.keys['left'] || this.touchMoveDir === -1) moveDir -= 1;
        if (this.keys['right'] || this.touchMoveDir === 1) moveDir += 1;
        this.cat.move(moveDir);

        // 2. Update dynamic platforms (moving rafts, floating lilies)
        this.levelManager.updatePlatforms();

        // 3. Cat physics integration
        this.cat.update(this.particles);

        // 4. Platform Collision Detection
        this.checkPlatformCollisions();

        // 5. Collectibles Detection
        this.checkCollectibles();

        // 6. Goal / Victory Detection
        this.checkGoal();

        // 7. Death / Fall Detection
        this.checkDeath();

        // 8. Update Camera
        const lvl = this.levelManager.getCurrentLevel();
        this.camera.update(this.cat, lvl.width, lvl.height);

        // 9. Particles Update
        this.particles.update(lvl.type, this.displayWidth, this.displayHeight, this.camera.x);
    }

    checkPlatformCollisions() {
        const lvl = this.levelManager.getCurrentLevel();
        if (!lvl || !this.cat.isAlive) return;

        let landedOnAny = false;
        const catFeetX = this.cat.x;
        const catFeetY = this.cat.y + this.cat.height * 0.5;
        const catPrevFeetY = catFeetY - this.cat.vy;

        for (const p of lvl.platforms) {
            const py = (p.currentY !== undefined ? p.currentY : p.y) + (p.sinkDepth || 0) + (p.flex || 0);
            
            // Check horizontal overlap
            const margin = 10;
            if (catFeetX >= p.x - margin && catFeetX <= p.x + p.w + margin) {
                // Cat must be moving downward and cross the platform top
                if (this.cat.vy >= 0 && catPrevFeetY <= py + 16 && catFeetY >= py - 6) {
                    landedOnAny = true;

                    // Handle interactive bounce / flex
                    if (p.bounce) {
                        const bouncePower = p.bounce;
                        this.cat.vy = -12.5 * bouncePower;
                        this.cat.isGrounded = false;
                        this.cat.hasDoubleJumped = false;
                        this.cat.scaleX = 0.6;
                        this.cat.scaleY = 1.45;
                        this.camera.shake(6, 10);

                        if (p.flex !== undefined) {
                            p.flex = 22; // Bamboo bends deep
                        }

                        if (window.soundManager) {
                            if (p.type === 'bamboo_spring') {
                                window.soundManager.playBambooSnap();
                            } else {
                                window.soundManager.playJump(1.2);
                            }
                        }

                        this.particles.createInkSplatter(this.cat.x, py + 8, 10, 1.3);
                        return;
                    }

                    // Handle sinking lotus pad
                    if (p.sinkable) {
                        p.sinkDepth = Math.min(18, p.sinkDepth + 1.2);
                    }

                    // Handle moving raft carrying the cat
                    if (p.moving && p.speed) {
                        this.cat.x += p.speed * p.dir;
                    }

                    let surface = 'tile';
                    if (p.type === 'lotus') surface = 'lotus';
                    else if (p.type === 'raft' || p.type === 'pillar' || p.type === 'ink_bridge') surface = 'wood';
                    else if (p.type === 'stone' || p.type === 'cliff') surface = 'stone';

                    this.cat.land(py, surface, this.particles);

                    // Record safe landing spot (excluding sinking platforms that sunk too deep)
                    if (!p.sinkable || (p.sinkDepth || 0) < 12) {
                        this.lastSafeSpot = { x: this.cat.x, y: py - this.cat.height * 0.5 };
                    }
                    break;
                }
            }
        }

        if (!landedOnAny && this.cat.isGrounded) {
            // Walked off an edge
            this.cat.isGrounded = false;
        }
    }

    checkCollectibles() {
        const lvl = this.levelManager.getCurrentLevel();
        if (!lvl || !this.cat.isAlive) return;

        for (const item of lvl.collectibles) {
            if (item.collected) continue;

            const dist = Math.hypot(this.cat.x - item.x, this.cat.y - item.y);
            if (dist < 32) {
                item.collected = true;
                if (item.type === 'fish') {
                    this.collectedFish++;
                    this.lives++;
                    this.score += 200;
                    this.particles.createFloatingText(item.x, item.y - 18, '九命护体 +1', '#d49b38');
                    this.particles.createInkSplatter(item.x, item.y, 14, 1.2, 'rgba(212, 155, 56, ');
                } else {
                    this.collectedInk++;
                    this.bridgeCount++;
                    this.score += 100;
                    this.particles.createFloatingText(item.x, item.y - 18, '泼墨成桥 +1', '#2c2b29');
                    this.particles.createInkSplatter(item.x, item.y, 12, 1.1, 'rgba(30, 30, 30, ');
                }

                if (window.soundManager) {
                    window.soundManager.playCollect();
                }

                this.updateHUD();
            }
        }
    }

    checkGoal() {
        const lvl = this.levelManager.getCurrentLevel();
        if (!lvl || !lvl.goal || !this.cat.isAlive || this.cat.hasWon) return;

        const g = lvl.goal;
        const dist = Math.hypot(this.cat.x - (g.x + g.w * 0.5), this.cat.y - (g.y - 20));
        if (dist < 65 || (this.cat.x >= g.x && this.cat.x <= g.x + g.w && this.cat.y >= g.y - 80 && this.cat.y <= g.y + 20)) {
            this.triggerVictory();
        }
    }

    checkDeath() {
        const lvl = this.levelManager.getCurrentLevel();
        if (!lvl || !this.cat.isAlive) return;

        if (this.cat.y > lvl.deadY) {
            // Check if player has extra lives from dried fish (九命灵猫护体)
            if (this.lives > 0 && this.lastSafeSpot) {
                this.lives--;
                this.updateHUD();
                this.resurrectCat();
                return;
            }

            this.cat.isAlive = false;
            this.camera.shake(8, 16);

            if (lvl.type === 'river') {
                this.particles.createRipple(this.cat.x, lvl.waterY, 65);
                this.particles.createInkSplatter(this.cat.x, lvl.waterY, 18, 1.5, 'rgba(40, 75, 80, ');
            }

            if (window.soundManager) {
                window.soundManager.playDefeat();
            }

            setTimeout(() => {
                this.showDefeatModal();
            }, 750);
        }
    }

    // Reincarnate / Teleport to last safe ground upon falling (灵猫还魂)
    resurrectCat() {
        this.camera.shake(6, 12);
        const lvl = this.levelManager.getCurrentLevel();
        if (lvl && lvl.type === 'river') {
            this.particles.createRipple(this.cat.x, lvl.waterY, 55);
        }

        // Dissolve into ink mist at fall point
        this.particles.createInkSplatter(this.cat.x, this.cat.y, 16, 1.4, 'rgba(40, 40, 45, ');

        // Return safely to last solid platform
        if (this.lastSafeSpot) {
            this.cat.x = this.lastSafeSpot.x;
            this.cat.y = this.lastSafeSpot.y - 12;
        }
        this.cat.vx = 0;
        this.cat.vy = -3.8;
        this.cat.isGrounded = false;
        this.cat.invulnerableTimer = 85;

        // Reincarnation ink swirl at safe landing spot
        this.particles.createInkSplatter(this.cat.x, this.cat.y, 18, 1.5, 'rgba(184, 56, 40, ');
        this.particles.createFloatingText(this.cat.x, this.cat.y - 35, '灵猫还魂 · 归落脚处！', '#b83828');

        if (window.soundManager) {
            window.soundManager.playResurrect();
        }
    }

    // Deploy an Ink Bridge (泼墨成梁)
    spawnInkBridge() {
        if (this.state !== 'playing' || !this.cat.isAlive) return;
        if (this.bridgeCount <= 0) {
            this.particles.createFloatingText(this.cat.x, this.cat.y - 25, '墨力未盈 · 需拾取水墨', '#888888');
            return;
        }

        const lvl = this.levelManager.getCurrentLevel();
        if (!lvl) return;

        this.bridgeCount--;
        this.updateHUD();

        const bridgeW = 230;
        const bridgeH = 22;
        let bridgeX = this.cat.facing > 0 ? this.cat.x - 25 : this.cat.x - bridgeW + 25;
        let bridgeY = this.cat.isGrounded ? (this.cat.y + 16) : (this.cat.y + 12);

        // Clamp inside level width
        bridgeX = Math.max(0, Math.min(lvl.width - bridgeW, bridgeX));

        const bridgePlatform = {
            id: 'ink_bridge_' + Date.now(),
            x: bridgeX,
            y: bridgeY,
            w: bridgeW,
            h: bridgeH,
            type: 'ink_bridge',
            style: 'ink_plank',
            spawnTime: performance.now(),
            isBridge: true
        };

        lvl.platforms.push(bridgePlatform);

        // Catch the cat if currently falling in air
        if (!this.cat.isGrounded && this.cat.y <= bridgeY + 8) {
            this.cat.land(bridgeY, 'wood', this.particles);
        }

        if (window.soundManager) {
            window.soundManager.playPaintBridge();
        }

        // Bridge spawn ink splatters
        for (let bx = bridgeX; bx <= bridgeX + bridgeW; bx += 32) {
            this.particles.createInkSplatter(bx, bridgeY, 4, 0.9, 'rgba(40, 40, 45, ');
        }
        this.particles.createFloatingText(this.cat.x, this.cat.y - 35, '泼墨成桥！', '#b83828');
    }

    triggerVictory() {
        this.cat.hasWon = true;
        this.cat.vx = 0;
        this.state = 'victory';

        // Calculate stars
        const lvl = this.levelManager.getCurrentLevel();
        let stars = 1; // Completed
        if (this.collectedFish >= Math.ceil(this.totalFish * 0.7)) stars++;
        if (this.elapsedTime <= lvl.parTime) stars++;

        this.saveRecords(lvl.id, stars, this.elapsedTime);

        if (window.soundManager) {
            window.soundManager.playVictory();
        }

        this.particles.createInkSplatter(this.cat.x, this.cat.y, 25, 1.8, 'rgba(180, 42, 30, ');

        setTimeout(() => {
            this.showVictoryModal(stars);
        }, 600);
    }

    showVictoryModal(stars) {
        const modal = document.getElementById('victoryModal');
        modal.classList.remove('hidden');

        document.getElementById('victoryLevelName').textContent = this.levelManager.getCurrentLevel().name;
        document.getElementById('victoryTime').textContent = `${this.elapsedTime.toFixed(1)} 秒`;
        document.getElementById('victoryFish').textContent = `${this.collectedFish} / ${this.totalFish}`;
        document.getElementById('victoryInk').textContent = `${this.collectedInk} / ${this.totalInk}`;

        // Rating display
        const ratingLabels = ['', '一品登堂', '二品入室', '三品圆满'];
        document.getElementById('victoryStars').textContent = ratingLabels[stars] || '一品登堂';

        // Custom calligraphic rank
        const ranks = ['初涉江湖', '踏雪无痕', '神行妙墨', '天人合一'];
        document.getElementById('victoryRank').textContent = ranks[stars];
    }

    showDefeatModal() {
        const modal = document.getElementById('defeatModal');
        modal.classList.remove('hidden');
    }

    updateHUD() {
        const fishEl = document.getElementById('hudFishCount');
        const inkEl = document.getElementById('hudInkCount');
        const timeEl = document.getElementById('hudTimer');
        const bridgeHudBtn = document.getElementById('btnBridgeSkill');
        const bridgeHudText = document.getElementById('bridgeText');
        const touchBridgeBtn = document.getElementById('btnTouchBridge');
        const touchBridgeText = document.getElementById('touchBridgeText');

        if (fishEl) {
            fishEl.textContent = `护体 x${this.lives} (鱼 ${this.collectedFish}/${this.totalFish})`;
        }
        if (inkEl) {
            inkEl.textContent = `墨桥 x${this.bridgeCount} (墨 ${this.collectedInk}/${this.totalInk})`;
        }
        if (timeEl) {
            timeEl.textContent = `${this.elapsedTime.toFixed(1)}s`;
        }

        if (bridgeHudText) {
            bridgeHudText.textContent = `泼墨桥(${this.bridgeCount})`;
        }
        if (touchBridgeText) {
            touchBridgeText.textContent = `墨桥 ${this.bridgeCount}`;
        }

        if (touchBridgeBtn) {
            touchBridgeBtn.style.opacity = this.bridgeCount > 0 ? '1' : '0.55';
        }
        if (bridgeHudBtn) {
            bridgeHudBtn.style.opacity = this.bridgeCount > 0 ? '1' : '0.65';
        }
    }

    // ==========================================
    // Render Loop
    // ==========================================

    render() {
        const w = this.displayWidth;
        const h = this.displayHeight;
        const ctx = this.ctx;
        const dpr = this.dpr || 1;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        const camX = this.camera.getRenderX();
        const camY = this.camera.getRenderY();
        const lvl = this.levelManager.getCurrentLevel();

        // 1. Xuan Paper Sky & Parallax Mountains
        this.levelManager.renderBackground(ctx, camX, camY, w, h);

        // 2. Water body (for river levels)
        this.levelManager.renderWater(ctx, camX, camY, w, h);

        // 3. Platforms (roofs, stones, bamboo, lanterns, clouds, ink bridges)
        this.levelManager.renderPlatforms(ctx, camX, camY);

        // 4. Collectibles (fish treats, ink drops)
        this.levelManager.renderCollectibles(ctx, camX, camY);

        // 5. Goal banner
        this.levelManager.renderGoal(ctx, camX, camY);

        // 6. World particles & ripples
        this.particles.renderWorldParticles(ctx, camX, camY);

        // 7. Cat aiming trajectory preview (when aiming / dragging)
        this.cat.drawTrajectory(ctx, camX, camY, lvl ? lvl.platforms : []);

        // 8. Ink Cat character
        this.cat.render(ctx, camX, camY);

        // 9. Screen-space ambient weather (rain, leaves, petals, fireflies)
        this.particles.renderScreenParticles(ctx, w, h);
    }

    loop(currentTime) {
        this.update();
        this.render();
        this.rafId = requestAnimationFrame(this.loop);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});
