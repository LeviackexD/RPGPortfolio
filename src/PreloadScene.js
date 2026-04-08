import Phaser from 'phaser';

/**
 * PreloadScene - Estilo RPG Pixel Art (Octopath/Zelda inspired)
 * Pantalla de carga con estética retro de 16-bit
 */
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('scene-preload');
    }

    preload() {
        const { width, height } = this.cameras.main;
        const cx = width / 2;
        const cy = height / 2;

        // ═══════════════════════════════════════════════════════
        // PALETA DE COLORES - Estilo Octopath Traveler
        // ═══════════════════════════════════════════════════════
        const COLORS = {
            // Tonos tierra (madera)
            WOOD_DARK: 0x2d1810,
            WOOD_MID: 0x4a2c1a,
            WOOD_LIGHT: 0x6b4423,
            WOOD_PALE: 0x8b6914,
            
            // Dorados (accesorios)
            GOLD_DARK: 0x8b6914,
            GOLD: 0xc9a227,
            GOLD_LIGHT: 0xf4d03f,
            
            // Azules profundos (fondo)
            BLUE_DEEP: 0x0a1628,
            BLUE_MID: 0x1a3a5c,
            BLUE_LIGHT: 0x2e5a8c,
            
            // Gemas
            EMERALD: 0x2ecc71,
            RUBY: 0xe74c3c,
            SAPPHIRE: 0x3498db,
            
            // Metal
            IRON: 0x5a5a5a,
            IRON_LIGHT: 0x8a8a8a,
            
            // Texto
            TEXT: 0xf5f5dc,
            TEXT_SHADOW: 0x1a0f05
        };

        // ═══════════════════════════════════════════════════════
        // FONDO ATMOSFÉRICO
        // ═══════════════════════════════════════════════════════
        const bg = this.add.graphics();
        
        // Gradiente profundo tipo cielo nocturno
        bg.fillGradientStyle(
            COLORS.BLUE_DEEP, COLORS.BLUE_DEEP,
            COLORS.BLUE_MID, COLORS.BLUE_MID,
            1
        );
        bg.fillRect(0, 0, width, height);

        // Niebla pixelada animada
        for (let i = 0; i < 12; i++) {
            const fogX = Math.random() * width;
            const fogY = height * 0.4 + Math.random() * height * 0.6;
            const fogW = 150 + Math.random() * 200;
            const fog = this.add.rectangle(fogX, fogY, fogW, 20, COLORS.BLUE_LIGHT, 0.15);
            
            this.tweens.add({
                targets: fog,
                x: fogX + 60 + Math.random() * 40,
                alpha: { from: 0.15, to: 0.05 },
                duration: 5000 + Math.random() * 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // ═══════════════════════════════════════════════════════
        // MARCO PRINCIPAL - Estilo pixel art ornamento
        // ═══════════════════════════════════════════════════════
        const frameW = 400;
        const frameH = 280;
        const frameX = cx - frameW / 2;
        const frameY = cy - frameH / 2 - 20;

        const frame = this.add.graphics();

        // Sombra del marco
        frame.fillStyle(0x000000, 0.4);
        frame.fillRect(frameX + 6, frameY + 6, frameW, frameH);

        // Borde exterior grueso (estilo pixel)
        frame.fillStyle(COLORS.WOOD_DARK, 1);
        frame.fillRect(frameX, frameY, frameW, frameH);

        // Borde medio
        frame.fillStyle(COLORS.WOOD_MID, 1);
        frame.fillRect(frameX + 4, frameY + 4, frameW - 8, frameH - 8);

        // Borde interior
        frame.fillStyle(COLORS.WOOD_LIGHT, 1);
        frame.fillRect(frameX + 8, frameY + 8, frameW - 16, frameH - 16);

        // Fondo interior (azul profundo)
        frame.fillStyle(COLORS.BLUE_DEEP, 1);
        frame.fillRect(frameX + 12, frameY + 12, frameW - 24, frameH - 24);

        // ═══════════════════════════════════════════════════════
        // ESQUINAS ORNAMENTADAS (Pixel art corners)
        // ═══════════════════════════════════════════════════════
        const drawCorner = (x, y, rotation) => {
            const corner = this.add.graphics();
            corner.x = x;
            corner.y = y;
            
            // Base de la esquina
            corner.fillStyle(COLORS.WOOD_DARK, 1);
            corner.fillRect(-16, -16, 32, 32);
            
            // Detalle dorado
            corner.fillStyle(COLORS.GOLD, 1);
            corner.fillRect(-12, -12, 24, 24);
            corner.fillStyle(COLORS.WOOD_MID, 1);
            corner.fillRect(-8, -8, 16, 16);
            
            // Gema central
            corner.fillStyle(COLORS.EMERALD, 1);
            corner.fillRect(-4, -4, 8, 8);
            corner.fillStyle(0xffffff, 0.4);
            corner.fillRect(-2, -2, 3, 3);
            
            corner.rotation = rotation;
        };

        drawCorner(frameX, frameY, 0);                    // Top-left
        drawCorner(frameX + frameW, frameY, Math.PI / 2);   // Top-right
        drawCorner(frameX, frameY + frameH, -Math.PI / 2);  // Bottom-left
        drawCorner(frameX + frameW, frameY + frameH, Math.PI); // Bottom-right

        // ═══════════════════════════════════════════════════════
        // BARRA SUPERIOR - Título
        // ═══════════════════════════════════════════════════════
        const titleBarY = frameY + 20;
        
        frame.fillStyle(COLORS.WOOD_MID, 1);
        frame.fillRect(frameX + 20, titleBarY, frameW - 40, 36);
        
        // Borde dorado de la barra
        frame.lineStyle(2, COLORS.GOLD, 1);
        frame.strokeRect(frameX + 20, titleBarY, frameW - 40, 36);
        
        // Gemas decorativas en la barra
        const drawGem = (gx, gy, color) => {
            frame.fillStyle(COLORS.WOOD_DARK, 1);
            frame.fillRect(gx - 6, gy - 6, 12, 12);
            frame.fillStyle(color, 1);
            frame.fillRect(gx - 4, gy - 4, 8, 8);
            frame.fillStyle(0xffffff, 0.5);
            frame.fillRect(gx - 2, gy - 2, 3, 3);
        };
        
        drawGem(frameX + 35, titleBarY + 18, COLORS.EMERALD);
        drawGem(frameX + frameW - 35, titleBarY + 18, COLORS.RUBY);

        // Título pixelado
        this.add.text(cx, titleBarY + 18, '◆ PREPARANDO AVENTURA ◆', {
            fontFamily: 'MedievalSharp',
            fontSize: '14px',
            fontStyle: 'bold',
            color: '#f4d03f',
            stroke: '#2d1810',
            strokeThickness: 3,
            letterSpacing: 2
        }).setOrigin(0.5).setShadow(2, 2, '#000000', 0.5);

        // ═══════════════════════════════════════════════════════
        // ESPADA PIXEL ART (Centro decorativo)
        // ═══════════════════════════════════════════════════════
        const swordY = frameY + 95;
        const sword = this.add.graphics();

        // Brillo detrás de la espada
        const glow = this.add.graphics();
        glow.fillStyle(COLORS.GOLD, 0.1);
        glow.fillCircle(cx, swordY, 50);
        
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.15, to: 0.05 },
            scale: { from: 1, to: 1.2 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Hoja de la espada (pixelada)
        sword.fillStyle(COLORS.IRON, 1);
        // Centro
        sword.fillRect(cx - 3, swordY - 45, 6, 60);
        // Filo izquierdo
        sword.fillStyle(COLORS.IRON_LIGHT, 0.8);
        sword.fillRect(cx - 2, swordY - 45, 2, 58);
        // Punta
        sword.fillStyle(COLORS.IRON, 1);
        sword.fillRect(cx - 1, swordY - 48, 2, 3);

        // Guarda (crossguard) - estilo pixel
        sword.fillStyle(COLORS.GOLD_DARK, 1);
        sword.fillRect(cx - 18, swordY + 15, 36, 8);
        sword.fillStyle(COLORS.GOLD, 1);
        sword.fillRect(cx - 16, swordY + 16, 32, 6);
        // Detalles en la guarda
        sword.fillStyle(COLORS.WOOD_DARK, 1);
        sword.fillRect(cx - 3, swordY + 17, 6, 4);

        // Empuñadura
        sword.fillStyle(COLORS.WOOD_DARK, 1);
        sword.fillRect(cx - 4, swordY + 23, 8, 18);
        // Wrap de la empuñadura
        sword.fillStyle(COLORS.WOOD_PALE, 1);
        for (let i = 0; i < 3; i++) {
            sword.fillRect(cx - 4, swordY + 25 + i * 5, 8, 2);
        }

        // Pomo
        sword.fillStyle(COLORS.GOLD, 1);
        sword.fillRect(cx - 5, swordY + 41, 10, 8);
        sword.fillStyle(COLORS.RUBY, 1);
        sword.fillRect(cx - 2, swordY + 43, 4, 4);

        // Animación flotante de la espada
        this.tweens.add({
            targets: sword,
            y: -4,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ═══════════════════════════════════════════════════════
        // BARRA DE PROGRESO - Estilo pixel art
        // ═══════════════════════════════════════════════════════
        const barW = 320;
        const barH = 24;
        const barX = cx - barW / 2;
        const barY = frameY + 160;

        const barFrame = this.add.graphics();

        // Marco exterior de la barra
        barFrame.fillStyle(COLORS.WOOD_DARK, 1);
        barFrame.fillRect(barX - 6, barY - 6, barW + 12, barH + 12);
        
        barFrame.fillStyle(COLORS.WOOD_MID, 1);
        barFrame.fillRect(barX - 4, barY - 4, barW + 8, barH + 8);
        
        // Borde dorado
        barFrame.lineStyle(2, COLORS.GOLD, 1);
        barFrame.strokeRect(barX - 4, barY - 4, barW + 8, barH + 8);

        // Interior oscuro (track)
        barFrame.fillStyle(0x0a0a14, 1);
        barFrame.fillRect(barX, barY, barW, barH);

        // Grid pixelado en el track
        barFrame.lineStyle(1, COLORS.WOOD_MID, 0.3);
        for (let x = barX; x < barX + barW; x += 8) {
            barFrame.lineBetween(x, barY, x, barY + barH);
        }

        // Barra de progreso dinámica
        const progressBar = this.add.graphics().setDepth(1);

        // Texto de porcentaje
        const percentText = this.add.text(cx, barY + barH / 2, '0%', {
            fontFamily: 'MedievalSharp',
            fontSize: '12px',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(2);

        // ═══════════════════════════════════════════════════════
        // MENSAJES DE CARGA - Estilo typewriter RPG
        // ═══════════════════════════════════════════════════════
        const messages = [
            '⚔ Forjando la espada legendaria...',
            '   Recogiendo hierbas medicinales...',
            '   Despertando a los sprites...',
            '   Consultando el mapa del tesoro...',
            '   Afinando el arco del héroe...',
            '   Preparando pociones mágicas...',
            '   Encendiendo las antorchas...'
        ];

        const msgText = this.add.text(cx, barY + 45, messages[0], {
            fontFamily: 'MedievalSharp',
            fontSize: '12px',
            color: '#c9a227',
            stroke: '#1a0f05',
            strokeThickness: 1,
            letterSpacing: 1
        }).setOrigin(0.5);

        // Cursor parpadeante tipo RPG
        const cursor = this.add.text(cx + msgText.width / 2 + 5, barY + 45, '▋', {
            fontFamily: 'MedievalSharp',
            fontSize: '12px',
            color: '#f4d03f'
        }).setOrigin(0, 0.5);

        this.tweens.add({
            targets: cursor,
            alpha: { from: 1, to: 0 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Stepped'
        });

        const messageEvent = this.time.addEvent({
            delay: 1800,
            callback: () => {
                const msg = messages[Math.floor(Math.random() * messages.length)];
                msgText.setText(msg);
                cursor.x = cx + msgText.width / 2 + 5;
            },
            loop: true
        });

        // ═══════════════════════════════════════════════════════
        // DECORACIÓN INFERIOR
        // ═══════════════════════════════════════════════════════
        const decorY = frameY + frameH - 30;
        
        // Línea decorativa pixelada
        const decor = this.add.graphics();
        decor.lineStyle(2, COLORS.GOLD, 0.6);
        decor.lineBetween(frameX + 40, decorY, frameX + frameW - 40, decorY);
        
        // Gemas en la línea decorativa
        drawGem(frameX + 30, decorY, COLORS.SAPPHIRE);
        drawGem(frameX + frameW - 30, decorY, COLORS.SAPPHIRE);

        // Texto inferior
        this.add.text(cx, decorY + 15, '◇ Portfolio RPG ◇', {
            fontFamily: 'MedievalSharp',
            fontSize: '10px',
            color: '#8b6914',
            letterSpacing: 3
        }).setOrigin(0.5);

        // ═══════════════════════════════════════════════════════
        // LÓGICA DE CARGA
        // ═══════════════════════════════════════════════════════
        let isLoadComplete = false;
        let isTweenComplete = false;
        const progressData = { value: 0 };

        const checkReady = () => {
            if (isLoadComplete && isTweenComplete) {
                messageEvent.destroy();
                cursor.destroy();
                this.cameras.main.fadeOut(600, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('scene-game');
                });
            }
        };

        this.tweens.add({
            targets: progressData,
            value: 1,
            duration: 3500,
            ease: 'Cubic.out',
            onUpdate: () => {
                const fillW = barW * progressData.value;
                progressBar.clear();

                if (fillW > 0) {
                    // Gradiente dorado pixelado
                    const steps = Math.ceil(fillW / 4);
                    for (let i = 0; i < steps; i++) {
                        const x = barX + i * 4;
                        const w = Math.min(4, fillW - i * 4);
                        
                        // Color base dorado
                        let color = COLORS.GOLD;
                        let alpha = 1;
                        
                        // Efecto brillo en los bordes
                        if (i === 0 || i === steps - 1) {
                            alpha = 0.8;
                        }
                        
                        progressBar.fillStyle(color, alpha);
                        progressBar.fillRect(x, barY, w, barH);
                    }

                    // Highlight superior
                    progressBar.fillStyle(COLORS.GOLD_LIGHT, 0.4);
                    progressBar.fillRect(barX, barY, fillW, 4);

                    // Sombra inferior
                    progressBar.fillStyle(COLORS.WOOD_DARK, 0.4);
                    progressBar.fillRect(barX, barY + barH - 3, fillW, 3);

                    // Brillo en la punta
                    if (fillW > 5) {
                        progressBar.fillStyle(0xffffff, 0.6);
                        progressBar.fillRect(barX + fillW - 4, barY + 2, 3, barH - 4);
                    }
                }

                percentText.setText(`${Math.round(progressData.value * 100)}%`);
            },
            onComplete: () => {
                isTweenComplete = true;
                checkReady();
            }
        });

        this.load.on('complete', () => {
            isLoadComplete = true;
            checkReady();
        });

        // ═══════════════════════════════════════════════════════
        // ASSETS DEL JUEGO
        // ═══════════════════════════════════════════════════════
        this.load.image("grass", "assets/world/grass.png");
        this.load.image("topleft", "assets/world/topleft.png");
        this.load.image("topright", "assets/world/topright.png");
        this.load.image("bottomleft", "assets/world/bottomleft.png");
        this.load.image("bottomright", "assets/world/bottomright.png");
        this.load.image("topedge", "assets/world/topedge.png");
        this.load.image("bottomedge", "assets/world/bottomedge.png");
        this.load.image("leftedge", "assets/world/leftedge.png");
        this.load.image("rightedge", "assets/world/rightedge.png");
        this.load.image("tree", "assets/world/tree.png");
        this.load.image("flower1", "assets/world/flower1.png");
        this.load.image("flower2", "assets/world/flower2.png");
        this.load.image("flower3", "assets/world/flower3.png");
        this.load.image("pathtile", "assets/world/pathtile.jpg");
        this.load.image("sign", "assets/sign.png");
        this.load.image("house", "assets/world/house.png");

        // Animaciones del jugador
        this.load.spritesheet("player-forward", "assets/character/forward.png", {
            frameWidth: 16,
            frameHeight: 23
        });
        this.load.spritesheet("player-backward", "assets/character/backward.png", {
            frameWidth: 16,
            frameHeight: 23
        });
        this.load.spritesheet("player-left", "assets/character/left.png", {
            frameWidth: 16,
            frameHeight: 23
        });
        this.load.spritesheet("player-right", "assets/character/right.png", {
            frameWidth: 16,
            frameHeight: 23
        });

        // Elementos del mundo
        this.load.spritesheet("water", "assets/world/simplewater.png", { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet("fountain", "assets/world/fountain.png", { frameWidth: 48, frameHeight: 47 });

        // Personajes de anime (proyectos)
        this.load.spritesheet("goku", "assets/anime/goku.png", { frameWidth: 500, frameHeight: 637 });
        this.load.spritesheet("itachi", "assets/anime/itachi.png", { frameWidth: 68, frameHeight: 114 });
        this.load.spritesheet("kakashi", "assets/anime/kakashi.png", { frameWidth: 256, frameHeight: 256 });
        this.load.spritesheet("link", "assets/anime/link.png", { frameWidth: 250, frameHeight: 292 });
        this.load.spritesheet("sasuke", "assets/anime/sasuke.png", { frameWidth: 75, frameHeight: 75 });

        // Efectos especiales
        this.load.spritesheet("fx-carga", "assets/FX/carga.png", { frameWidth: 53, frameHeight: 35 });
        this.load.spritesheet("fx-aura", "assets/FX/BigEnergyBall.png", { frameWidth: 24, frameHeight: 24 });

        // UI
        this.load.image("dialog-box", "assets/dialog/DialogBox.png");
        this.load.image("dialog-arrow", "assets/dialog/Arrow.png");
    }

    create() { }
}
