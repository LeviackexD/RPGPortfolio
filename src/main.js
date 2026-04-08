import "./style.css";
import Phaser from "phaser";
import BootScene from "./BootScene";
import PreloadScene from "./PreloadScene";
import MenuScene from "./MenuScene";
import HouseScene from "./HouseScene";

// ═══════════════════════════════════════════════════════
// FUNCIONES DE UTILIDAD
// ═══════════════════════════════════════════════════════

/**
 * Genera un número entero aleatorio entre dos valores (ambos incluidos).
 * Se usa para posicionar flores, gansos y otros elementos del mapa.
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Detecta si el usuario está en un dispositivo móvil.
 * Comprueba el User Agent del navegador y también el tamaño de pantalla (<500px).
 * Esto se usa para ajustar el tamaño del canvas y activar el joystick táctil.
 */
function isMobileDevice() {
  const isMobileByAgent =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const isMobileBySize = window.innerWidth < 500;
  return isMobileByAgent || isMobileBySize;
}

// ═══════════════════════════════════════════════════════
// CONFIGURACIÓN DE TAMAÑO Y MAPA
// ═══════════════════════════════════════════════════════

// Tamaño del canvas según el dispositivo (móvil vs escritorio)
if (isMobileDevice()) {
  var sizes = { width: 500, height: 700 };
} else {
  var sizes = { width: 700, height: 500 };
}

// Tamaño total del mapa del mundo en píxeles (1300x1200)
// El mapa es más grande que el canvas para que la cámara pueda seguir al jugador
const worldSize = { width: 1300, height: 1200 };

// ═══════════════════════════════════════════════════════
// CONFIGURACIÓN DEL PORTAFOLIO
// ═══════════════════════════════════════════════════════

// Aquí se personalizan todos los textos y rutas del portfolio
// Cambia estos valores para actualizar el contenido sin tocar la lógica del juego
const portfolioConfig = {
  authorName: "Manuel Cerezuela",
  tagline: "Desarrollador Web Interactivo | Phaser.js",
  welcomeMessage: "¡Bienvenido a mi portfolio Interactivo!",
  guideMessage: "Usa WASD/Arrow para explorar",
  aboutPath: "https://portfolio-qysoemxym-leviackexds-projects.vercel.app/", // URL de "Sobre mí"
  confirmHouse: "Entrar: ver 'Sobre mí'",
  centerSign: "EXPLORA MI MUNDO DIGITAL",
};

// ═══════════════════════════════════════════════════════
// CLASE PRINCIPAL DE LA ESCENA DEL JUEGO
// ═══════════════════════════════════════════════════════

class GameScene extends Phaser.Scene {
  constructor() {
    super("scene-game");
    // Referencias principales que se inicializan en create()
    this.player; // El personaje que controla el jugador
    this.cursor; // Controles de teclado
    this.lastFootprintTime = 0; // Control de tiempo para el efecto de polvo/pasos
  }

  init(data) {
    this.spawnFromHouse = data && data.fromHouse;
  }

  // ═══════════════════════════════════════════════════════
  // PRELOAD (vacío, la carga se hace en PreloadScene)
  // ═══════════════════════════════════════════════════════

  preload() {
    // La carga de recursos (imágenes, spritesheets, fuentes) se ha movido
    // a PreloadScene.js para mostrar una pantalla de carga con estilo RPG
    // mientras se descargan todos los assets del juego.
  }

  // ═══════════════════════════════════════════════════════
  // CREACIÓN DEL MUNDO
  // ═══════════════════════════════════════════════════════

  /**
   * create() se ejecuta una vez cuando todos los assets están cargados.
   * Aquí se construye todo el mundo del juego: mapa, personajes, colisiones, cámara, etc.
   */
  create() {
    this.redirecting = false;
    // --- CONTROLES DE TECLADO ---
    // Flechas del teclado
    this.cursors = this.input.keyboard.createCursorKeys();

    // Teclas WASD como alternativa a las flechas
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Tecla E para interactuar con carteles y diálogos
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Tecla ESPACIO para activar efectos especiales (carga + proyectil)
    this.fxKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Tecla Z para cambiar el zoom de la cámara (0.8 o 1)
    this.zoomKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.currentZoom = 1; // Zoom inicial
    this.cameras.main.setZoom(this.currentZoom);
    this.fxActive = false; // Indica si hay un FX activo actualmente
    this.facingDirection = "down"; // Dirección actual del personaje (up/down/left/right)
    this.fxProjectile = null; // Referencia al proyectil lanzado
    this.fxProjectileDir = "down"; // Dirección del proyectil
    this.chargeSprite = null; // Sprite de carga que sigue al jugador

    // Capturar teclas para que no causen scroll en la página
    this.input.keyboard.enabled = true;
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.W,
      Phaser.Input.Keyboard.KeyCodes.A,
      Phaser.Input.Keyboard.KeyCodes.S,
      Phaser.Input.Keyboard.KeyCodes.D,
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.E,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.Z,
      Phaser.Input.Keyboard.KeyCodes.ESC,
    ]);

    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.isPaused = false;

    // Asegurar que el canvas tenga foco para recibir eventos de teclado
    const canvas = this.sys.canvas || this.game.canvas;
    if (canvas) {
      canvas.setAttribute('tabindex', 0);
      canvas.focus();
    }

    this.input.keyboard.on('keydown', () => {
      if (canvas) canvas.focus();
    });

    // --- JOYSTICK MÓVIL ---
    // Si estamos en móvil, creamos un joystick virtual táctil
    if (isMobileDevice()) {
      this.joystick = new JoyStick(
        "joyDiv",
        {
          internalFillColor: "rgba(255, 255, 255, 0.5)",
          internalStrokeColor: "#ffffff",
          externalStrokeColor: "#ffffff",
          externalLineWidth: 3,
          autoReturnToCenter: true,
        },
        (stickData) => {
          this.stickData = stickData; // Guardamos los datos del joystick para usarlos en update()
        }
      );
    }

    // --- CONSTRUCCIÓN DEL MAPA ---
    // Calculamos cuántas piezas (tiles) de 32px caben en el mapa
    const mapWidth = Math.ceil(worldSize.width / 32);
    const mapHeight = Math.ceil(worldSize.height / 32);

    // Grupo estático para las piezas de agua (no se mueven, tienen colisión)
    this.waterTiles = this.physics.add.staticGroup();

    // Animación del agua: recorre 3 frames del spritesheet a 5fps en bucle infinito
    this.anims.create({
      key: "water_anim",
      frames: this.anims.generateFrameNumbers("water", { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1,
    });

    // Colocar cada tile del suelo según su posición
    // Los bordes (2 tiles de grosor) son agua, el interior es césped con bordes decorativos
    for (let x = 0; x < mapWidth; x++) {
      for (let y = 0; y < mapHeight; y++) {
        // Agua en los bordes del mapa
        if (x < 2 || y < 2 || x >= mapWidth - 2 || y >= mapHeight - 2) {
          const waterTile = this.waterTiles
            .create(x * 32, y * 32, "water")
            .setOrigin(0, 0)
            .setScale(2, 2);
          waterTile.anims.play("water_anim", true);
        } else {
          // Interior del mapa: bordes decorativos + césped
          if (x === 2) {
            // Borde izquierdo
            if (y === 2) this.add.image(x * 32, y * 32, "topleft").setOrigin(0, 0).setScale(2, 2);
            else if (y === mapHeight - 3) this.add.image(x * 32, y * 32, "bottomleft").setOrigin(0, 0).setScale(2, 2);
            else this.add.image(x * 32, y * 32, "leftedge").setOrigin(0, 0).setScale(2, 2);
          } else if (x === mapWidth - 3) {
            // Borde derecho
            if (y === 2) this.add.image(x * 32, y * 32, "topright").setOrigin(0, 0).setScale(2, 2);
            else if (y === mapHeight - 3) this.add.image(x * 32, y * 32, "bottomright").setOrigin(0, 0).setScale(2, 2);
            else this.add.image(x * 32, y * 32, "rightedge").setOrigin(0, 0).setScale(2, 2);
          } else if (y === 2) {
            // Borde superior
            this.add.image(x * 32, y * 32, "topedge").setOrigin(0, 0).setScale(2, 2);
          } else if (y === mapHeight - 3) {
            // Borde inferior
            this.add.image(x * 32, y * 32, "bottomedge").setOrigin(0, 0).setScale(2, 2);
          } else {
            // Césped interior
            this.add.image(x * 32, y * 32, "grass").setOrigin(0, 0).setScale(2, 2);
          }
        }
      }
    }

    // Decoración: flores aleatorias y caminos entre zonas
    this.placeFlowers();
    this.createPaths();

    // --- FUENTE DECORATIVA ---
    // Animación del agua de la fuente
    this.anims.create({
      key: "fountain_anim",
      frames: this.anims.generateFrameNumbers("fountain", { start: 0, end: 2 }),
      frameRate: 9,
      repeat: -1,
    });

    const fountain = this.physics.add
      .sprite(worldSize.width / 2 - 250, worldSize.height / 2 - 300, "fountain")
      .setOrigin(0.5).setScale(5).setDepth(1).setImmovable(true);

    // Colisión circular para la fuente (más precisa que rectangular)
    fountain.body.setCircle(20);
    fountain.body.setOffset(4, 4);
    fountain.anims.play("fountain_anim", true);

    // --- PORTAL MÁGICO (Enlace a Web Principal) ---
    this.createPortal(worldSize.width / 2 - 250 + 180, worldSize.height / 2 - 300);

    // --- ANIMACIONES DEL JUGADOR ---
    // 4 direcciones de caminata, cada una con 4 frames a 8fps en bucle
    this.anims.create({
      key: "walk_forward",
      frames: this.anims.generateFrameNumbers("player-forward", { start: 0, end: 3 }),
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: "walk_backward",
      frames: this.anims.generateFrameNumbers("player-backward", { start: 0, end: 3 }),
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: "walk_right",
      frames: this.anims.generateFrameNumbers("player-right", { start: 0, end: 3 }),
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: "walk_left",
      frames: this.anims.generateFrameNumbers("player-left", { start: 0, end: 3 }),
      frameRate: 8, repeat: -1,
    });

    // FX: animaciones de carga y aura para el efecto especial
    this.anims.create({
      key: "fx-carga",
      frames: this.anims.generateFrameNumbers("fx-carga", { start: 0, end: 7 }),
      frameRate: 10, repeat: -1,
    });
    this.anims.create({
      key: "fx-aura",
      frames: this.anims.generateFrameNumbers("fx-aura", { start: 0, end: 4 }),
      frameRate: 10, repeat: -1,
    });

    // --- CREACIÓN DEL PERSONAJE (JUGADOR) ---
    // Verificamos que las texturas estén cargadas antes de crear el sprite
    const playerLoaded =
      this.textures.exists('player-forward') &&
      this.textures.exists('player-backward') &&
      this.textures.exists('player-left') &&
      this.textures.exists('player-right');

    if (!playerLoaded) {
      console.error('ERROR: texturas del jugador no cargadas. Fallback creado.');
      if (this.textures.exists('player-right')) {
        this.player = this.physics.add.sprite(worldSize.width / 2, worldSize.height / 2, 'player-right', 0);
      } else {
        this.player = this.physics.add.sprite(worldSize.width / 2, worldSize.height / 2, 'player-forward', 0);
      }
      this.player.setScale(3, 3);
      this.player.setDepth(3);
    } else {
      this.player = this.physics.add.sprite(
        worldSize.width / 2, worldSize.height / 2, 'player-forward', 0
      );
      this.player.setScale(3, 3);
      this.player.setDepth(3);
      this.player.setOrigin(0.5, 0.5);
    }

    if (this.spawnFromHouse) {
      const doorX = worldSize.width / 2 + 500;
      const doorY = worldSize.height / 2 - 250 + 110;
      this.player.setPosition(doorX, doorY + 60); 
      this.player.setTexture('player-forward', 0); // Mirando hacia abajo al salir
    }

    // Ajustar la hitbox del jugador: más pequeña que el sprite visual
    // Solo la parte inferior (pies) tiene colisión, para que el personaje pueda pasar
    // por debajo de elementos visuales como copas de árboles
    if (this.player && this.player.body) {
      const spriteWidth = this.player.width;
      const spriteHeight = this.player.height;
      const bodyWidth = spriteWidth * 0.4;
      const bodyHeight = spriteHeight * 0.3;
      const bodyOffsetX = spriteWidth * 0.3;
      const bodyOffsetY = spriteHeight * 0.65;

      this.player.body.setSize(bodyWidth, bodyHeight);
      this.player.body.setOffset(bodyOffsetX, bodyOffsetY);
      this.player.body.setCollideWorldBounds(true);
      this.player.body.setBounce(0);
    }

    // Colisiones del jugador con agua y fuente
    this.physics.add.collider(this.player, this.waterTiles);
    this.physics.add.collider(this.player, fountain);

    // Configurar límites del mundo y cámara
    this.physics.world.setBounds(0, 0, worldSize.width, worldSize.height);
    this.player.setCollideWorldBounds(true);

    // La cámara sigue al jugador suavemente (lerp 0.1)
    this.cameras.main.setBounds(0, 0, worldSize.width, worldSize.height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(100, 100); // Zona muerta para evitar vibración
    /*this.cameras.main.setZoom(0.8);  // Ej: 20% más lejos (más mapa)
    */

    // --- ELEMENTOS DEL MUNDO ---
    // Cartel central y cartel de zona de tecnologías
    this.createSign(worldSize.width / 2, worldSize.height / 2 - 100, portfolioConfig.centerSign);
    this.createSign(worldSize.width / 2, worldSize.height - 300, "Zona de Tecnologías y retos:\nDocker, Node, Phaser, UI");

    // Crear zonas decorativas e interactivas
    this.createAnimeGallery();
    this.createSkillsZone();
    this.createHouse();
    this.createMailbox();

    // Evento keyup: detener animación del jugador al soltar teclas
    this.input.keyboard.on("keyup", () => {
      if (this.player && this.player.anims && this.player.anims.currentAnim) {
        const lastFrameIndex = this.player.anims.currentAnim.frames.length - 1;
        this.player.anims.stop();
        if (this.player.setFrame) this.player.setFrame(lastFrameIndex);
      }
    });

    // Mostrar popup de bienvenida al iniciar el juego
    if (!this.spawnFromHouse) {
      this.showWelcomePopup();
    }
  }

  // ═══════════════════════════════════════════════════════
  // UPDATE LOOP (se ejecuta 60 veces por segundo)
  // ═══════════════════════════════════════════════════════

  /**
   * update() se ejecuta en cada frame del juego.
   * Aquí se procesa el movimiento, las interacciones y los efectos visuales.
   */
  update() {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
        this.toggleSettingsMenu();
    }

    if (this.isPaused) {
        if (this.player && this.player.body) this.player.setVelocity(0, 0);
        return;
    }

    const speed = 200; // Velocidad de movimiento del personaje

    // Si el jugador no existe o su cuerpo no está listo, salimos
    if (!this.player || !this.player.body) {
      console.warn('GameScene.update: player no existe o su cuerpo no está listo');
      return;
    }

    // Reiniciar velocidad en cada frame (el personaje se para si no pulsamos nada)
    this.player.setVelocity(0, 0);

    // --- MOVIMIENTO MÓVIL (JOYSTICK) ---
    if (isMobileDevice() && this.stickData) {
      const direction = this.stickData.cardinalDirection;

      // Rastrear dirección del personaje según el joystick
      if (direction.includes("N")) this.facingDirection = "up";
      if (direction.includes("S")) this.facingDirection = "down";
      if (direction.includes("E")) this.facingDirection = "right";
      if (direction.includes("W")) this.facingDirection = "left";

      if (direction !== "C") { // "C" = centro (sin movimiento)
        let velocityX = 0, velocityY = 0, animation = null;

        if (direction.includes("N")) { velocityY = -speed; animation = "walk_backward"; }
        if (direction.includes("S")) { velocityY = speed; animation = "walk_forward"; }
        if (direction.includes("E")) { velocityX = speed; animation = "walk_right"; }
        if (direction.includes("W")) { velocityX = -speed; animation = "walk_left"; }

        // Normalizar velocidad diagonal (raíz de 2 / 2 ≈ 0.707)
        if (velocityX !== 0 && velocityY !== 0) {
          const normalizedSpeed = speed * 0.707;
          velocityX = velocityX > 0 ? normalizedSpeed : -normalizedSpeed;
          velocityY = velocityY > 0 ? normalizedSpeed : -normalizedSpeed;
        }

        this.player.setVelocity(velocityX, velocityY);
        if (animation) this.player.anims.play(animation, true);
      } else {
        this.player.anims.stop();
      }
    } else {
      // --- MOVIMIENTO ESCRITORIO (TECLADO) ---
      // Soporta flechas y WASD simultáneamente
      let velocityX = 0, velocityY = 0, animation = null;

      // Movimiento vertical
      if (this.cursors.up.isDown || this.wasd.up.isDown) {
        velocityY = -speed; animation = "walk_backward"; this.facingDirection = "up";
      } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
        velocityY = speed; animation = "walk_forward"; this.facingDirection = "down";
      }

      // Movimiento horizontal
      if (this.cursors.left.isDown || this.wasd.left.isDown) {
        velocityX = -speed; animation = "walk_left"; this.facingDirection = "left";
      } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        velocityX = speed; animation = "walk_right"; this.facingDirection = "right";
      }

      // Normalizar diagonal
      if (velocityX !== 0 && velocityY !== 0) {
        const normalizedSpeed = speed * 0.707;
        velocityX = velocityX > 0 ? normalizedSpeed : -normalizedSpeed;
        velocityY = velocityY > 0 ? normalizedSpeed : -normalizedSpeed;
        // Prioridad horizontal para la dirección del personaje
        if (velocityX < 0) this.facingDirection = "left";
        else this.facingDirection = "right";
      }

      this.player.setVelocity(velocityX, velocityY);
      if (animation) this.player.anims.play(animation, true);
    }

    // --- LIMPIEZA DE INTERACCIONES ---

    // 1. Carteles o Buzón
    if (this.nearbySign || this.nearbyMailbox) {
      let isNearAny = false;

      if (this.nearbySign) {
        if (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.nearbySign.x, this.nearbySign.y) < 100) isNearAny = true;
        else this.nearbySign = null;
      }

      if (this.nearbyMailbox && !isNearAny) {
           // Usamos 150 porque el mailbox está fijo en bottom
           if (Phaser.Math.Distance.Between(this.player.x, this.player.y, worldSize.width / 2, worldSize.height - 150) < 100) isNearAny = true;
           else this.nearbyMailbox = false;
      }

      if (!isNearAny) {
        this.clearEInstruction();
        if (this.dialogActive) this.closeRPGDialog();
      }
    }

    // 3. Detección de tecla E
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      if (this.welcomePopupActive && this.welcomePopupClose) {
        this.welcomePopupClose();
      } else if (this.contactActive) {
        this.closeContactMenu();
      } else if (this.dialogActive) {
        this.closeRPGDialog();
      } else if (this.nearbyMailbox) {
        this.openContactMenu();
      } else if (this.nearbySign) {
        this.showRPGDialog(this.nearbySign);
      }
    }

    // 4. Detección de tecla ESPACIO: activar efecto de carga + proyectil
    if (Phaser.Input.Keyboard.JustDown(this.fxKey) && !this.fxActive) {
      this.activateFX();
    }

    // 5. Detección de tecla Z: cambiar zoom entre 0.8 y 1
    if (Phaser.Input.Keyboard.JustDown(this.zoomKey)) {
      this.currentZoom = this.currentZoom === 1 ? 0.8 : 1;
      this.cameras.main.setZoom(this.currentZoom);
    }

    // 5. Anime: borrar info del proyecto al alejarse
    if (this.animeTextActive && this.currentAnimeChar) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.currentAnimeChar.x, this.currentAnimeChar.y
      );
      if (distance > 150) {
        if (this.animeText) this.animeText.destroy();
        this.animeTextActive = false;
      }
    }

    // 6. Skills: borrar info de habilidad al alejarse
    if (this.skillTextActive && this.currentSkillContainer) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, this.currentSkillContainer.x, this.currentSkillContainer.y
      );
      if (distance > 80) {
        this.clearSkillInfo();
      }
    }

    // --- EFECTO DE RASTRO / POLVO (SOLO EN CAMINOS) ---
    // Si el jugador se mueve y está pisando un camino, genera partículas de polvo
    if (
      this.time.now > (this.lastFootprintTime || 0) + 150 &&
      (Math.abs(this.player.body.velocity.x) > 10 || Math.abs(this.player.body.velocity.y) > 10)
    ) {
      const isOnPath = this.isPlayerOnPath();
      if (isOnPath) {
        let dustX = this.player.x, dustY = this.player.y + 15;
        let particleCount = 4, particleSize = { min: 3, max: 6 };
        let particleSpread = { x: 10, y: 4 }, isVertical = false;

        // Ajustar posición del polvo según dirección de caminata
        if (this.player.anims.currentAnim) {
          const key = this.player.anims.currentAnim.key;
          if (key === "walk_backward") { dustY += 15; isVertical = true; particleCount = 6; }
          else if (key === "walk_left") { dustX += 8; dustY += 10; particleCount = 5; }
          else if (key === "walk_right") { dustX -= 8; dustY += 10; particleCount = 5; }
          else if (key === "walk_forward") { dustY -= 15; isVertical = true; particleCount = 6; }
        }

        if (isVertical) {
          particleSize = { min: 3, max: 7 };
          particleSpread = { x: 12, y: 2 };
        }

        // Crear partículas circulares de color arena
        for (let i = 0; i < particleCount; i++) {
          const dustParticle = this.add
            .circle(
              dustX + Phaser.Math.Between(-particleSpread.x, particleSpread.x),
              dustY + Phaser.Math.Between(-particleSpread.y, particleSpread.y),
              Phaser.Math.Between(particleSize.min, particleSize.max),
              isVertical ? 0xc2a078 : 0xd2b48c,
              Phaser.Math.FloatBetween(isVertical ? 0.4 : 0.3, isVertical ? 0.8 : 0.7)
            )
            .setOrigin(0.5)
            .setDepth(isVertical ? 2.5 : 0.65);

          // Animación de desvanecimiento y ascenso
          this.tweens.add({
            targets: dustParticle,
            alpha: 0,
            y: dustY - Phaser.Math.Between(isVertical ? 12 : 8, isVertical ? 20 : 16),
            x: dustX + Phaser.Math.Between(-15, 15),
            scale: { from: 1, to: isVertical ? 2.5 : 2 },
            duration: Phaser.Math.Between(400, 700),
            ease: "Power2",
            onComplete: () => dustParticle.destroy(),
          });
        }
        this.lastFootprintTime = this.time.now;
      }
    }

    // Actualizar posición del sprite de carga (sigue al jugador)
    if (this.chargeSprite && this.player) {
      this.chargeSprite.x = this.player.x;
      this.chargeSprite.y = this.player.y;
    }

    // Actualizar proyectil FX (se mueve en la dirección que miraba el jugador)
    if (this.fxProjectile && this.player) {
      const projSpeed = 350;
      let vx = 0, vy = 0;
      if (this.fxProjectileDir === "up") vy = -projSpeed;
      else if (this.fxProjectileDir === "down") vy = projSpeed;
      else if (this.fxProjectileDir === "left") vx = -projSpeed;
      else if (this.fxProjectileDir === "right") vx = projSpeed;

      this.fxProjectile.x += vx * (1 / 60);
      this.fxProjectile.y += vy * (1 / 60);

      // Destruir si sale del mapa
      if (this.fxProjectile.x < -100 || this.fxProjectile.x > worldSize.width + 100 ||
          this.fxProjectile.y < -100 || this.fxProjectile.y > worldSize.height + 100) {
        this.fxProjectile.destroy();
        this.fxProjectile = null;
        this.fxActive = false;
      }
    }
  }

  // ═══════════════════════════════════════════════════════
  // MENÚ DE AJUSTES EN JUEGO (PAUSA)
  // ═══════════════════════════════════════════════════════
  toggleSettingsMenu() {
      if (this.settingsPanel) {
          // Si ya existe y está activo, lo cerramos
          this.isPaused = false;
          this.tweens.add({
              targets: this.settingsPanel,
              scale: 0,
              duration: 300,
              ease: 'Back.in',
              onComplete: () => {
                  this.settingsPanel.destroy();
                  this.settingsPanel = null;
              }
          });
          return;
      }

      // Pausamos
      this.isPaused = true;
      if (this.player && this.player.anims) this.player.anims.stop();

      const { width, height } = this.scale;
      const cam = this.cameras.main;

      this.settingsPanel = this.add.container(cam.scrollX + width / 2, cam.scrollY + height / 2).setDepth(200);
      
      const overlay = this.add.rectangle(0, 0, width * 2, height * 2, 0x000000, 0.7).setInteractive();

      const box = this.add.graphics();
      box.fillStyle(0x0a0f1d, 0.95);
      box.lineStyle(4, 0xd4af37, 1);
      box.fillRoundedRect(-200, -150, 400, 300, 10);
      box.strokeRoundedRect(-200, -150, 400, 300, 10);

      const title = this.add.text(0, -110, '⚙️ AJUSTES DEL SISTEMA', {
          font: 'bold 28px "MedievalSharp"',
          fill: '#d4af37'
      }).setOrigin(0.5);

      // --- SECCIÓN DE AUDIO EN SETTINGS ---
      const audioLabel = this.add.text(-150, -40, 'Música de Fondo:', {
          font: '18px "MedievalSharp"',
          fill: '#e8dcac'
      }).setOrigin(0, 0.5);

      const speakerIcon = this.add.text(140, -40, this.sound.mute ? 'MUTEADO' : 'ACTIVADO', {
          font: 'bold 18px Arial',
          fill: this.sound.mute ? '#ff4d4d' : '#2ecc71', // Rojo suave o Verde
          backgroundColor: '#1b263b',
          padding: { x: 12, y: 8 }
      }).setInteractive({ useHandCursor: true }).setOrigin(0.5);

      speakerIcon.on('pointerdown', () => {
          const isMute = !this.sound.mute;
          this.sound.setMute(isMute); // Aplicar propiedad
          speakerIcon.setText(isMute ? 'MUTEADO' : 'ACTIVADO');
          speakerIcon.setStyle({ 
              fill: isMute ? '#ff4d4d' : '#2ecc71',
              backgroundColor: '#1b263b'
          });
      });

      const info = this.add.text(0, 50, '[Pulsa ESC para volver al juego]', {
          font: '18px "MedievalSharp"',
          fill: '#aaaaaa'
      }).setOrigin(0.5);

      this.settingsPanel.add([overlay, box, title, audioLabel, speakerIcon, info]);
      this.settingsPanel.setScale(0);

      this.tweens.add({ targets: this.settingsPanel, scale: 1, duration: 400, ease: 'Back.out' });
  }

  // ═══════════════════════════════════════════════════════
  // POPUP DE BIENVENIDA
  // ═══════════════════════════════════════════════════════

  /**
   * Muestra un popup de bienvenida estilo RPG con pergamino mágico,
   * título animado, mensajes de guía y un botón "COMENZAR AVENTURA".
   * Se puede cerrar con click o con la tecla E.
   */
  showWelcomePopup() {
    const cam = this.cameras.main;
    const W = cam.width, H = cam.height;
    const cx = W / 2, cy = H / 2;

    // Paleta de colores del popup
    const COLORS = {
      PARCHMENT: 0xf5e6c8, PARCHMENT_DARK: 0xd4c4a8, PARCHMENT_LIGHT: 0xfff8e8,
      WOOD_DARK: 0x3d2817, WOOD_MID: 0x5a3d2a, WOOD_LIGHT: 0x7a5a4a,
      SAPPHIRE: 0x1e3a5f, SAPPHIRE_LIGHT: 0x4a90d9, RUBY: 0x8b2635, EMERALD: 0x2d5a3d,
      GOLD: 0xd4af37, GOLD_LIGHT: 0xf0d878, MAGIC_BLUE: 0x64b5f6, MAGIC_PURPLE: 0x9c64b5,
      SHADOW: 0x1a0f0a, NIGHT: 0x0a1420
    };

    // Overlay oscuro semitransparente con gradiente
    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x0a1420, 0x0a1420, 0x1a2a3a, 0x1a2a3a, 0.85);
    overlay.fillRect(0, 0, W, H);
    overlay.setScrollFactor(0).setDepth(2000).setAlpha(0);

    // Contenedor principal del popup
    const panel = this.add.container(cx, cy - 60)
      .setDepth(2001).setScrollFactor(0).setAlpha(0).setScale(0.8);

    // Marco de pergamino con bordes de madera y esquinas ornamentales
    const pw = 480, ph = 340;
    const frame = this.add.graphics();
    frame.fillStyle(COLORS.SHADOW, 0.4);
    frame.fillRect(-pw / 2 + 8, -ph / 2 + 8, pw, ph);
    frame.fillStyle(COLORS.WOOD_DARK, 1);
    frame.fillRect(-pw / 2, -ph / 2, pw, ph);
    frame.fillStyle(COLORS.WOOD_MID, 1);
    frame.fillRect(-pw / 2 + 6, -ph / 2 + 6, pw - 12, ph - 12);

    // Esquinas ornamentales con gemas
    const drawOrnament = (ox, oy, rotation) => {
      const orn = this.add.graphics();
      orn.x = ox; orn.y = oy; orn.rotation = rotation;
      orn.fillStyle(COLORS.GOLD, 1); orn.fillRect(-12, -12, 24, 24);
      orn.fillStyle(COLORS.WOOD_DARK, 1); orn.fillRect(-8, -2, 16, 4); orn.fillRect(-2, -8, 4, 16);
      orn.fillStyle(COLORS.RUBY, 1); orn.fillRect(-4, -4, 8, 8);
      orn.fillStyle(COLORS.GOLD_LIGHT, 0.8); orn.fillRect(-2, -2, 3, 3);
      panel.add(orn);
    };
    drawOrnament(-pw / 2 + 15, -ph / 2 + 15, 0);
    drawOrnament(pw / 2 - 15, -ph / 2 + 15, Math.PI / 2);
    drawOrnament(-pw / 2 + 15, ph / 2 - 15, -Math.PI / 2);
    drawOrnament(pw / 2 - 15, ph / 2 - 15, Math.PI);

    // Fondo de pergamino con efecto de enrollamiento
    frame.fillStyle(COLORS.PARCHMENT, 1);
    frame.fillRect(-pw / 2 + 12, -ph / 2 + 12, pw - 24, ph - 24);
    frame.fillStyle(COLORS.PARCHMENT_DARK, 1);
    frame.fillRect(-pw / 2 + 12, -ph / 2 + 12, pw - 24, 8);
    frame.fillRect(-pw / 2 + 12, ph / 2 - 20, pw - 24, 8);
    frame.lineStyle(2, COLORS.PARCHMENT_DARK, 0.6);
    frame.strokeRect(-pw / 2 + 20, -ph / 2 + 30, pw - 40, ph - 60);
    panel.add(frame);

    // Brillo mágico animado detrás del título
    const glowBg = this.add.graphics();
    glowBg.fillStyle(COLORS.MAGIC_BLUE, 0.15);
    glowBg.fillCircle(0, -ph / 2 + 55, 80);
    panel.add(glowBg);
    this.tweens.add({
      targets: glowBg, alpha: { from: 0.1, to: 0.25 }, scale: { from: 1, to: 1.15 },
      duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Título con sombra y brillo dorado
    const titleY = -ph / 2 + 55;
    const titleShadow = this.add.text(2, titleY + 2, "BIENVENIDO AVENTURERO", {
      font: "bold 22px 'MedievalSharp'", fill: "#3d2817", stroke: "#1a0f0a", strokeThickness: 4, letterSpacing: 2
    }).setOrigin(0.5);
    panel.add(titleShadow);

    const title = this.add.text(0, titleY, "BIENVENIDO AVENTURERO", {
      font: "bold 22px 'MedievalSharp'", fill: "#d4af37", stroke: "#1e3a5f", strokeThickness: 3, letterSpacing: 2
    }).setOrigin(0.5);
    panel.add(title);

    const titleShine = this.add.text(0, titleY, "BIENVENIDO AVENTURERO", {
      font: "bold 22px 'MedievalSharp'", fill: "#f0d878", letterSpacing: 2
    }).setOrigin(0.5).setAlpha(0.3);
    panel.add(titleShine);
    this.tweens.add({
      targets: titleShine, alpha: { from: 0.1, to: 0.5 }, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Separador ornamental con gemas
    const dividerY = titleY + 35;
    const divider = this.add.graphics();
    divider.lineStyle(2, COLORS.GOLD, 0.8);
    divider.lineBetween(-80, dividerY, 80, dividerY);
    divider.fillStyle(COLORS.SAPPHIRE, 1);
    divider.fillCircle(-90, dividerY, 5); divider.fillCircle(90, dividerY, 5);
    divider.fillStyle(COLORS.GOLD_LIGHT, 1);
    divider.fillCircle(-90, dividerY - 1, 2); divider.fillCircle(90, dividerY - 1, 2);
    panel.add(divider);

    // Textos de bienvenida y guía
    const fullWelcome = portfolioConfig.welcomeMessage;
    const fullGuide = isMobileDevice()
      ? `${portfolioConfig.guideMessage}\nUsa el joystick para explorar`
      : `${portfolioConfig.guideMessage}\nUsa WASD o Flechas para moverte\nPresiona Z para cambiar el zoom`;

    const msgText = this.add.text(0, dividerY + 50, fullWelcome, {
      font: "16px 'MedievalSharp'", fill: "#3d2817", align: "center", lineSpacing: 8, wordWrap: { width: pw - 80 }
    }).setOrigin(0.5);
    panel.add(msgText);

    const guideText = this.add.text(0, dividerY + 100, fullGuide, {
      font: "13px 'MedievalSharp'", fill: "#5a4a3a", align: "center", lineSpacing: 6, wordWrap: { width: pw - 100 }
    }).setOrigin(0.5);
    panel.add(guideText);

    // Botón "COMENZAR AVENTURA" con efecto de gema
    const btnW = 260, btnH = 44;
    const btnY = ph / 2 - 55;
    const btnContainer = this.add.container(0, btnY);
    let pressed = false;

    const btnBg = this.add.graphics();
    btnContainer.add(btnBg);
    const drawMagicBtn = (hover, down) => {
      btnBg.clear();
      const dy = down ? 3 : 0;
      if (!down) { btnBg.fillStyle(COLORS.SHADOW, 0.5); btnBg.fillRect(-btnW / 2 + 4, 4, btnW, btnH); }
      const baseColor = hover ? COLORS.SAPPHIRE_LIGHT : COLORS.SAPPHIRE;
      btnBg.fillStyle(baseColor, 1); btnBg.fillRect(-btnW / 2, dy, btnW, btnH - (down ? 3 : 0));
      btnBg.fillStyle(0xffffff, 0.3); btnBg.fillRect(-btnW / 2 + 4, dy + 4, btnW - 8, 8);
      btnBg.lineStyle(3, hover ? COLORS.GOLD_LIGHT : COLORS.GOLD, 1);
      btnBg.strokeRect(-btnW / 2, dy, btnW, btnH - (down ? 3 : 0));
      btnBg.fillStyle(COLORS.GOLD, 1);
      btnBg.fillRect(-btnW / 2 - 2, dy + 2, 6, 6); btnBg.fillRect(btnW / 2 - 4, dy + 2, 6, 6);
      btnBg.fillRect(-btnW / 2 - 2, dy + btnH - 8, 6, 6); btnBg.fillRect(btnW / 2 - 4, dy + btnH - 8, 6, 6);
    };
    drawMagicBtn(false, false);

    const btnLabel = this.add.text(0, btnH / 2, "✨ COMENZAR AVENTURA ✨", {
      font: "bold 14px 'MedievalSharp'", fill: "#ffffff", letterSpacing: 2, stroke: "#1e3a5f", strokeThickness: 2
    }).setOrigin(0.5);
    btnContainer.add(btnLabel);

    // Decoraciones laterales del botón
    const leftStar = this.add.text(-btnW / 2 - 20, btnH / 2, "◆", { font: "16px 'MedievalSharp'", fill: "#d4af37" }).setOrigin(0.5);
    const rightStar = this.add.text(btnW / 2 + 20, btnH / 2, "◆", { font: "16px 'MedievalSharp'", fill: "#d4af37" }).setOrigin(0.5);
    btnContainer.add([leftStar, rightStar]);
    panel.add(btnContainer);

    // Animación de pulso de las estrellas
    this.tweens.add({
      targets: [leftStar, rightStar], scale: { from: 1, to: 1.3 }, alpha: { from: 0.6, to: 1 },
      duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Zona interactiva invisible sobre el botón
    const btnZone = this.add.zone(cx, cy + btnY + 15, btnW + 40, btnH + 20)
      .setScrollFactor(0).setDepth(3000).setInteractive({ useHandCursor: true });

    btnZone.on('pointerover', () => { if (pressed) return; drawMagicBtn(true, false); btnLabel.setStyle({ fill: "#f0d878" }); });
    btnZone.on('pointerout', () => { if (pressed) return; drawMagicBtn(false, false); btnLabel.setStyle({ fill: "#ffffff" }); });

    // Animación de entrada del popup
    this.tweens.add({ targets: overlay, alpha: 1, duration: 400, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: panel, alpha: 1, y: cy, scale: 1, duration: 800, ease: 'Back.out', delay: 200 });

    // Función de cierre reutilizable (click + tecla E)
    this.welcomePopupActive = true;
    this.welcomePopupClose = () => {
      if (pressed) return;
      pressed = true;
      drawMagicBtn(true, true);
      btnLabel.setY(btnH / 2 + 3);

      // Sonido mágico de cierre
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        const ctx = new AC(), o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(440, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        g.gain.setValueAtTime(0.1, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.3);
      }

      // Destello mágico al cerrar
      const flash = this.add.graphics();
      flash.fillStyle(COLORS.MAGIC_BLUE, 0.5); flash.fillRect(0, 0, W, H); flash.setDepth(3001);
      this.tweens.add({ targets: flash, alpha: 0, duration: 400, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });

      // Cierre del popup con animación
      this.time.delayedCall(150, () => {
        this.tweens.add({
          targets: [overlay, panel], alpha: 0, scale: 1.1, duration: 400, ease: 'Quad.easeIn',
          onComplete: () => { overlay.destroy(); panel.destroy(); btnZone.destroy(); this.welcomePopupActive = false; }
        });
      });
    };

    // Click en el botón
    btnZone.on('pointerdown', () => { this.welcomePopupClose(); });
  }

  // ═══════════════════════════════════════════════════════
  // DIÁLOGO RPG (CARTELES)
  // ═══════════════════════════════════════════════════════

  /**
   * Muestra un cuadro de diálogo estilo RPG cuando el jugador pulsa E cerca de un cartel.
   * Usa la imagen DialogBox.png como fondo y Arrow.png como indicador de continuar.
   * El texto aparece letra por letra (efecto typewriter).
   */
  showRPGDialog(sign) {
    // Si ya hay un diálogo abierto, cerrarlo primero
    if (this.dialogActive) this.closeRPGDialog();

    this.dialogActive = true;
    this.currentDialogSign = sign;

    const cam = this.cameras.main;
    const W = cam.width, H = cam.height;
    const cx = W / 2, cy = H - 120; // Posición en la parte inferior de la pantalla
    this.fullDialogMessage = sign.message;

    // Contenedor principal del diálogo (fijo en pantalla, no se mueve con la cámara)
    this.dialogContainer = this.add.container(cx, cy).setScrollFactor(0).setDepth(2000);

    // Overlay oscuro semitransparente
    this.dialogOverlay = this.add.graphics().setScrollFactor(0).setDepth(1999);
    this.dialogOverlay.fillStyle(0x000000, 0.35);
    this.dialogOverlay.fillRect(0, 0, W, H);

    // Fondo del diálogo usando la imagen DialogBox.png (300x58 original)
    const boxW = 600, boxH = 116; // Escala 2x
    const dialogBoxWidth = 300, dialogBoxHeight = 58;
    const scaleX = boxW / dialogBoxWidth, scaleY = 2;

    // Centro del cuadro de diálogo
    const dialogBg = this.add.image(0, 0, "dialog-box").setScale(scaleX, scaleY).setOrigin(0.5);
    this.dialogContainer.add(dialogBg);

    // Bordes izquierdo y derecho recortados para dar efecto de continuidad
    const leftEdge = this.add.image(-boxW / 2 + 20, 0, "dialog-box")
      .setScale(scaleX, scaleY).setOrigin(0.5).setCrop(0, 0, 40, dialogBoxHeight);
    this.dialogContainer.add(leftEdge);

    const rightEdge = this.add.image(boxW / 2 - 20, 0, "dialog-box")
      .setScale(scaleX, scaleY).setOrigin(0.5).setCrop(dialogBoxWidth - 40, 0, 40, dialogBoxHeight);
    this.dialogContainer.add(rightEdge);

    // Texto del mensaje con fuente personalizada (DialogFont)
    // letterSpacing añade espacio entre letras para que las mayúsculas se lean mejor
    const dialogText = this.add.text(0, -boxH / 2 + 50, "", {
      fontFamily: "'DialogFont', 'MedievalSharp', sans-serif",
      fontSize: "16px", fill: "#000000", align: "center",
      wordWrap: { width: boxW - 60 }, lineSpacing: 4, letterSpacing: 2
    }).setOrigin(0.5, 0);
    this.dialogContainer.add(dialogText);
    this.dialogText = dialogText;

    // Iniciar efecto typewriter (letra por letra)
    this.typewriterIndex = 0;
    this.startTypewriterEffect();

    // Flecha indicadora de continuar (animación de parpadeo)
    const arrowX = boxW / 2 - 25, arrowY = boxH / 2 - 15;
    const arrow = this.add.image(arrowX, arrowY, "dialog-arrow").setScale(1.5).setOrigin(0.5);
    this.dialogContainer.add(arrow);
    this.tweens.add({
      targets: arrow, alpha: { from: 1, to: 0.3 }, y: arrowY + 5,
      duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Animación de entrada
    this.dialogContainer.setScale(0.8).setAlpha(0);
    this.tweens.add({ targets: this.dialogContainer, scale: 1, alpha: 1, duration: 300, ease: 'Back.out' });
  }

  /**
   * Efecto typewriter: muestra el texto letra por letra con un intervalo de 30ms.
   * Cada 3 letras reproduce un sonido suave de escritura.
   */
  startTypewriterEffect() {
    if (!this.dialogActive || !this.fullDialogMessage) return;
    if (this.typewriterEvent) { this.typewriterEvent.remove(); }

    this.typewriterEvent = this.time.addEvent({
      delay: 30,
      callback: () => {
        if (this.typewriterIndex < this.fullDialogMessage.length) {
          this.dialogText.setText(this.fullDialogMessage.substring(0, this.typewriterIndex + 1));
          this.typewriterIndex++;
          if (this.typewriterIndex % 3 === 0) this.playTypewriterSound();
        } else {
          if (this.typewriterEvent) { this.typewriterEvent.remove(); this.typewriterEvent = null; }
        }
      },
      callbackScope: this, loop: true
    });
  }

  /**
   * Sonido suave tipo "click" para el efecto typewriter.
   * Usa Web Audio API para generar un tono sine descendente muy breve.
   */
  playTypewriterSound() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      const ctx = new AC(), o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.setValueAtTime(800, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);
      g.gain.setValueAtTime(0.02, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.03);
    } catch (e) {}
  }

  /**
   * Cierra el diálogo RPG con animación de salida.
   * Limpia el evento typewriter y destruye todos los elementos del diálogo.
   */
  closeRPGDialog() {
    if (!this.dialogActive) return;
    if (this.typewriterEvent) { this.typewriterEvent.remove(); this.typewriterEvent = null; }

    this.tweens.add({
      targets: this.dialogContainer, scale: 0.9, alpha: 0, duration: 200, ease: 'Quad.easeIn',
      onComplete: () => {
        if (this.dialogContainer) { this.dialogContainer.destroy(); this.dialogContainer = null; }
        if (this.dialogOverlay) { this.dialogOverlay.destroy(); this.dialogOverlay = null; }
        this.dialogActive = false;
        this.currentDialogSign = null;
        this.currentNPC = null;
        this.fullDialogMessage = null;
        this.typewriterIndex = 0;
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  // CARTELES Y PROXIMIDAD
  // ═══════════════════════════════════════════════════════

  /**
   * Crea un cartel físico en el mapa con una zona de proximidad invisible.
   * Cuando el jugador se acerca, aparece la indicación "PRESIONA E".
   * @param {number} x - Posición X del cartel
   * @param {number} y - Posición Y del cartel
   * @param {string} message - Mensaje que se muestra al interactuar
   */
  createSign(x, y, message) {
    const sign = this.physics.add.sprite(x, y, "sign")
      .setOrigin(0.5).setScale(3).setDepth(1).setImmovable(true);
    // Hitbox pequeña: solo la base del poste tiene colisión
    sign.body.setSize(16, 8); sign.body.setOffset(0, 8);
    sign.message = message;
    this.physics.add.collider(this.player, sign);

    // Zona de proximidad invisible (80x80px) alrededor del cartel
    const proximityZone = this.add.zone(x, y, 80, 80);
    this.physics.world.enable(proximityZone);
    proximityZone.body.setAllowGravity(false);
    proximityZone.body.setImmovable(true);
    proximityZone.signRef = sign;

    // Detectar cuando el jugador entra en la zona
    this.physics.add.overlap(this.player, proximityZone, this.onSignProximity, null, this);
    return sign;
  }

  /**
   * Se ejecuta cuando el jugador entra en la zona de proximidad de un cartel.
   * Guarda la referencia al cartel cercano y muestra la indicación "E".
   */
  onSignProximity(player, zone) {
    if (this.nearbySign === zone.signRef) return; // Evitar llamadas duplicadas
    this.nearbySign = zone.signRef;
    this.nearbyZone = zone;
    this.showEInstruction(zone.signRef);
  }

  /**
   * Muestra la indicación "PRESIONA E" sobre el cartel con animación de pulso y flotación.
   */
  showEInstruction(sign) {
    if (this.eInstruction) this.eInstruction.destroy();

    this.eInstruction = this.add.container(sign.x, sign.y - 50);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.9); bg.fillRoundedRect(-40, -15, 80, 30, 6);
    bg.lineStyle(2, 0xd4af37, 1); bg.strokeRoundedRect(-40, -15, 80, 30, 6);

    const text = this.add.text(0, 0, "PRESIONA E", {
      font: "bold 12px 'MedievalSharp'", fill: "#d4af37", stroke: "#1a1a2e", strokeThickness: 2
    }).setOrigin(0.5);

    this.eInstruction.add([bg, text]);
    this.eInstruction.setDepth(100);

    // Animación de pulso
    this.tweens.add({
      targets: this.eInstruction, scale: { from: 1, to: 1.1 },
      duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
    // Animación de flotación
    this.tweens.add({
      targets: this.eInstruction, y: sign.y - 55,
      duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });
  }

  /**
   * Limpia la indicación "E" cuando el jugador se aleja del cartel.
   */
  clearEInstruction() {
    if (this.eInstruction) { this.eInstruction.destroy(); this.eInstruction = null; }
    this.nearbySign = null;
    this.nearbyZone = null;
  }

  // ═══════════════════════════════════════════════════════
  // GALERÍA DE ANIME (PROYECTOS)
  // ═══════════════════════════════════════════════════════

  /**
   * Genera texturas pixeladas para NPCs estilo RPG medieval.
   * Crea: Sabio, Mercader, Guerrero y Aldeano.
   */
  generateNPCTextures() {
    const npcs = [
      {
        name: 'npc-sabio',
        draw: (g) => {
          // Sabio con barba blanca y túnica azul
          const skin = 0xffdbac;
          const tunic = 0x1e3a5f;
          const beard = 0xe8e8e8;
          const hat = 0x2c5282;
          // Cuerpo
          g.fillStyle(tunic, 1);
          g.fillRect(8, 16, 16, 16);
          // Cabeza
          g.fillStyle(skin, 1);
          g.fillRect(10, 8, 12, 12);
          // Barba
          g.fillStyle(beard, 1);
          g.fillRect(10, 16, 12, 4);
          g.fillRect(12, 18, 8, 2);
          // Sombrero de mago
          g.fillStyle(hat, 1);
          g.fillRect(6, 4, 20, 6);
          g.fillRect(10, 0, 12, 6);
          // Ojos
          g.fillStyle(0x000000, 1);
          g.fillRect(12, 12, 2, 2);
          g.fillRect(18, 12, 2, 2);
          // Bastón
          g.fillStyle(0x8b4513, 1);
          g.fillRect(24, 10, 2, 22);
          g.fillStyle(0xd4af37, 1);
          g.fillCircle(25, 8, 3);
        }
      },
      {
        name: 'npc-mercader',
        draw: (g) => {
          // Mercader con bolsa de monedas y túnica verde
          const skin = 0xffdbac;
          const tunic = 0x2d5a3d;
          const apron = 0x8b6914;
          const hat = 0x4a2c1a;
          // Cuerpo
          g.fillStyle(tunic, 1);
          g.fillRect(8, 16, 16, 16);
          // Delantal
          g.fillStyle(apron, 1);
          g.fillRect(10, 18, 12, 12);
          // Cabeza
          g.fillStyle(skin, 1);
          g.fillRect(10, 8, 12, 12);
          // Sombrero de mercader
          g.fillStyle(hat, 1);
          g.fillRect(6, 6, 20, 4);
          g.fillRect(8, 2, 16, 6);
          // Ojos
          g.fillStyle(0x000000, 1);
          g.fillRect(12, 12, 2, 2);
          g.fillRect(18, 12, 2, 2);
          // Bolsa de monedas
          g.fillStyle(0xd4af37, 1);
          g.fillCircle(22, 22, 4);
          g.fillStyle(0x8b6914, 1);
          g.fillRect(20, 18, 4, 3);
        }
      },
      {
        name: 'npc-guerrero',
        draw: (g) => {
          // Guerrero con armadura y espada
          const skin = 0xffdbac;
          const armor = 0x4a5568;
          const helmet = 0x2d3748;
          const plume = 0xe53e3e;
          // Cuerpo - armadura
          g.fillStyle(armor, 1);
          g.fillRect(8, 16, 16, 16);
          // Detalles armadura
          g.fillStyle(0x718096, 1);
          g.fillRect(12, 18, 8, 12);
          // Cabeza
          g.fillStyle(skin, 1);
          g.fillRect(10, 8, 12, 12);
          // Casco
          g.fillStyle(helmet, 1);
          g.fillRect(8, 4, 16, 8);
          g.fillRect(10, 2, 12, 4);
          // Pluma del casco
          g.fillStyle(plume, 1);
          g.fillRect(14, 0, 4, 4);
          // Ojos
          g.fillStyle(0x000000, 1);
          g.fillRect(12, 12, 2, 2);
          g.fillRect(18, 12, 2, 2);
          // Espada
          g.fillStyle(0xc0c0c0, 1);
          g.fillRect(26, 8, 3, 18);
          g.fillStyle(0x8b4513, 1);
          g.fillRect(25, 24, 5, 3);
        }
      },
      {
        name: 'npc-aldeano',
        draw: (g) => {
          // Aldeano simple con ropa marrón
          const skin = 0xffdbac;
          const shirt = 0x8b4513;
          const pants = 0x2d3748;
          const hair = 0x4a2c1a;
          // Piernas
          g.fillStyle(pants, 1);
          g.fillRect(10, 24, 4, 8);
          g.fillRect(18, 24, 4, 8);
          // Cuerpo
          g.fillStyle(shirt, 1);
          g.fillRect(8, 16, 16, 10);
          // Cabeza
          g.fillStyle(skin, 1);
          g.fillRect(10, 8, 12, 12);
          // Pelo
          g.fillStyle(hair, 1);
          g.fillRect(10, 6, 12, 4);
          g.fillRect(8, 8, 2, 6);
          g.fillRect(22, 8, 2, 6);
          // Ojos
          g.fillStyle(0x000000, 1);
          g.fillRect(12, 12, 2, 2);
          g.fillRect(18, 12, 2, 2);
          // Herramienta (azada)
          g.fillStyle(0x8b4513, 1);
          g.fillRect(24, 12, 2, 20);
          g.fillStyle(0x718096, 1);
          g.fillRect(22, 10, 6, 4);
        }
      }
    ];

    npcs.forEach(npc => {
      if (!this.textures.exists(npc.name)) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        npc.draw(graphics);
        graphics.generateTexture(npc.name, 32, 32);
      }
    });
  }

  /**
   * Crea NPCs en el mapa con diálogos RPG sobre Manuel.
   * Cada NPC tiene diálogos múltiples que se avanzan con E.
   */
  createNPCs() {
    // NPCs posicionados en la parte inferior del mapa
    const bottomY = worldSize.height - 150;
    const npcData = [
      {
        id: 'sabio',
        texture: 'npc-sabio',
        x: worldSize.width / 2 - 200,
        y: bottomY,
        name: 'Sabio Eldric',
        color: 0x61dafb,
        dialogues: [
          "¡Saludos, viajero! Bienvenido al portfolio de Manuel Cerezuela.",
          "Soy el guardián de este reino digital. Manuel es un Desarrollador Web especializado en experiencias interactivas.",
          "Ha creado este mundo con Phaser.js para demostrar sus habilidades de frontend. ¡Pura magia del código!",
          "Explora el mapa: proyectos a la izquierda, habilidades a la derecha, y la casa del norte lleva a su CV."
        ]
      },
      {
        id: 'mercader',
        texture: 'npc-mercader',
        x: worldSize.width / 2 - 70,
        y: bottomY + 20,
        name: 'Mercader Boris',
        color: 0x48bb78,
        dialogues: [
          "¡Buenas, aventurero! Vengo a contarte los 'productos' que ofrece Manuel.",
          "Vende código limpio, bien documentado y escalable. ¡Calidad garantizada!",
          "Su stack principal: React, Node.js, TypeScript y todo el ecosistema JavaScript moderno.",
          "También maneja herramientas de desarrollo: Git, Docker, testing con Jest... ¡Un completo!"
        ]
      },
      {
        id: 'guerrero',
        texture: 'npc-guerrero',
        x: worldSize.width / 2 + 70,
        y: bottomY,
        name: 'Campeón Thorne',
        color: 0xe53e3e,
        dialogues: [
          "¡Ja! ¿Buscas al mejor guerrero del código? Has encontrado a Manuel.",
          "He visto sus batallas: APIs conquistadas, bugs derrotados, deadlines cumplidos.",
          "Sus armas favoritas: React para el frontend, Node.js para el backend, y determinación infinita.",
          "Si necesitas un developer que no se rinda ante ningún desafío técnico... ¡ese es tu hombre!"
        ]
      },
      {
        id: 'aldeano',
        texture: 'npc-aldeano',
        x: worldSize.width / 2 + 200,
        y: bottomY + 20,
        name: 'Aldeano Pepe',
        color: 0xed8936,
        dialogues: [
          "¡Hola! Soy solo un aldeano, pero sé mucho sobre Manuel.",
          "Es de España, trabaja remoto, y es apasionado de los videojuegos y la tecnología.",
          "Cuando no está codeando, le gusta aprender cosas nuevas y compartir conocimiento.",
          "Dicen que puede pasar horas perfeccionando una animación de pixel... ¡obsesivo con los detalles!"
        ]
      }
    ];

    this.npcs = [];

    npcData.forEach((data, index) => {
      // Sprite del NPC
      const sprite = this.physics.add
        .sprite(data.x, data.y, data.texture)
        .setOrigin(0.5)
        .setScale(2.5)
        .setDepth(2)
        .setImmovable(true);

      // Hitbox ajustada
      sprite.body.setSize(20, 20);
      sprite.body.setOffset(6, 12);

      // Guardar datos del NPC
      sprite.npcData = {
        ...data,
        currentDialogue: 0
      };

      // Colisión con jugador
      this.physics.add.collider(this.player, sprite);

      // Zona de proximidad para diálogo
      const proximityZone = this.add.zone(data.x, data.y, 80, 80);
      this.physics.world.enable(proximityZone);
      proximityZone.body.setAllowGravity(false);
      proximityZone.body.setImmovable(true);
      proximityZone.npcRef = sprite;

      // Detectar proximidad
      this.physics.add.overlap(this.player, proximityZone, this.onNPCProximity, null, this);

      // Animación idle (bouncing sutil)
      this.tweens.add({
        targets: sprite,
        y: data.y - 3,
        duration: 1500 + index * 300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Indicador de exclamación sobre la cabeza
      const indicator = this.add.text(data.x, data.y - 35, '!', {
        font: "bold 16px 'MedievalSharp'",
        fill: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(10);

      // Animación del indicador
      this.tweens.add({
        targets: indicator,
        y: data.y - 40,
        scale: { from: 1, to: 1.2 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      sprite.indicator = indicator;
      this.npcs.push(sprite);
    });

    // Cartel indicador de la zona de NPCs (parte inferior)
    this.createSign(worldSize.width / 2, bottomY - 80, "Zona de Aliados - Habla con ellos");
  }

  /**
   * Se ejecuta cuando el jugador entra en la zona de un NPC.
   */
  onNPCProximity(player, zone) {
    if (this.nearbyNPC === zone.npcRef) return;
    this.nearbyNPC = zone.npcRef;
    this.showNPCIndicator(zone.npcRef);
  }

  /**
   * Muestra indicación de diálogo sobre el NPC.
   */
  showNPCIndicator(npc) {
    if (this.npcIndicator) this.npcIndicator.destroy();

    const data = npc.npcData;
    this.npcIndicator = this.add.container(npc.x, npc.y - 50);

    // Fondo
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.9);
    bg.fillRoundedRect(-50, -12, 100, 24, 6);
    bg.lineStyle(2, data.color, 1);
    bg.strokeRoundedRect(-50, -12, 100, 24, 6);

    // Texto
    const text = this.add.text(0, 0, "PRESIONA E", {
      font: "bold 11px 'MedievalSharp'",
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.npcIndicator.add([bg, text]);
    this.npcIndicator.setDepth(100);

    // Animación
    this.tweens.add({
      targets: this.npcIndicator,
      scale: { from: 1, to: 1.05 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  /**
   * Limpia el indicador de NPC.
   */
  clearNPCIndicator() {
    if (this.npcIndicator) {
      this.npcIndicator.destroy();
      this.npcIndicator = null;
    }
    this.nearbyNPC = null;
  }

  /**
   * Muestra el diálogo del NPC.
   */
  showNPCDialog(npc) {
    const data = npc.npcData;
    const dialogue = data.dialogues[data.currentDialogue];

    // Si ya hay un diálogo, cerrarlo primero
    if (this.dialogActive) this.closeRPGDialog();

    this.dialogActive = true;
    this.currentNPC = npc;

    const cam = this.cameras.main;
    const W = cam.width, H = cam.height;
    const cx = W / 2, cy = H - 120;

    // Overlay
    this.dialogOverlay = this.add.graphics().setScrollFactor(0).setDepth(1999);
    this.dialogOverlay.fillStyle(0x000000, 0.35);
    this.dialogOverlay.fillRect(0, 0, W, H);

    // Contenedor del diálogo
    this.dialogContainer = this.add.container(cx, cy).setScrollFactor(0).setDepth(2000);

    // Fondo
    const boxW = 600, boxH = 140;
    const dialogBg = this.add.image(0, 0, "dialog-box").setScale(2, 2.4).setOrigin(0.5);
    this.dialogContainer.add(dialogBg);

    // Bordes
    const leftEdge = this.add.image(-boxW / 2 + 20, 0, "dialog-box")
      .setScale(2, 2.4).setOrigin(0.5).setCrop(0, 0, 40, 58);
    const rightEdge = this.add.image(boxW / 2 - 20, 0, "dialog-box")
      .setScale(2, 2.4).setOrigin(0.5).setCrop(260, 0, 40, 58);
    this.dialogContainer.add([leftEdge, rightEdge]);

    // Nombre del NPC
    const nameText = this.add.text(-boxW / 2 + 40, -boxH / 2 + 25, data.name, {
      font: "bold 14px 'MedievalSharp'",
      fill: '#' + data.color.toString(16).padStart(6, '0'),
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);
    this.dialogContainer.add(nameText);

    // Texto del diálogo
    this.dialogText = this.add.text(0, -boxH / 2 + 60, "", {
      fontFamily: "'MedievalSharp', sans-serif",
      fontSize: "14px",
      fill: "#000000",
      align: "left",
      wordWrap: { width: boxW - 80 },
      lineSpacing: 4
    }).setOrigin(0.5, 0);
    this.dialogContainer.add(this.dialogText);

    // Indicador de "continuar"
    const arrow = this.add.image(boxW / 2 - 30, boxH / 2 - 20, "dialog-arrow").setScale(1.5);
    this.dialogContainer.add(arrow);
    this.tweens.add({
      targets: arrow, alpha: { from: 1, to: 0.3 }, y: boxH / 2 - 15,
      duration: 600, yoyo: true, repeat: -1
    });

    // Indicador de progreso (1/4, 2/4, etc.)
    const progressText = this.add.text(boxW / 2 - 60, -boxH / 2 + 25,
      `${data.currentDialogue + 1}/${data.dialogues.length}`, {
      font: "10px 'MedievalSharp'",
      fill: '#666666'
    }).setOrigin(1, 0.5);
    this.dialogContainer.add(progressText);

    // Iniciar typewriter
    this.fullDialogMessage = dialogue;
    this.typewriterIndex = 0;
    this.startTypewriterEffect();

    // Animación de entrada
    this.dialogContainer.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: this.dialogContainer, scale: 1, alpha: 1,
      duration: 300, ease: 'Back.out'
    });

    // Ocultar indicador del NPC durante diálogo
    if (npc.indicator) npc.indicator.setVisible(false);
  }

  /**
   * Avanza al siguiente diálogo o cierra si es el último.
   */
  advanceNPCDialog() {
    if (!this.currentNPC) return;

    const npc = this.currentNPC;
    const data = npc.npcData;

    // Si el typewriter está activo, completar el texto
    if (this.typewriterEvent && this.typewriterIndex < this.fullDialogMessage.length) {
      this.typewriterEvent.remove();
      this.typewriterEvent = null;
      this.typewriterIndex = this.fullDialogMessage.length;
      if (this.dialogText) this.dialogText.setText(this.fullDialogMessage);
      return;
    }

    // Avanzar al siguiente diálogo
    data.currentDialogue++;

    if (data.currentDialogue >= data.dialogues.length) {
      // Último diálogo - cerrar con tween directamente (no llamar closeRPGDialog porque ya pusimos dialogActive=false)
      if (this.typewriterEvent) { this.typewriterEvent.remove(); this.typewriterEvent = null; }

      this.tweens.add({
        targets: this.dialogContainer, scale: 0.9, alpha: 0, duration: 200, ease: 'Quad.easeIn',
        onComplete: () => {
          if (this.dialogContainer) { this.dialogContainer.destroy(); this.dialogContainer = null; }
          if (this.dialogOverlay) { this.dialogOverlay.destroy(); this.dialogOverlay = null; }
          this.dialogActive = false;
          this.currentDialogSign = null;
          this.fullDialogMessage = null;
          this.typewriterIndex = 0;
          // Limpiar estado del NPC después de cerrar el diálogo
          data.currentDialogue = 0;
          if (npc && npc.indicator) npc.indicator.setVisible(true);
          if (this.currentNPC === npc) this.currentNPC = null;
        }
      });
    } else {
      // Mostrar siguiente diálogo
      this.closeRPGDialog();
      this.time.delayedCall(200, () => {
        if (npc && npc.active) this.showNPCDialog(npc);
      });
    }
  }

  /**
   * Crea la zona de proyectos en el lado izquierdo del mapa.
   * Cada proyecto está representado por un personaje de anime animado.
   * Al acercarse, se muestra información del proyecto.
   */
  createAnimeGallery() {
    const leftSideX = 50, startY = 200;

    // Datos de cada personaje/proyecto: nombre, título, descripción, frames de animación, escala, posición
    const characters = [
      { name: "goku", title: "Proyecto: Portfolio Phaser", description: "Mundo interactivo + UX con Phaser.js", frames: 3, scale: 0.34, x: 60, y: -100, flipX: true },
      { name: "itachi", title: "Proyecto: API de búsqueda", description: "PWA + consumo de API REST en frontend", frames: 8, scale: 1.6, x: 0, y: 100, flipX: false },
      { name: "kakashi", title: "Proyecto: Animaciones UI", description: "Micro-interacciones y transiciones fluídas", frames: 23, scale: 0.5, x: 120, y: 50, flipX: true },
      { name: "link", title: "Proyecto: E-commerce demo", description: "UI/UX, filtros en tiempo real y checkout", frames: 18, scale: 0.4, x: 60, y: 300, flipX: false },
      { name: "sasuke", title: "Proyecto: Juego educativo", description: "Física, colisiones, logros y guardado local", frames: 4, scale: 2, x: 120, y: 170, flipX: true }
    ];

    // Crear animaciones para cada personaje
    characters.forEach((char) => {
      this.anims.create({
        key: `${char.name}_anim`,
        frames: this.anims.generateFrameNumbers(char.name, { start: 0, end: char.frames - 1 }),
        frameRate: 10, repeat: -1,
      });
    });

    // Cartel presentador de la zona
    this.createSign(leftSideX + 270, startY + 350, "Proyectos destacados");

    // Crear cada personaje en el mapa
    characters.forEach((char) => {
      const sprite = this.physics.add
        .sprite(leftSideX + char.x, startY + char.y, char.name)
        .setOrigin(0.5).setScale(char.scale).setDepth(1);
      sprite.flipX = char.flipX;
      sprite.play(`${char.name}_anim`);

      // Hitbox más pequeña que el sprite visual
      const hitboxWidth = sprite.width * 0.6, hitboxHeight = sprite.height * 0.6;
      sprite.body.setSize(hitboxWidth, hitboxHeight);
      sprite.body.setOffset((sprite.width - hitboxWidth) / 2, (sprite.height - hitboxHeight) / 2);

      // Guardar info del proyecto en el sprite
      sprite.characterInfo = { title: char.title, description: char.description };

      // Detectar proximidad del jugador
      this.physics.add.overlap(this.player, sprite, this.showAnimeInfo, null, this);
      // Borrar info al alejar el ratón
      sprite.on("pointerout", () => { if (this.animeText) this.animeText.destroy(); });
    });
  }

  // ═══════════════════════════════════════════════════════
  // ZONA DE HABILIDADES TÉCNICAS
  // ═══════════════════════════════════════════════════════

  /**
   * Genera texturas pixeladas para iconos de habilidades técnicas.
   * Crea iconos estilo pixel art para React, Node, JS, TS, Git, CSS, HTML y Phaser.
   */
  generateSkillTextures() {
    const skills = [
      {
        name: 'skill-react',
        draw: (g) => {
          // Fondo circular azul oscuro
          g.fillStyle(0x20232a, 1);
          g.fillCircle(16, 16, 14);
          // Átomo - órbitas elípticas
          g.lineStyle(2, 0x61dafb, 1);
          for (let i = 0; i < 3; i++) {
            const rotation = (i * Math.PI) / 3;
            g.beginPath();
            for (let a = 0; a <= 360; a += 10) {
              const rad = (a * Math.PI) / 180;
              const rx = 16 + Math.cos(rad) * 10 * Math.cos(rotation) - Math.sin(rad) * 4 * Math.sin(rotation);
              const ry = 16 + Math.cos(rad) * 10 * Math.sin(rotation) + Math.sin(rad) * 4 * Math.cos(rotation);
              if (a === 0) g.moveTo(rx, ry);
              else g.lineTo(rx, ry);
            }
            g.closePath();
            g.strokePath();
          }
          // Núcleo
          g.fillStyle(0x61dafb, 1);
          g.fillCircle(16, 16, 3);
        }
      },
      {
        name: 'skill-node',
        draw: (g) => {
          // Fondo verde hexagonal
          g.fillStyle(0x3c873a, 1);
          g.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = 16 + 12 * Math.cos(angle);
            const y = 16 + 12 * Math.sin(angle);
            if (i === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
          }
          g.closePath();
          g.fillPath();
          // Letras "N" en blanco pixelado
          g.fillStyle(0xffffff, 1);
          g.fillRect(10, 10, 3, 12);
          g.fillRect(10, 10, 8, 3);
          g.fillRect(14, 13, 4, 3);
          g.fillRect(18, 10, 3, 12);
        }
      },
      {
        name: 'skill-js',
        draw: (g) => {
          // Fondo amarillo cuadrado con esquinas redondeadas
          g.fillStyle(0xf7df1e, 1);
          g.fillRoundedRect(2, 2, 28, 28, 3);
          // Letras "JS" en negro
          g.fillStyle(0x323330, 1);
          // J
          g.fillRect(8, 8, 3, 10);
          g.fillRect(8, 16, 6, 3);
          g.fillRect(11, 8, 3, 5);
          // S
          g.fillRect(16, 8, 6, 3);
          g.fillRect(16, 8, 3, 5);
          g.fillRect(16, 13, 6, 3);
          g.fillRect(19, 13, 3, 5);
          g.fillRect(16, 16, 6, 3);
        }
      },
      {
        name: 'skill-ts',
        draw: (g) => {
          // Fondo azul cuadrado
          g.fillStyle(0x3178c6, 1);
          g.fillRoundedRect(2, 2, 28, 28, 3);
          // Letras "TS" en blanco
          g.fillStyle(0xffffff, 1);
          // T
          g.fillRect(7, 7, 10, 3);
          g.fillRect(11, 7, 3, 12);
          // S
          g.fillRect(18, 7, 6, 3);
          g.fillRect(18, 7, 3, 4);
          g.fillRect(18, 11, 5, 3);
          g.fillRect(20, 11, 3, 4);
          g.fillRect(18, 14, 6, 3);
        }
      },
      {
        name: 'skill-git',
        draw: (g) => {
          // Fondo naranja circular
          g.fillStyle(0xf05032, 1);
          g.fillCircle(16, 16, 14);
          // Rama de git estilizada
          g.fillStyle(0xffffff, 1);
          // Círculos de nodos
          g.fillCircle(16, 10, 3);
          g.fillCircle(10, 20, 3);
          g.fillCircle(22, 20, 3);
          // Líneas conectoras
          g.lineStyle(3, 0xffffff, 1);
          g.lineBetween(16, 13, 16, 17);
          g.lineBetween(13, 20, 19, 20);
          g.lineBetween(16, 17, 13, 20);
          g.lineBetween(16, 17, 19, 20);
        }
      },
      {
        name: 'skill-css',
        draw: (g) => {
          // Fondo azul con shield shape
          g.fillStyle(0x264de4, 1);
          g.beginPath();
          g.moveTo(4, 4);
          g.lineTo(28, 4);
          g.lineTo(26, 26);
          g.lineTo(16, 30);
          g.lineTo(6, 26);
          g.closePath();
          g.fillPath();
          // "3" blanco
          g.fillStyle(0xffffff, 1);
          g.fillRect(10, 10, 8, 3);
          g.fillRect(14, 10, 3, 5);
          g.fillRect(10, 13, 6, 3);
          g.fillRect(14, 13, 3, 5);
          g.fillRect(10, 16, 8, 3);
        }
      },
      {
        name: 'skill-html',
        draw: (g) => {
          // Fondo naranja con shield shape
          g.fillStyle(0xe34f26, 1);
          g.beginPath();
          g.moveTo(4, 4);
          g.lineTo(28, 4);
          g.lineTo(26, 26);
          g.lineTo(16, 30);
          g.lineTo(6, 26);
          g.closePath();
          g.fillPath();
          // "5" blanco
          g.fillStyle(0xffffff, 1);
          g.fillRect(10, 10, 8, 3);
          g.fillRect(10, 10, 3, 5);
          g.fillRect(10, 13, 6, 3);
          g.fillRect(14, 13, 3, 5);
          g.fillRect(10, 16, 8, 3);
        }
      },
      {
        name: 'skill-phaser',
        draw: (g) => {
          // Fondo morado/rojo circular
          g.fillStyle(0x9d3f3f, 1);
          g.fillCircle(16, 16, 14);
          // Logo P estilizado
          g.fillStyle(0xffffff, 1);
          // Barra vertical
          g.fillRect(10, 6, 4, 20);
          // Curva del P
          g.fillRect(14, 6, 8, 4);
          g.fillRect(14, 6, 4, 10);
          g.fillRect(18, 6, 4, 6);
          // Detalle
          g.fillStyle(0xffd700, 1);
          g.fillCircle(22, 10, 2);
        }
      }
    ];

    skills.forEach(skill => {
      if (!this.textures.exists(skill.name)) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        skill.draw(graphics);
        graphics.generateTexture(skill.name, 32, 32);
      }
    });
  }

  /**
   * Crea la zona de habilidades técnicas en el lado derecho del mapa.
   * Cada habilidad tiene un icono pixelado animado sobre un estandarte medieval.
   * Al acercarse, muestra información sobre la tecnología.
   */
  // ═══════════════════════════════════════════════════════
  // SISTEMA DE GALERÍA DE PROYECTOS (ANIME) EXTERIOR
  // ═══════════════════════════════════════════════════════

  /**
   * Crea personajes interactivos en la zona izquierda. 
   * Representan los "proyectos" originales.
   */
  createAnimeGallery() {
    const leftSideX = 50, startY = 200;

    const characters = [
      { name: "goku", title: "Proyecto A", description: "Portfolio con Phaser.js", frames: 3, scale: 0.34, x: 60, y: -100, flipX: true },
      { name: "itachi", title: "Proyecto B", description: "API REST frontend", frames: 8, scale: 1.6, x: 0, y: 100, flipX: false },
      { name: "kakashi", title: "Proyecto C", description: "Interacciones", frames: 23, scale: 0.5, x: 120, y: 50, flipX: true },
      { name: "link", title: "Proyecto D", description: "Web UI/UX", frames: 18, scale: 0.4, x: 60, y: 300, flipX: false },
      { name: "sasuke", title: "Proyecto E", description: "Colisiones físicas", frames: 4, scale: 2, x: 120, y: 170, flipX: true }
    ];

    characters.forEach((char) => {
      // Usamos el origen relativo de animeGallery para colocarlos a la izquierda
      const sprite = this.physics.add
        .sprite(leftSideX + char.x, startY + char.y, char.name)
        .setOrigin(0.5)
        .setScale(char.scale)
        .setDepth(2)
        .setImmovable(true);

      sprite.flipX = char.flipX;

      if (!this.anims.exists(`${char.name}_anim`)) {
        this.anims.create({
          key: `${char.name}_anim`,
          frames: this.anims.generateFrameNumbers(char.name, { start: 0, end: char.frames }),
          frameRate: 6, repeat: -1,
        });
      }
      sprite.play(`${char.name}_anim`, true);

      // Zona de interacción reutilizando SignData para abrir el Dialog
      const interactionZone = this.add.zone(
        sprite.x, sprite.y + (sprite.height * char.scale) / 2 + 10, 40, 40
      );
      this.physics.world.enable(interactionZone);
      interactionZone.body.setAllowGravity(false);
      interactionZone.body.setImmovable(true);
      // Falsificamos un SignEntity para abusar del showRPGDialog
      interactionZone.signData = { name: char.title, description: char.description }; 

      // Usaremos la misma lógica de los carteles
      this.physics.add.overlap(this.player, interactionZone, this.onSignProximity, null, this);
    });
  }

  createSkillsZone() {
    // Generar las texturas de habilidades
    this.generateSkillTextures();

    const rightSideX = worldSize.width - 200;
    const startY = 250;

    // Datos de habilidades: nombre de textura, nombre visible, descripción, nivel
    const skills = [
      { texture: 'skill-react', name: 'React', desc: 'Frontend SPA, Hooks, Context', level: 'Avanzado', color: 0x61dafb },
      { texture: 'skill-node', name: 'Node.js', desc: 'Backend API, Express, REST', level: 'Avanzado', color: 0x3c873a },
      { texture: 'skill-js', name: 'JavaScript', desc: 'ES6+, Async, DOM, APIs', level: 'Experto', color: 0xf7df1e },
      { texture: 'skill-ts', name: 'TypeScript', desc: 'Tipado, Interfaces, Generics', level: 'Intermedio', color: 0x3178c6 },
      { texture: 'skill-git', name: 'Git', desc: 'Control de versiones, GitHub', level: 'Avanzado', color: 0xf05032 },
      { texture: 'skill-css', name: 'CSS3', desc: 'Flexbox, Grid, Animaciones', level: 'Avanzado', color: 0x264de4 },
      { texture: 'skill-html', name: 'HTML5', desc: 'Semántica, Canvas, APIs', level: 'Experto', color: 0xe34f26 },
      { texture: 'skill-phaser', name: 'Phaser.js', desc: 'Juegos 2D, WebGL, Física', level: 'Intermedio', color: 0x9d3f3f }
    ];

    // Cartel de la zona
    this.createSign(rightSideX - 50, startY - 80, "Habilidades Técnicas");

    // Crear iconos en grid 2x4
    const cols = 2;
    const spacingX = 80;
    const spacingY = 110;

    skills.forEach((skill, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = rightSideX + col * spacingX;
      const y = startY + row * spacingY;

      // Crear estandarte medieval (poste con base y bandera)
      const bannerContainer = this.createMedievalBanner(x, y, skill.color);

      // Contenedor para el icono (flotará sobre el estandarte)
      const iconContainer = this.add.container(x, y - 40).setDepth(3);

      // Aura/brillo detrás del icono
      const aura = this.add.graphics();
      aura.fillStyle(skill.color, 0.3);
      aura.fillCircle(0, 0, 20);
      iconContainer.add(aura);

      // Sprite del icono
      const sprite = this.add.sprite(0, 0, skill.texture).setScale(1.5);
      iconContainer.add(sprite);

      // Guardar datos de la habilidad
      iconContainer.skillData = skill;
      iconContainer.skillSprite = sprite;
      iconContainer.aura = aura;
      iconContainer.bannerContainer = bannerContainer;

      // Animación de flotación del icono sobre el estandarte
      this.tweens.add({
        targets: iconContainer,
        y: y - 45,
        duration: 1500 + index * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Animación de pulso del aura
      this.tweens.add({
        targets: aura,
        scale: { from: 1, to: 1.2 },
        alpha: { from: 0.3, to: 0.5 },
        duration: 2000 + index * 100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Zona de detección para el jugador (invisible, más grande)
      const detectionZone = this.add.zone(x, y, 60, 80);
      this.physics.world.enable(detectionZone);
      detectionZone.body.setAllowGravity(false);
      detectionZone.body.setImmovable(true);
      detectionZone.skillContainer = iconContainer;

      // Detectar proximidad
      this.physics.add.overlap(this.player, detectionZone, this.showSkillInfo, null, this);
    });

    // Guardar referencia para limpieza
    this.skillsZoneX = rightSideX;
    this.skillsZoneY = startY;
  }

  /**
   * Crea un estandarte medieval con poste de madera y bandera.
   */
  createMedievalBanner(x, y, color) {
    const container = this.add.container(x, y).setDepth(1);

    // Colores
    const woodDark = 0x4a2c1a;
    const woodLight = 0x6b4423;
    const gold = 0xd4af37;

    // Poste de madera
    const pole = this.add.graphics();
    pole.fillStyle(woodDark, 1);
    pole.fillRect(-3, -30, 6, 60);
    pole.fillStyle(woodLight, 1);
    pole.fillRect(-1, -30, 2, 60);

    // Base del poste
    const base = this.add.graphics();
    base.fillStyle(woodDark, 1);
    base.fillCircle(0, 30, 8);
    base.fillStyle(woodLight, 1);
    base.fillCircle(0, 30, 5);

    // Punta dorada del poste
    const tip = this.add.graphics();
    tip.fillStyle(gold, 1);
    tip.fillCircle(0, -32, 4);
    tip.fillStyle(0xfff8e8, 0.8);
    tip.fillCircle(0, -32, 2);

    // Bandera (forma triangular/medieval)
    const banner = this.add.graphics();
    banner.fillStyle(color, 0.9);
    banner.beginPath();
    banner.moveTo(4, -25);
    banner.lineTo(28, -18);
    banner.lineTo(24, -8);
    banner.lineTo(32, 2);
    banner.lineTo(4, 8);
    banner.closePath();
    banner.fillPath();

    // Borde dorado de la bandera
    banner.lineStyle(2, gold, 1);
    banner.beginPath();
    banner.moveTo(4, -25);
    banner.lineTo(28, -18);
    banner.lineTo(24, -8);
    banner.lineTo(32, 2);
    banner.lineTo(4, 8);
    banner.closePath();
    banner.strokePath();

    // Detalle decorativo en la bandera
    banner.fillStyle(gold, 0.6);
    banner.fillCircle(12, -8, 3);

    // Sombra del estandarte
    const shadow = this.add.ellipse(0, 35, 20, 6, 0x000000, 0.3);

    container.add([shadow, base, pole, banner, tip]);

    // Animación sutil del estandarte (balanceo)
    this.tweens.add({
      targets: container,
      rotation: { from: -0.02, to: 0.02 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return container;
  }

  /**
   * Muestra información de la habilidad cuando el jugador se acerca.
   */
  showSkillInfo(player, zone) {
    const container = zone.skillContainer;
    if (!container || !container.skillData) return;

    // Si ya mostramos info de esta skill, no repetir
    if (this.skillTextActive && this.currentSkillContainer === container) return;

    // Limpiar texto anterior
    if (this.skillText) {
      this.skillText.destroy();
      if (this.skillBg) this.skillBg.destroy();
    }

    const skill = container.skillData;
    const x = container.x;
    const y = container.y - 50;

    // Fondo del tooltip
    this.skillBg = this.add.graphics().setDepth(19);
    this.skillBg.fillStyle(0x1a1a2e, 0.9);
    this.skillBg.fillRoundedRect(-70, -35, 140, 50, 8);
    this.skillBg.lineStyle(2, skill.color, 1);
    this.skillBg.strokeRoundedRect(-70, -35, 140, 50, 8);
    this.skillBg.x = x;
    this.skillBg.y = y;

    // Texto con nombre y descripción
    this.skillText = this.add.container(x, y).setDepth(20);

    const nameText = this.add.text(0, -15, skill.name, {
      font: "bold 14px 'MedievalSharp'",
      fill: '#' + skill.color.toString(16).padStart(6, '0'),
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const descText = this.add.text(0, 0, skill.desc, {
      font: "10px 'MedievalSharp'",
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const levelText = this.add.text(0, 12, skill.level, {
      font: "bold 9px 'MedievalSharp'",
      fill: '#d4af37'
    }).setOrigin(0.5);

    this.skillText.add([nameText, descText, levelText]);

    this.currentSkillContainer = container;
    this.skillTextActive = true;

    // Animar entrada
    this.skillText.setScale(0.8).setAlpha(0);
    this.tweens.add({
      targets: this.skillText,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.out'
    });
  }

  /**
   * Limpia la información de skill cuando el jugador se aleja.
   * Llamado desde update().
   */
  clearSkillInfo() {
    if (this.skillText) {
      this.skillText.destroy();
      this.skillText = null;
    }
    if (this.skillBg) {
      this.skillBg.destroy();
      this.skillBg = null;
    }
    this.skillTextActive = false;
    this.currentSkillContainer = null;
  }

  /**
   * Muestra la información del proyecto cuando el jugador se acerca a un personaje.
   */
  showAnimeInfo(player, animeChar) {
    if (this.animeText && this.currentAnimeChar === animeChar) return;
    if (this.animeText) this.animeText.destroy();

    this.animeText = this.add
      .text(animeChar.x + 80, animeChar.y, `${animeChar.characterInfo.title}\n${animeChar.characterInfo.description}`, {
        font: "16px 'MedievalSharp'", fill: "#ffffff", stroke: "#000000", strokeThickness: 3,
        backgroundColor: "#1a2a4d", padding: { x: 12, y: 8 },
      })
      .setOrigin(0, 0.5).setDepth(20);

    this.currentAnimeChar = animeChar;
    this.animeTextActive = true;
  }

  // ═══════════════════════════════════════════════════════
  // CASA (PORTAL A "SOBRE MÍ")
  // ═══════════════════════════════════════════════════════

  /**
   * Crea la casa en la parte superior del mapa.
   * Tiene una zona de puerta invisible que redirige a la página "Sobre mí" con un fade to black.
   */
  // ═══════════════════════════════════════════════════════
  // PORTAL MÁGICO (Enlace a Portfolio Principal)
  // ═══════════════════════════════════════════════════════
  createPortal(x, y) {
    // Generar textura del portal si no existe
    if (!this.textures.exists("portal-tex")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Anillo exterior
      g.lineStyle(4, 0x8e44ff, 1);
      g.strokeCircle(32, 32, 28);
      g.lineStyle(3, 0x3498db, 0.7);
      g.strokeCircle(32, 32, 22);
      // Centro brillante
      g.fillStyle(0x6c3bff, 0.6);
      g.fillCircle(32, 32, 18);
      g.fillStyle(0xaaffff, 0.4);
      g.fillCircle(32, 32, 10);
      g.generateTexture("portal-tex", 64, 64);
    }

    // Sprite del portal
    const portal = this.add.sprite(x, y, "portal-tex").setScale(2.5).setDepth(1);

    // Animación de rotación y pulso constante
    this.tweens.add({
      targets: portal,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: 'Linear'
    });

    this.tweens.add({
      targets: portal,
      scale: { from: 2.3, to: 2.7 },
      alpha: { from: 0.75, to: 1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Partículas flotantes alrededor del portal
    if (!this.textures.exists("portal-particle")) {
      const p = this.make.graphics({ x: 0, y: 0, add: false });
      p.fillStyle(0xaaffff, 1);
      p.fillCircle(4, 4, 4);
      p.generateTexture("portal-particle", 8, 8);
    }

    const particles = this.add.particles(x, y, "portal-particle", {
      speed: { min: 20, max: 60 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1200,
      frequency: 120,
      blendMode: 'ADD',
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Circle(0, 0, 50),
        quantity: 12
      }
    }).setDepth(1);

    // Cartel debajo
    const label = this.add.text(x, y + 50, "🌀 Mi Web", {
      font: 'bold 14px "MedievalSharp"',
      fill: '#aaffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(5);

    this.tweens.add({
      targets: label,
      y: y + 45,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Zona de interacción
    const portalZone = this.add.zone(x, y, 70, 70);
    this.physics.world.enable(portalZone);
    portalZone.body.setAllowGravity(false);
    portalZone.body.setImmovable(true);

    this.physics.add.overlap(this.player, portalZone, () => {
      if (this.portalActivated) return;
      this.portalActivated = true;

      // Flash blanco y abrir enlace
      this.cameras.main.flash(800, 255, 255, 255);
      this.cameras.main.fadeOut(1000, 255, 255, 255);

      this.time.delayedCall(500, () => {
        window.open("https://mainportfolio-one.vercel.app/", "_blank");
      });

      this.time.delayedCall(1200, () => {
        this.cameras.main.fadeIn(800, 0, 0, 0);
        this.portalActivated = false;
      });
    });
  }

  createHouse() {
    const houseX = worldSize.width / 2 + 220, houseY = 130;

    const house = this.physics.add.sprite(houseX, houseY, "house")
      .setOrigin(0.5).setScale(3).setDepth(1).setImmovable(true);
    this.physics.add.collider(this.player, house);

    // Zona invisible en la puerta de la casa
    const doorWidth = 60, doorHeight = 30;
    const doorX = houseX, doorY = houseY + 110;
    const doorZone = this.add.zone(doorX, doorY, doorWidth, doorHeight);
    this.physics.world.enable(doorZone);
    // La puerta se activa estremosamente al tocarla (automático)
    this.physics.add.overlap(this.player, doorZone, this.enterHouse, null, this);
  }

  /**
   * Efecto de transición al entrar en la casa: fade to black y cargar HouseScene.
   */
  enterHouse() {
    if (this.redirecting) return; // Evitar múltiples disparos
    this.redirecting = true;

    // Detener sonidos y efectos antes de salir
    this.player.setVelocity(0, 0);

    const cam = this.cameras.main;
    cam.fadeOut(600, 0, 0, 0);
    cam.once('camerafadeoutcomplete', () => {
      this.redirecting = false;
      this.scene.start('scene-house');
    });
  }

  // ═══════════════════════════════════════════════════════
  // SISTEMA DE CONTACTO (BUZÓN / POSTE)
  // ═══════════════════════════════════════════════════════

  createMailbox() {
    const boxX = worldSize.width / 2;
    const boxY = worldSize.height - 150;

    // Usaremos un cartel modificado o un sprite como "buzón"
    const mailbox = this.physics.add.sprite(boxX, boxY, "sign")
      .setOrigin(0.5).setScale(3).setDepth(1).setImmovable(true);
    
    // Le bajamos el brillo/color para que parezca un cofre/poste distinto
    mailbox.setTint(0x8a8a8a);
    
    mailbox.body.setSize(16, 8); 
    mailbox.body.setOffset(0, 8);
    this.physics.add.collider(this.player, mailbox);

    // Indicación flotante
    const mailIcon = this.add.text(boxX, boxY - 40, "✉", {
        font: "bold 24px Arial", fill: "#d4af37", stroke: "#000", strokeThickness: 2
    }).setOrigin(0.5).setDepth(2);

    this.tweens.add({
        targets: mailIcon, y: boxY - 45, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    const zone = this.add.zone(boxX, boxY, 80, 80);
    this.physics.world.enable(zone);
    zone.body.setAllowGravity(false);
    zone.body.setImmovable(true);

    this.physics.add.overlap(this.player, zone, this.onMailboxProximity, null, this);
  }

  onMailboxProximity() {
    if (this.nearbyMailbox) return;
    this.nearbyMailbox = true;
    this.showEInstruction({ x: worldSize.width / 2, y: worldSize.height - 150 }, true);
  }

  // Se modifica la tecla E para abrir el contacto si estás cerca
  openContactMenu() {
    if (this.contactActive) return;
    this.contactActive = true;
    if (this.eInstruction) this.clearEInstruction();

    const cam = this.cameras.main;
    const cx = cam.centerX;
    const cy = cam.centerY;

    this.contactOverlay = this.add.rectangle(cx, cy, cam.width, cam.height, 0x000000, 0.7)
      .setInteractive().setDepth(100).setScrollFactor(0);

    const panel = this.add.container(cx, cy).setDepth(101).setScrollFactor(0);

    const bg = this.add.graphics();
    bg.fillStyle(0x0a1628, 0.95);
    bg.fillRoundedRect(-180, -120, 360, 240, 10);
    bg.lineStyle(4, 0xd4af37, 1);
    bg.strokeRoundedRect(-180, -120, 360, 240, 10);

    const title = this.add.text(0, -80, "📬 VÍAS DE CONTACTO", {
        fontFamily: "'MedievalSharp'", fontSize: "22px", color: "#d4af37", fontStyle: "bold"
    }).setOrigin(0.5);

    const linkLinkedIn = this.add.text(0, -20, "💼 LinkedIn", {
        fontFamily: "'MedievalSharp'", fontSize: "18px", color: "#ffffff"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    linkLinkedIn.on('pointerdown', () => window.open('https://linkedin.com/in/YOUR_LINKEDIN', '_blank'));
    linkLinkedIn.on('pointerover', () => linkLinkedIn.setStyle({ color: '#61dafb' }));
    linkLinkedIn.on('pointerout', () => linkLinkedIn.setStyle({ color: '#ffffff' }));

    const linkGitHub = this.add.text(0, 20, "🐙 GitHub", {
        fontFamily: "'MedievalSharp'", fontSize: "18px", color: "#ffffff"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    linkGitHub.on('pointerdown', () => window.open('https://github.com/YOUR_GITHUB', '_blank'));
    linkGitHub.on('pointerover', () => linkGitHub.setStyle({ color: '#48bb78' }));
    linkGitHub.on('pointerout', () => linkGitHub.setStyle({ color: '#ffffff' }));

    const closeBtn = this.add.text(0, 80, "[Cerrar]", {
        fontFamily: "'MedievalSharp'", fontSize: "14px", color: "#8b2635"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.closeContactMenu());

    panel.add([bg, title, linkLinkedIn, linkGitHub, closeBtn]);
    panel.setScale(0);

    this.tweens.add({ targets: panel, scale: 1, duration: 400, ease: 'Back.out' });
    this.contactPanel = panel;
  }

  closeContactMenu() {
    if (!this.contactActive) return;
    this.tweens.add({
        targets: this.contactPanel, scale: 0, duration: 300, ease: 'Back.in',
        onComplete: () => {
            this.contactPanel.destroy();
            this.contactOverlay.destroy();
            this.contactActive = false;
        }
    });
  }

  // ═══════════════════════════════════════════════════════
  // FOOTER UI (INFORMACIÓN DE CONTACTO)
  // ═══════════════════════════════════════════════════════

  /**
   * Crea un footer fijo en la parte inferior de la pantalla.
   * Muestra links de contacto y redes sociales con estilo medieval.
   */
  createFooter() {
    const cam = this.cameras.main;
    const footerHeight = 40;
    const footerY = cam.height - footerHeight / 2;

    // Contenedor del footer (fijo en pantalla)
    this.footerContainer = this.add.container(cam.width / 2, footerY)
      .setScrollFactor(0).setDepth(500);

    // Fondo del footer con degradado
    const footerBg = this.add.graphics();
    footerBg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f1a, 0x0f0f1a, 0.95);
    footerBg.fillRect(-cam.width / 2, -footerHeight / 2, cam.width, footerHeight);

    // Borde superior dorado
    footerBg.lineStyle(2, 0xd4af37, 0.6);
    footerBg.lineBetween(-cam.width / 2, -footerHeight / 2, cam.width / 2, -footerHeight / 2);

    this.footerContainer.add(footerBg);

    // Links de contacto
    const links = [
      { icon: '✉', text: 'Email', url: 'mailto:manuel@example.com', x: -200 },
      { icon: '💼', text: 'LinkedIn', url: 'https://linkedin.com/in/manuel', x: -50 },
      { icon: '🐙', text: 'GitHub', url: 'https://github.com/manuel', x: 100 },
      { icon: '🌐', text: 'Portfolio', url: portfolioConfig.aboutPath, x: 250 }
    ];

    links.forEach(link => {
      const linkContainer = this.add.container(link.x, 0);

      // Fondo hover del link
      const linkBg = this.add.graphics();
      linkBg.fillStyle(0xd4af37, 0);
      linkBg.fillRoundedRect(-50, -15, 100, 30, 6);
      linkContainer.add(linkBg);

      // Icono
      const icon = this.add.text(-35, 0, link.icon, {
        font: "14px Arial",
        fill: "#d4af37"
      }).setOrigin(0.5);

      // Texto
      const text = this.add.text(5, 0, link.text, {
        font: "12px 'MedievalSharp'",
        fill: "#ffffff"
      }).setOrigin(0.5);

      linkContainer.add([icon, text]);

      // Interactividad
      const hitArea = this.add.zone(0, 0, 100, 30)
        .setInteractive({ useHandCursor: true });
      linkContainer.add(hitArea);

      hitArea.on('pointerover', () => {
        linkBg.clear();
        linkBg.fillStyle(0xd4af37, 0.2);
        linkBg.fillRoundedRect(-50, -15, 100, 30, 6);
        text.setStyle({ fill: "#d4af37" });
        icon.setScale(1.1);
      });

      hitArea.on('pointerout', () => {
        linkBg.clear();
        linkBg.fillStyle(0xd4af37, 0);
        linkBg.fillRoundedRect(-50, -15, 100, 30, 6);
        text.setStyle({ fill: "#ffffff" });
        icon.setScale(1);
      });

      hitArea.on('pointerdown', () => {
        if (link.url.startsWith('mailto')) {
          window.location.href = link.url;
        } else {
          window.open(link.url, '_blank');
        }
      });

      this.footerContainer.add(linkContainer);
    });

    // Copyright en la esquina
    const copyright = this.add.text(cam.width / 2 - 20, 0, "© 2025 Manuel Cerezuela", {
      font: "10px 'MedievalSharp'",
      fill: "#888888"
    }).setOrigin(1, 0.5);
    this.footerContainer.add(copyright);

    // Toggle button para mostrar/ocultar footer
    const toggleBtn = this.add.text(-cam.width / 2 + 30, 0, "▼", {
      font: "bold 14px 'MedievalSharp'",
      fill: "#d4af37",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    let footerVisible = true;
    toggleBtn.on('pointerdown', () => {
      footerVisible = !footerVisible;
      if (footerVisible) {
        this.footerContainer.setY(footerY);
        toggleBtn.setText("▼");
      } else {
        this.footerContainer.setY(cam.height + footerHeight / 2 - 10);
        toggleBtn.setText("▲");
      }
    });

    this.footerContainer.add(toggleBtn);
  }

  // ═══════════════════════════════════════════════════════
  // CAMINOS Y DECORACIÓN
  // ═══════════════════════════════════════════════════════

  /**
   * Coloca flores aleatorias por el césped del mapa.
   * Cada flor tiene una rotación y escala ligeramente diferente para un aspecto natural.
   */
  placeFlowers() {
    const grassStartX = 2 * 32 * 2, grassStartY = 2 * 32 * 2;
    const grassEndX = worldSize.width - grassStartX, grassEndY = worldSize.height - grassStartY;
    const numFlowers = 100;

    for (let i = 0; i < numFlowers; i++) {
      const x = Phaser.Math.Between(grassStartX, grassEndX);
      const y = Phaser.Math.Between(grassStartY, grassEndY);
      const flowerTypes = ["flower1", "flower2", "flower3"];
      const randomFlowerType = flowerTypes[Phaser.Math.Between(0, flowerTypes.length - 1)];

      const flower = this.add.image(x, y, randomFlowerType).setOrigin(0.5).setScale(2).setDepth(0.5);
      flower.setRotation(Phaser.Math.FloatBetween(-0.1, 0.1));
      flower.setScale(Phaser.Math.FloatBetween(1.8, 2.2));
    }
  }

  /**
   * Crea los caminos que conectan las diferentes zonas del mapa.
   * Los caminos van desde el centro hacia: anime (izquierda) y casa (arriba).
   */
  createPaths() {
    const locations = {
      center: { x: worldSize.width / 2, y: worldSize.height / 2 },
      house: { x: worldSize.width / 2 + 204, y: 130 },
      anime: { x: 300, y: 200 },
    };
    const housePathBranch = { x: worldSize.width / 2 + 204, y: worldSize.height / 2 };

    this.createStraightPath(locations.center.x, locations.center.y, locations.anime.x, locations.center.y, true);
    this.createStraightPath(housePathBranch.x, housePathBranch.y, housePathBranch.x, locations.house.y, false);
  }

  /**
   * Dibuja un camino recto (horizontal o vertical) usando tiles de "pathtile".
   * El camino tiene 2 tiles de grosor y bordes redondeados en los extremos.
   * @param {number} fromX - Posición X inicial
   * @param {number} fromY - Posición Y inicial
   * @param {number} toX - Posición X final
   * @param {number} toY - Posición Y final
   * @param {boolean} isHorizontal - true para camino horizontal, false para vertical
   */
  createStraightPath(fromX, fromY, toX, toY, isHorizontal) {
    const tileSize = 16, scale = 2, effectiveTileSize = tileSize * scale;

    if (isHorizontal) {
      const startX = Math.min(fromX, toX), endX = Math.max(fromX, toX);
      for (let x = startX; x <= endX; x += effectiveTileSize) {
        this.add.image(x, fromY, "pathtile").setOrigin(0.5).setScale(scale).setDepth(0.6);
        this.add.image(x, fromY + effectiveTileSize, "pathtile").setOrigin(0.5).setScale(scale).setDepth(0.6);
      }
    } else {
      const startY = Math.min(fromY, toY), endY = Math.max(fromY, toY);
      for (let y = startY; y <= endY; y += effectiveTileSize) {
        this.add.image(fromX, y, "pathtile").setOrigin(0.5).setScale(scale).setDepth(0.6);
        this.add.image(fromX + effectiveTileSize, y, "pathtile").setOrigin(0.5).setScale(scale).setDepth(0.6);
      }
    }

    // Bordes redondeados en los extremos del camino
    const semiCircleScale = 2;
    if (isHorizontal) {
      const startX = Math.min(fromX, toX), endX = Math.max(fromX, toX);
      const pathWidth = effectiveTileSize * 2;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const circleX = startX - Math.cos(angle) * (pathWidth / 4.3);
        const circleY = fromY + pathWidth / 2 - Math.sin(angle) * (pathWidth / 4.3) - 15;
        this.add.image(circleX, circleY, "pathtile").setOrigin(0.5).setScale(semiCircleScale).setDepth(0.59);
      }
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const circleX = endX + Math.cos(angle) * (pathWidth / 4.3);
        const circleY = fromY + pathWidth / 2 - Math.sin(angle) * (pathWidth / 4.3) - 15;
        this.add.image(circleX, circleY, "pathtile").setOrigin(0.5).setScale(semiCircleScale).setDepth(0.59);
      }
    } else {
      const startY = Math.min(fromY, toY), endY = Math.max(fromY, toY);
      const pathWidth = effectiveTileSize * 2;
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const circleX = fromX + pathWidth / 2 - Math.sin(angle) * (pathWidth / 4.3) - 15;
        const circleY = endY + Math.cos(angle) * (pathWidth / 4.3);
        this.add.image(circleX, circleY, "pathtile").setOrigin(0.5).setScale(semiCircleScale).setDepth(0.59);
      }
    }
  }

  /**
   * Comprueba si el jugador está pisando un camino.
   * Se usa para activar el efecto de polvo/pasos solo en las zonas de camino.
   */
  isPlayerOnPath() {
    const locations = {
      center: { x: worldSize.width / 2, y: worldSize.height / 2 },
      house: { x: worldSize.width / 2 + 204, y: 130 },
      anime: { x: 300, y: worldSize.height / 2 },
    };
    const housePathBranch = { x: worldSize.width / 2 + 220, y: worldSize.height / 2 };
    const pathWidth = 64, halfPathWidth = pathWidth / 2;

    // Camino al anime (horizontal izquierda)
    if (this.player.y > locations.center.y - halfPathWidth && this.player.y < locations.center.y + halfPathWidth &&
        this.player.x < locations.center.x && this.player.x > locations.anime.x) return true;
    // Camino a la casa (vertical arriba desde el desvío)
    if (this.player.x > housePathBranch.x - halfPathWidth && this.player.x < housePathBranch.x + halfPathWidth &&
        this.player.y < locations.center.y && this.player.y > locations.house.y) return true;

    return false;
  }

  // Métodos de debug para visualizar los límites de los caminos
  drawPathBounds() {
    const locations = {
      center: { x: worldSize.width / 2, y: worldSize.height / 2 },
      house: { x: worldSize.width / 2 + 204, y: 130 },
      anime: { x: 300, y: worldSize.height / 2 },
    };
    const housePathBranch = { x: worldSize.width / 2 + 220, y: worldSize.height / 2 };
    const pathWidth = 64, halfPathWidth = pathWidth / 2;
    const colors = { center: 0x00ff00, anime: 0xff00ff, house: 0xff0000 };

    this.drawPathBoundary(locations.anime.x, locations.center.y - halfPathWidth, locations.center.x - locations.anime.x, pathWidth, colors.anime);
    this.drawPathBoundary(housePathBranch.x - halfPathWidth, housePathBranch.y, pathWidth, locations.house.y - housePathBranch.y, colors.house, 0.5);

    this.drawPoint(locations.center.x, locations.center.y, 0xffffff);
    this.drawPoint(housePathBranch.x, housePathBranch.y, 0xff0000);
    this.drawPoint(locations.house.x, locations.house.y, 0xff0000);
  }

  drawPathBoundary(x, y, width, height, color, alpha = 0.3) {
    this.add.rectangle(x, y, width, height).setOrigin(0, 0).setStrokeStyle(2, color).setFillStyle(color, alpha).setDepth(100);
  }

  drawPoint(x, y, color) {
    this.add.circle(x, y, 5, color, 1).setDepth(101);
  }

  // ═══════════════════════════════════════════════════════
  // EFECTOS FX (CARGA + PROYECTIL)
  // ═══════════════════════════════════════════════════════

  /**
   * Activa el efecto especial al pulsar ESPACIO.
   * 1. Muestra una animación de carga sobre el jugador (1.5s)
   * 2. Lanza un proyectil en la dirección que mira el personaje
   * 3. El proyectil viaja por el mapa hasta salir de los límites
   */
  activateFX() {
    if (this.fxActive) return; // Evitar activación múltiple
    this.fxActive = true;

    // Crear sprite de carga sobre el jugador
    this.chargeSprite = this.add.sprite(this.player.x, this.player.y, "fx-carga", 0)
      .setScale(3).setDepth(4).setOrigin(0.5, 0.5);
    this.chargeSprite.play("fx-carga");

    // Después de 1.5 segundos, lanzar el proyectil
    this.time.delayedCall(1500, () => {
      if (this.chargeSprite) { this.chargeSprite.destroy(); this.chargeSprite = null; }
      if (!this.player) { this.fxActive = false; return; }

      const dir = this.facingDirection;
      const startX = this.player.x, startY = this.player.y;

      // Crear el proyectil
      this.fxProjectile = this.add.sprite(startX, startY, "fx-aura", 0)
        .setScale(3).setDepth(4).setOrigin(0.5, 0.5);
      if (dir === "left") this.fxProjectile.setFlipX(true); // Voltear si va a la izquierda

      this.fxProjectileDir = dir;
      this.fxProjectile.play("fx-aura");

      // Destruir el proyectil después de 3 segundos con fade out
      this.time.delayedCall(3000, () => {
        if (this.fxProjectile && this.fxProjectile.active) {
          this.tweens.add({
            targets: this.fxProjectile, alpha: 0, duration: 400, ease: "Power2",
            onComplete: () => {
              if (this.fxProjectile && this.fxProjectile.active) this.fxProjectile.destroy();
              this.fxProjectile = null;
              this.fxActive = false;
            }
          });
        }
      });
    });
  }
}

// ═══════════════════════════════════════════════════════
// CONFIGURACIÓN E INICIO DE PHASER
// ═══════════════════════════════════════════════════════

const config = {
  type: Phaser.WEBGL, // Usar WebGL para mejor rendimiento
  scale: {
    mode: Phaser.Scale.FIT, // Ajustar al contenedor
    parent: "app",
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centrar en pantalla
    width: sizes.width,
    height: sizes.height,
  },
  dom: {
    createContainer: true
  },
  pixelArt: true, // Mantener píxeles nítidos (sin interpolación)
  physics: {
    default: "arcade", // Motor de físicas arcade (ligero y suficiente para 2D)
    arcade: { gravity: { y: 0 }, debug: false }, // Sin gravedad (vista cenital), debug activo
  },
  scene: [BootScene, MenuScene, PreloadScene, GameScene, HouseScene], // Orden de escenas: precarga → juego
};

const game = new Phaser.Game(config);
