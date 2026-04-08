---
name: phaser_expert
description: Especialista en desarrollo avanzado con Phaser 3.60+ para portafolios interactivos y juegos web.
---

# Phaser 3.60+ Expert Skill 🛡️📜

Este documento sirve como base de conocimiento para el desarrollo de aplicaciones interactivas con Phaser 3.60+. Contiene patrones oficiales, mejores prácticas y optimizaciones.

## 1. Ciclo de Vida de las Escenas 🔄
Cada escena en Phaser sigue un orden estricto de ejecución:

- `init(data)`: Recibe datos de otras escenas. Configuración inicial.
- `preload()`: Carga de assets (imágenes, audios, JSON). No se crean objetos visuales aquí.
- `create(data)`: Se ejecutan las lógicas de creación de objetos una vez cargados los assets.
- `update(time, delta)`: Bucle de actualización (generalmente 60fps). Gestión de inputs y físicas.

**Transiciones**:
- `this.scene.start('key')`: Detiene la actual y arranca la nueva.
- `this.scene.launch('key')`: Arranca la nueva en paralelo (útil para UIs).
- `this.cameras.main.fadeOut(ms)`: Efecto de fundido cinematográfico.

## 2. Sistema de Partículas (Phaser 3.60+) 🪄
En la versión 3.60, el sistema de partículas ha sido simplificado y potenciado:

```javascript
// Crear emisor con objeto de configuración única
const emitter = this.add.particles(x, y, 'texture-key', {
    speed: { min: -100, max: 100 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 2000,
    blendMode: 'ADD',
    frequency: 100
});
```
- **Texturas dinámicas**: Si no tienes un asset, genera uno con `Graphics` y `generateTexture`.

## 3. Arcade Physics ⚔️
- **Spritres Físicos**: `this.physics.add.sprite(x, y, 'key')`.
- **Colisiones**: `this.physics.add.collider(obj1, obj2, callback)`. Los objetos rebotan o bloquean.
- **Solapamientos**: `this.physics.add.overlap(obj1, obj2, callback)`. Útil para recoger ítems o activar eventos.
- **Gestión de Cuerpos**: `body.setSize(w, h)` y `body.setOffset(x, y)` para hitboxes precisos.

## 4. UI y Tipografía Premium 🖋️
- **Fuentes**: Las fuentes de Google Fonts (como 'MedievalSharp') deben estar cargadas en el CSS/HTML antes de usarse en Phaser.
- **Estilos**: Usa `stroke` y `shadow` para que el texto resalte sobre cualquier fondo RPG.
- **Contenedores**: Agrupa `Text` y `Graphics` en un `Container` para moverlos y escalarlos como un solo bloque.

## 5. Optimización y Responsive 📱
- **Scale Manager**: Usa `scale: { mode: Phaser.Scale.FIT }` en la configuración.
- **Mobile First**: Detecta móviles para activar Joysticks táctiles (`joy.js`) en lugar de teclado.
- **Limpieza**: Destruye tweens (`tween.remove()`) y eventos (`event.remove()`) si no se van a usar más para evitar fugas de memoria.

---
*Referencia oficial: https://newdocs.phaser.io/ | https://docs.phaser.io/*
