import Phaser from 'phaser';

/**
 * Escena de Menú Principal (MenuScene)
 * Es la primera pantalla que ve el usuario al entrar al portafolio.
 * Permite elegir entre empezar la aventura o configurar opciones.
 */
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('scene-menu');
    }

    preload() {
        // Cargar el asset de las espadas cruzadas
        this.load.image('espadas-menu', 'assets/crossed-swords.png');

        // Cargar la banda sonora
        this.load.audio('main-theme', 'assets/Soundtrack/Octopath.mp3');

        // ═══════════════════════════════════════════════════════
        // CAPAS DE FONDO PARALLAX - BackgroundMenu
        // ═══════════════════════════════════════════════════════
        this.load.image('bg-sky', 'assets/BackgroundMenu/sky.png');
        this.load.image('bg-far-mountains', 'assets/BackgroundMenu/far-mountains.png');
        this.load.image('bg-far-trees', 'assets/BackgroundMenu/far-trees.png');
        this.load.image('bg-middle-mountains', 'assets/BackgroundMenu/middle-mountains.png');
        this.load.image('bg-near-trees', 'assets/BackgroundMenu/near-trees.png');
        this.load.image('bg-myst', 'assets/BackgroundMenu/myst.png');

        // Generamos las texturas dinámicas aquí para que estén disponibles en el create
        this.generateRPGTextures();
    }

    generateRPGTextures() {
        // En preload usamos this.sys.game.config para dimensiones seguras
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // 1. Textura de la Daga (Selector de menú)
        if (!this.textures.exists('selector-dagger')) {
            const d = this.make.graphics({ x: 0, y: 0, add: false });
            d.fillStyle(0xe0e0e0, 1);
            d.fillTriangle(0, 5, 20, 0, 20, 10);
            d.fillStyle(0x8b4513, 1);
            d.fillRect(20, 3, 8, 4);
            d.fillStyle(0xd4af37, 1);
            d.fillRect(18, 0, 2, 10);
            d.generateTexture('selector-dagger', 30, 10);
        }

        // 2. Textura de la Niebla (Fuzzy Mist)
        if (!this.textures.exists('mist-particle')) {
            const m = this.make.graphics({ x: 0, y: 0, add: false });
            m.fillStyle(0xffffff, 1);
            m.fillCircle(32, 32, 32);
            m.generateTexture('mist-particle', 64, 64);
        }

        // 3. Texturas de Altavoz (Audio Control)
        if (!this.textures.exists('speaker-on')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.lineStyle(2, 0xe8dcac, 1);
            g.fillStyle(0xe8dcac, 1);
            // Cuerpo altavoz
            g.fillRect(5, 10, 8, 12);
            g.beginPath();
            g.moveTo(13, 10);
            g.lineTo(22, 4);
            g.lineTo(22, 28);
            g.lineTo(13, 22);
            g.closePath();
            g.fillPath();
            // Ondas
            g.beginPath();
            g.arc(22, 16, 6, -Math.PI/3, Math.PI/3);
            g.strokePath();
            g.beginPath();
            g.arc(22, 16, 10, -Math.PI/3, Math.PI/3);
            g.strokePath();
            g.generateTexture('speaker-on', 38, 32);
        }

        if (!this.textures.exists('speaker-off')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.lineStyle(2, 0xe8dcac, 1);
            g.fillStyle(0xe8dcac, 1);
            g.fillRect(5, 10, 8, 12);
            g.beginPath();
            g.moveTo(13, 10);
            g.lineTo(22, 4);
            g.lineTo(22, 28);
            g.lineTo(13, 22);
            g.closePath();
            g.fillPath();
            // X
            g.lineStyle(3, 0xff0000, 1);
            g.lineBetween(26, 10, 34, 22);
            g.lineBetween(34, 10, 26, 22);
            g.generateTexture('speaker-off', 38, 32);
        }
    }

    create() {
        // En create() cameras ya está disponible
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        // --- 0. MÚSICA DE FONDO ---
        // Iniciamos la música si no está sonando ya
        if (!this.sound.get('main-theme')) {
            this.bgMusic = this.sound.add('main-theme', {
                loop: true,
                volume: 0.4
            });
            this.bgMusic.play();
        } else {
            this.bgMusic = this.sound.get('main-theme');
        }

        // --- 1. FONDO PARALLAX ANIMADO (BackgroundMenu) ---
        this.createParallaxBackground(width, height);

        // Niebla adicional overlay
        const mistClouds = this.add.particles(0, 0, 'mist-particle', {
            x: { min: -100, max: width + 100 },
            y: { min: 0, max: height },
            speedX: { min: 5, max: 20 },
            scale: { start: 2, end: 4 },
            alpha: { start: 0, end: 0.08, steps: 100 },
            lifespan: 15000,
            quantity: 1,
            frequency: 1000,
            blendMode: 'SCREEN'
        });

        const vignette = this.add.graphics();
        vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.8, 0.8, 0, 0);
        vignette.fillRect(0, 0, width, height);
        vignette.setDepth(5);

        // --- 2. DECORACIÓN DEL TÍTULO (Espadas Cruzadas PNG) ---
        const swordImage = this.add.image(centerX, centerY - 80, 'espadas-menu')
            .setOrigin(0.5)
            .setScale(0.6)
            .setAlpha(0)
            .setDepth(10);

        // --- 3. TÍTULO DEL PORTAFOLIO ---
        const titleContainer = this.add.container(centerX, centerY - 80).setDepth(10);
        const titleShadow = this.add.text(4, 4, 'AVENTURERO\nPORTFOLIO', {
            font: 'bold 74px "MedievalSharp"',
            fill: '#000000',
            align: 'center',
            alpha: 0.5
        }).setOrigin(0.5);

        const titleText = this.add.text(0, 0, 'AVENTURERO\nPORTFOLIO', {
            font: 'bold 74px "MedievalSharp"',
            fill: '#d4af37', // Oro antiguo
            align: 'center',
            stroke: '#1b1b1b',
            strokeThickness: 10,
        }).setOrigin(0.5);

        titleContainer.add([titleShadow, titleText]);
        titleContainer.setAlpha(0);
        titleContainer.y -= 100;

        // --- 4. BOTONES DEL MENÚ ---
        this.buttons = [];

        const createRPGButton = (x, y, label, callback, index) => {
            const container = this.add.container(x, y).setAlpha(0).setDepth(10);

            const selectorLeft = this.add.image(-160, 0, 'selector-dagger')
                .setOrigin(0.5)
                .setScale(1.2)
                .setFlipX(true)
                .setAlpha(0)
                .setDepth(11);

            const selectorRight = this.add.image(160, 0, 'selector-dagger')
                .setOrigin(0.5)
                .setScale(1.2)
                .setAlpha(0)
                .setDepth(11);

            const body = this.add.graphics().setDepth(10);
            body.lineStyle(3, 0x8b7322, 1);
            body.fillStyle(0x0a0f1d, 0.9);
            body.fillRoundedRect(-140, -30, 280, 60, 4);
            body.strokeRoundedRect(-140, -30, 280, 60, 4);

            const text = this.add.text(0, 0, label, {
                font: '26px "MedievalSharp"',
                fill: '#e8dcac'
            }).setOrigin(0.5).setDepth(11);

            container.add([body, selectorLeft, selectorRight, text]);
            
            const zone = this.add.zone(0, 0, 280, 60).setInteractive({ useHandCursor: true }).setDepth(12);
            container.add(zone);

            zone.on('pointerover', () => {
                this.tweens.add({ targets: selectorLeft, alpha: 1, x: -150, duration: 200, ease: 'Back.out' });
                this.tweens.add({ targets: selectorRight, alpha: 1, x: 150, duration: 200, ease: 'Back.out' });
                this.tweens.add({ targets: text, scale: 1.1, fill: '#ffffff', duration: 100 });
                body.lineStyle(3, 0xffffff, 1).strokeRoundedRect(-140, -30, 280, 60, 4);
            });

            zone.on('pointerout', () => {
                this.tweens.add({ targets: selectorLeft, alpha: 0, x: -160, duration: 200 });
                this.tweens.add({ targets: selectorRight, alpha: 0, x: 160, duration: 200 });
                this.tweens.add({ targets: text, scale: 1, fill: '#e8dcac', duration: 100 });
                body.lineStyle(3, 0x8b7322, 1).strokeRoundedRect(-140, -30, 280, 60, 4);
            });

            zone.on('pointerdown', () => {
                const flash = this.add.graphics();
                flash.fillStyle(0xffffff, 0.4);
                flash.fillRoundedRect(x - 140, y - 30, 280, 60, 4);
                this.time.delayedCall(50, () => flash.destroy());
                callback();
            });

            this.buttons.push(container);
            return container;
        };

        const playBtn = createRPGButton(centerX, centerY + 100, '⚔️ ENTRAR AL MUNDO', () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('scene-preload');
            });
        }, 0);

        const creditsBtn = createRPGButton(centerX, centerY + 180, '📜 CRÉDITOS', () => {
            this.showCreditsPanel();
        }, 1);

        // --- 5. ANIMACIONES DE ENTRADA ESCALONADAS ---
        this.tweens.add({
            targets: [swordImage, titleContainer],
            alpha: 1,
            y: centerY - 80,
            duration: 1500,
            ease: 'Power2.out',
            delay: 500
        });

        this.buttons.forEach((btn, i) => {
            this.tweens.add({
                targets: btn,
                alpha: 1,
                x: centerX,
                duration: 800,
                ease: 'Back.out',
                delay: 1500 + (i * 300)
            });
        });

        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: titleContainer,
                y: '-=10',
                duration: 2500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        this.cameras.main.fadeIn(1200, 0, 0, 0);
    }

    /**
     * Fondo estático de capas con animación sutil de respiración
     * Las capas se mueven muy lentamente arriba/abajo sin repetir
     */
    createParallaxBackground(width, height) {
        // Contenedor para todas las capas
        this.bgLayers = [];

        // Escala para cubrir toda la pantalla
        const coverScale = Math.max(width / 320, height / 180);

        // ═══════════════════════════════════════════════════════
        // CAPAS DE FONDO (Estáticas con movimiento sutil)
        // ═══════════════════════════════════════════════════════
        
        // 1. CIELO (Capa base)
        const sky = this.add.image(width / 2, height / 2, 'bg-sky')
            .setOrigin(0.5)
            .setScale(coverScale)
            .setDepth(0);

        // 2. MONTAÑAS LEJANAS
        const farMountains = this.add.image(width / 2, height / 2, 'bg-far-mountains')
            .setOrigin(0.5)
            .setScale(coverScale)
            .setDepth(1)
            .setAlpha(0.9);
        this.bgLayers.push(farMountains);

        // 3. ÁRBOLES LEJANOS
        const farTrees = this.add.image(width / 2, height / 2, 'bg-far-trees')
            .setOrigin(0.5)
            .setScale(coverScale)
            .setDepth(2)
            .setAlpha(0.85);
        this.bgLayers.push(farTrees);

        // 4. MONTAÑAS MEDIAS
        const midMountains = this.add.image(width / 2, height / 2, 'bg-middle-mountains')
            .setOrigin(0.5)
            .setScale(coverScale)
            .setDepth(3)
            .setAlpha(0.9);
        this.bgLayers.push(midMountains);

        // 5. ÁRBOLES CERCANOS
        const nearTrees = this.add.image(width / 2, height / 2, 'bg-near-trees')
            .setOrigin(0.5)
            .setScale(coverScale)
            .setDepth(4)
            .setAlpha(0.95);
        this.bgLayers.push(nearTrees);

        // 6. NIEBLA (Efecto overlay sutil)
        const myst = this.add.image(width / 2, height / 2, 'bg-myst')
            .setOrigin(0.5)
            .setScale(coverScale)
            .setDepth(5)
            .setAlpha(0.3)
            .setBlendMode(Phaser.BlendModes.ADD);

        // ═══════════════════════════════════════════════════════
        // ANIMACIÓN DE MOVIMIENTO LATERAL (Oscilación suave)
        // ═══════════════════════════════════════════════════════
        this.bgLayers.forEach((layer, index) => {
            // Movimiento vertical de "respiración"
            this.tweens.add({
                targets: layer,
                y: `+=${3 + index}`,
                duration: 4000 + (index * 500),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: index * 200
            });

            // Movimiento horizontal de oscilación (amplitud creciente según cercanía)
            const xAmplitude = 8 + (index * 4); // 8, 12, 16, 20 píxeles
            this.tweens.add({
                targets: layer,
                x: `+=${xAmplitude}`,
                duration: 6000 + (index * 1000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: index * 300
            });
        });

        // Efecto de pulso en la niebla
        this.tweens.add({
            targets: myst,
            alpha: { from: 0.2, to: 0.4 },
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Movimiento horizontal de la niebla (más lento)
        this.tweens.add({
            targets: myst,
            x: '+=15',
            duration: 8000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // ═══════════════════════════════════════════════════════
        // EFECTO DE MOUSE (Parallax muy sutil)
        // ═══════════════════════════════════════════════════════
        this.input.on('pointermove', (pointer) => {
            const offsetX = (pointer.x - width / 2) / width;
            const offsetY = (pointer.y - height / 2) / height;

            this.bgLayers.forEach((layer, index) => {
                const factor = (index + 1) * 0.02;
                layer.setOrigin(0.5 - offsetX * factor, 0.5 - offsetY * factor);
            });
        });
    }

    showCreditsPanel() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        const panel = this.add.container(centerX, centerY).setDepth(20);
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setInteractive();

        const box = this.add.graphics();
        box.fillStyle(0x0a0f1d, 0.95);
        box.lineStyle(4, 0xd4af37, 1);
        box.fillRoundedRect(-200, -150, 400, 300, 10);
        box.strokeRoundedRect(-200, -150, 400, 300, 10);

        const title = this.add.text(0, -110, '📜 CRÉDITOS', {
            font: 'bold 32px "MedievalSharp"',
            fill: '#d4af37'
        }).setOrigin(0.5);

        const info = this.add.text(0, -10, 'Desarrollado con ❤️\npor Manu.\n\nTecnologías:\n- Phaser 3 (Motor WebGL)\n- Vite & Node.js\n- Pixel Art Clásico', {
            font: '20px "MedievalSharp"',
            fill: '#e8dcac',
            align: 'center',
            lineSpacing: 10
        }).setOrigin(0.5);

        const closeBtn = this.add.text(170, -130, '✖', {
            font: 'bold 24px Arial',
            fill: '#d4af37'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        panel.add([overlay, box, title, info, closeBtn]);
        panel.setScale(0);

        this.tweens.add({ targets: panel, scale: 1, duration: 400, ease: 'Back.out' });

        closeBtn.on('pointerdown', () => {
            this.tweens.add({
                targets: panel,
                scale: 0,
                duration: 300,
                ease: 'Back.in',
                onComplete: () => panel.destroy()
            });
        });

        closeBtn.on('pointerover', () => closeBtn.setStyle({ fill: '#ffffff' }));
        closeBtn.on('pointerout', () => closeBtn.setStyle({ fill: '#d4af37' }));
    }
}




