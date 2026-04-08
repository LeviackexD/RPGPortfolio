/**
 * SNIPPETS: PHASER 3.60+ EXPERT
 */

// 1. Botón con Efecto Hover y Sonido (Simulado)
export function createButton(scene, x, y, text, callback) {
    const btn = scene.add.text(x, y, text, {
        font: '24px "MedievalSharp"',
        fill: '#ffffff',
        backgroundColor: '#1b1b1b',
        padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover', () => btn.setStyle({ fill: '#ffcc00' }));
    btn.on('pointerout', () => btn.setStyle({ fill: '#ffffff' }));
    btn.on('pointerdown', () => {
        scene.tweens.add({ targets: btn, scale: 0.9, duration: 100, yoyo: true });
        callback();
    });
    return btn;
}

// 2. Transición Cinematográfica entre Escenas
export function transitionToScene(scene, nextSceneKey, duration = 1000) {
    scene.cameras.main.fadeOut(duration, 0, 0, 0);
    scene.cameras.main.once('camerafadeoutcomplete', () => {
        scene.scene.start(nextSceneKey);
    });
}

// 3. Generación de Textura de Círculo (Glow) en Memoria
export function generateGlowTexture(scene, key, size = 32, color = 0xffffff) {
    if (scene.textures.exists(key)) return;
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(color, 1);
    graphics.fillCircle(size / 2, size / 2, size / 2);
    graphics.generateTexture(key, size, size);
}

// 4. Detección de Dispositivo Móvil
export const isMobile = (scene) => {
    return scene.sys.game.device.os.android || 
           scene.sys.game.device.os.iOS || 
           window.innerWidth < 600;
};
