import Phaser from 'phaser';

/**
 * Escena de Inicio (BootScene)
 * Evita el bloqueo de audio del navegador forzando una interacción inicial.
 */
export default class BootScene extends Phaser.Scene {
    constructor() {
        super('scene-boot');
    }

    preload() {
        // Cargamos todas las capas para el ambiente
        this.load.image('boot-bg-base', 'assets/background 1/orig.png');
        this.load.image('boot-layer-1', 'assets/background 1/1.png');
        this.load.image('boot-layer-2', 'assets/background 1/2.png');
        this.load.image('boot-layer-3', 'assets/background 1/3.png');
        this.load.image('boot-layer-4', 'assets/background 1/4.png');
    }

    create() {
        const { width, height } = this.cameras.main;
        const centerX = width / 2;
        const centerY = height / 2;

        // Ayudante para añadir y escalar capas para cubrir la pantalla
        const addLayer = (key, initialAlpha = 1) => {
            const layer = this.add.image(centerX, centerY, key);
            const scaleX = width / layer.width;
            const scaleY = height / layer.height;
            const scale = Math.max(scaleX, scaleY);
            layer.setScale(scale).setAlpha(initialAlpha);
            return layer;
        };

        // 1. Capa Base (Cielo nocturno)
        const base = addLayer('boot-bg-base');

        // 2. Capas de Estrellas/Detalle (Parpadeo más etéreo)
        const layer1 = addLayer('boot-layer-1');
        const layer2 = addLayer('boot-layer-2');
        this.tweens.add({
            targets: [layer1, layer2],
            alpha: { from: 0.8, to: 0.3 },
            duration: 3500, // Más lento para ser más sutil
            yoyo: true,
            repeat: -1,
            ease: 'Cubic.easeInOut'
        });

        // 3. Nubes del horizonte (Capa 3 - Nubes de abajo)
        const bottomClouds = addLayer('boot-layer-3', 0.8);
        this.tweens.add({
            targets: bottomClouds,
            x: centerX + 40, // Más recorrido para que se note el movimiento
            duration: 25000, // Pero más tiempo para que sea fluido
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 4. Nubes Superiores / Luna (Capa 4)
        const topClouds = addLayer('boot-layer-4', 0.7);
        this.tweens.add({
            targets: topClouds,
            x: centerX - 35,
            duration: 20000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Capa oscura para que el texto sea legible
        this.add.rectangle(0, 0, width, height, 0x000000, 0.4).setOrigin(0);

        // Texto estilizado medieval
        const startText = this.add.text(centerX, centerY, 'Empieza tu aventura', {
            font: '40px "MedievalSharp"',
            fill: '#e8dcac',
            align: 'center'
        }).setOrigin(0.5).setAlpha(0);

        // Animación de aparición suave
        this.tweens.add({
            targets: [startText],
            alpha: 1,
            duration: 2000,
            ease: 'Power2.easeIn'
        });

        // Efecto de parpadeo (Blink) para invitar al clic
        this.tweens.add({
            targets: startText,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Al hacer clic, pasamos al Menú
        this.input.once('pointerdown', () => {
            // Activamos el AudioContext globalmente
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume();
            }

            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('scene-menu');
            });
        });
    }
}
