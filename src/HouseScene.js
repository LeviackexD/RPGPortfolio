import Phaser from "phaser";

export default class HouseScene extends Phaser.Scene {
  constructor() {
    super("scene-house");
  }

  preload() {
    // Definimos proyectos aquí para cargarlos en preload
    this.projectsConfig = [
      { id: "proj_1", title: "App Finanzas", desc: "React Native, Node, Stripe", uiRef: "https://picsum.photos/seed/appf/200/150" }, 
      { id: "proj_2", title: "API Backend", desc: "Servicios REST\nNode.js, Express", uiRef: "https://picsum.photos/seed/apib/200/150" },
      { id: "proj_3", title: "Dashboard Admin", desc: "React, Panel de estadísticas", uiRef: "https://picsum.photos/seed/dash/200/150" },
      { id: "proj_4", title: "Landing SaaS", desc: "Animaciones framer-motion", uiRef: "https://picsum.photos/seed/land/200/150" },
      { id: "proj_5", title: "E-commerce Bot", desc: "Bot de telegram de ventas", uiRef: "https://picsum.photos/seed/bot/200/150" }
    ];

    // Precargar las URLs como imágenes para el marco pequeño
    this.projectsConfig.forEach(p => {
      this.load.image(`thumb_${p.id}`, p.uiRef);
    });
  }

  create() {
    this.cameras.main.fadeIn(600, 0, 0, 0);

    const { width, height } = this.scale;
    const roomWidth = 600;
    const roomHeight = 500;
    const cx = roomWidth / 2;
    const cy = roomHeight / 2;

    this.physics.world.setBounds(0, 0, roomWidth, roomHeight);
    this.cameras.main.setBounds(0, 0, roomWidth, roomHeight);

    // --- 1. GENERAR TEXTURAS TIPO ZELDA/POKÉMON ---
    this.generateInteriorTextures();

    // Suelo de damero/madera pulida (RPG clásico)
    this.add.tileSprite(cx, cy, roomWidth, roomHeight, "rpg-floor").setOrigin(0.5);

    // Pared superior
    const wallHeight = 120;
    this.add.tileSprite(cx, wallHeight / 2, roomWidth, wallHeight, "rpg-wall").setOrigin(0.5);

    // Rodapié
    const wallBorder = this.add.graphics();
    wallBorder.fillStyle(0x281c10, 1);
    wallBorder.fillRect(0, wallHeight, roomWidth, 8);
    // Sombra bajo el rodapié
    wallBorder.fillStyle(0x000000, 0.2);
    wallBorder.fillRect(0, wallHeight+8, roomWidth, 15);

    // Alfombra de salida automática en el sur
    const carpetY = roomHeight - 60;
    const carpet = this.add.graphics();
    carpet.fillStyle(0x8b2635, 1);
    carpet.fillRect(cx - 50, carpetY, 100, 60);
    carpet.lineStyle(2, 0xd4af37, 1);
    carpet.strokeRect(cx - 50 + 2, carpetY + 2, 96, 56);
    
    // Zona de salida (Overlap automático)
    const exitZone = this.add.zone(cx, carpetY + 30, 100, 60);
    this.physics.world.enable(exitZone);
    exitZone.body.setAllowGravity(false);
    exitZone.body.setImmovable(true);

    this.exiting = false;

    // --- 3. JUGADOR Y CONTROLES ---
    // Posicionado más arriba para no pisar la alfombra al entrar
    this.player = this.physics.add.sprite(cx, roomHeight - 140, 'player-backward', 0);
    this.player.setScale(3);
    this.player.setDepth(10);
    
    // Ajuste de colisiones precisas (hitbox abajo/pies)
    this.player.body.setSize(12, 10);
    this.player.body.setOffset(10, 22);
    this.player.setCollideWorldBounds(true);
    
    // La pared es un obstáculo sólido
    const topBounds = this.add.zone(cx, wallHeight - 15, roomWidth, 30);
    this.physics.world.enable(topBounds);
    topBounds.body.setImmovable(true);
    this.physics.add.collider(this.player, topBounds);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.isPaused = false;

    this.input.keyboard.on("keyup", () => {
      if (this.player && this.player.anims && this.player.anims.currentAnim) {
        const lastFrameIndex = this.player.anims.currentAnim.frames.length - 1;
        this.player.anims.stop();
        if (this.player.setFrame) this.player.setFrame(lastFrameIndex);
      }
    });

    // Detectar salida al pisar alfombra (sin E)
    this.physics.add.overlap(this.player, exitZone, this.exitHouse, null, this);

    // --- 4. GALERÍA DE PROYECTOS (MARIO 64) ---
    this.activePopup = false;
    this.createGallery();
  }

  generateInteriorTextures() {
    if (!this.textures.exists("rpg-floor")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xd6a87c, 1);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(0xc29062, 1); // un poco más oscuro
      g.fillRect(16, 0, 16, 16);
      g.fillRect(0, 16, 16, 16);
      g.generateTexture("rpg-floor", 32, 32);
    }

    if (!this.textures.exists("rpg-wall")) {
      const s = this.make.graphics({ x: 0, y: 0, add: false });
      s.fillStyle(0xeeddcc, 1); // Papel tapiz clásico
      s.fillRect(0, 0, 32, 64);
      s.lineStyle(2, 0xd0c0a0, 0.5);
      for(let i=0; i<64; i+=16) s.lineBetween(0, i, 32, i);
      s.generateTexture("rpg-wall", 32, 64);
    }
    
    if (!this.textures.exists("painting-placeholder")) {
        const p = this.make.graphics({ x: 0, y: 0, add: false });
        p.fillStyle(0x3498db, 1); // un color de "cielo" o fondo
        p.fillRect(0, 0, 24, 32);
        p.fillStyle(0x2ecc71, 1); // "pasto"
        p.fillRect(0, 20, 24, 12);
        p.fillStyle(0xf1c40f, 1); // un "sol"
        p.fillCircle(18, 8, 4);
        p.generateTexture("painting-placeholder", 24, 32);
    }
  }

  createGallery() {
    const startX = 100;
    const spacingX = 100;
    const wallY = 70; 

    this.pictures = [];

    this.projectsConfig.forEach((proj, idx) => {
      const px = startX + idx * spacingX;
      const py = wallY;

      // Un marco pequeño RPG
      const frameW = 40;
      const frameH = 50;
      
      const container = this.add.container(px, py).setDepth(2);
      
      const framebg = this.add.graphics();
      framebg.fillStyle(0x281c10, 1); // fondo oscuro del marco
      framebg.fillRect(-frameW/2, -frameH/2, frameW, frameH);
      framebg.lineStyle(2, 0xd4af37, 1); // borde dorado
      framebg.strokeRect(-frameW/2, -frameH/2, frameW, frameH);

      // Usar la imagen precargada real del proyecto!
      // En caso de que falle por red, tendríamos un fallback pero vamos a confiar en picsum.
      const icon = this.add.sprite(0, 0, `thumb_${proj.id}`);
      
      // Ajustar su escala forzando que quepa dentro del marco (dejando 4px de borde)
      icon.setDisplaySize(frameW - 4, frameH - 4);

      container.add([framebg, icon]);

      // Guardar posiciones originales para volver
      container.origX = px;
      container.origY = py;
      container.projData = proj;
      
      this.pictures.push(container);

      // Zona interactiva en el suelo debajo del cuadro
      const interactZone = this.add.zone(px, wallY + 50, 40, 40);
      this.physics.world.enable(interactZone);
      interactZone.body.setAllowGravity(false);
      interactZone.body.setImmovable(true);
      interactZone.linkedContainer = container;

      this.physics.add.overlap(this.player, interactZone, this.onProjectProximity, null, this);
    });
  }

  onProjectProximity(player, zone) {
    if (this.nearbyPic === zone.linkedContainer || this.activePopup) return;
    this.nearbyPic = zone.linkedContainer;
    this.showEInstruction(zone.x, zone.y - 20);
  }

  showEInstruction(x, y) {
    this.clearEInstruction();
    
    this.eInstruction = this.add.container(x, y).setDepth(50);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.8); 
    bg.fillRoundedRect(-15, -15, 30, 30, 4);
    bg.lineStyle(2, 0xffffff, 1); 
    bg.strokeRoundedRect(-15, -15, 30, 30, 4);

    const txt = this.add.text(0, 0, "E", {
        fontFamily: "'MedievalSharp'", fontSize: "16px", color: "#ffffff", fontStyle: "bold"
    }).setOrigin(0.5);

    this.eInstruction.add([bg, txt]);

    this.tweens.add({
        targets: this.eInstruction, y: y - 5, duration: 400, yoyo: true, repeat: -1
    });
  }

  clearEInstruction() {
      if (this.eInstruction) {
          this.eInstruction.destroy();
          this.eInstruction = null;
      }
  }

  // --- EFECTO MARIO 64 ---
  diveIntoPainting(container) {
      if (this.activePopup) return;
      this.activePopup = true;
      this.clearEInstruction();

      const { width, height } = this.scale;
      const cam = this.cameras.main;

      // Overlay oscuro
      this.popupOverlay = this.add.rectangle(cam.scrollX + width/2, cam.scrollY + height/2, width*2, height*2, 0x000000, 0)
          .setInteractive()
          .setDepth(99);

      this.tweens.add({ targets: this.popupOverlay, fillAlpha: 0.85, duration: 600 });

      // Traer container al frente y animar (Mario 64)
      container.setDepth(100);

      this.tweens.add({
          targets: container,
          x: cam.scrollX + width/2,
          y: cam.scrollY + height/2, // Centrar exacto
          scale: 4, 
          alpha: 0, // En lugar de dejar el cuadro pixelado gigante, lo desvanecemos al acercarse!
          duration: 600,
          ease: 'Cubic.out',
          onComplete: () => {
              this.showDOMContent(container.projData);
          }
      });
      
      this.zoomedContainer = container;
  }

  showDOMContent(projData) {
      const { width, height } = this.scale;
      const cam = this.cameras.main;
      
      const htmlString = `
        <div style="
            width: 440px;
            color: #ffffff;
            font-family: 'MedievalSharp', sans-serif;
            text-align: center;
            background: rgba(10, 15, 29, 0.95);
            padding: 20px;
            border-radius: 12px;
            border: 3px solid #d4af37;
            box-shadow: 0 10px 25px rgba(0,0,0,0.8);
            transform: translateY(-5%); /* Pequeña corrección visual en eje Y */
        ">
            <h2 style="margin: 0 0 15px 0; color: #ffd700; font-size: 28px; text-shadow: 2px 2px 4px #000;">${projData.title}</h2>
            
            <img src="${projData.uiRef}" style="border: 2px solid #d4af37; border-radius: 6px; width: 100%; height: 220px; object-fit: cover;" />
            
            <p style="margin: 15px 0 0 0; font-size: 18px; color: #e8dcac;">${projData.desc.replace('\n', '<br/>')}</p>
        </div>
      `;

      // Centrado 100% exacto en la cámara
      this.domElement = this.add.dom(cam.scrollX + width/2, cam.scrollY + height/2).createFromHTML(htmlString).setDepth(101).setAlpha(0);
      
      this.tweens.add({ targets: this.domElement, alpha: 1, duration: 300 });

      // Botón para salir (Pulsa E)
      this.closeInstruct = this.add.text(cam.scrollX + width/2, cam.scrollY + height - 30, "[Pulsa E para retroceder]", {
          fontFamily: "'MedievalSharp'", fontSize: "16px", color: "#d4af37"
      }).setOrigin(0.5).setDepth(105);

      this.tweens.add({ targets: this.closeInstruct, alpha: 0.5, yoyo: true, repeat: -1, duration: 800 });
  }

  closePaintingDiving() {
      if (!this.activePopup) return;

      if (this.domElement) this.domElement.destroy();
      if (this.closeInstruct) this.closeInstruct.destroy();
      
      this.tweens.add({ targets: this.popupOverlay, fillAlpha: 0, duration: 500 });
      
      // Regresar al estado original
      this.tweens.add({
          targets: this.zoomedContainer,
          x: this.zoomedContainer.origX,
          y: this.zoomedContainer.origY,
          scale: 1,
          alpha: 1, // Recuperar opacidad
          duration: 400,
          ease: 'Cubic.inOut',
          onComplete: () => {
              this.zoomedContainer.setDepth(2);
              this.popupOverlay.destroy();
              this.activePopup = false;
              this.nearbyPic = null;
          }
      });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
        this.toggleSettingsMenu();
    }

    if (this.exiting || this.activePopup || this.isPaused) {
        this.player.setVelocity(0, 0);
        this.player.anims.stop();
        
        if (this.activePopup && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.closePaintingDiving();
        }
        return;
    }

    const speed = 150; // Algo más lento en interiores
    this.player.setVelocity(0, 0);

    let velocityX = 0, velocityY = 0, animation = null;

    if (this.cursors.up.isDown || this.wasd.up.isDown) { velocityY = -speed; animation = "walk_backward"; }
    else if (this.cursors.down.isDown || this.wasd.down.isDown) { velocityY = speed; animation = "walk_forward"; }

    if (this.cursors.left.isDown || this.wasd.left.isDown) { velocityX = -speed; animation = "walk_left"; }
    else if (this.cursors.right.isDown || this.wasd.right.isDown) { velocityX = speed; animation = "walk_right"; }

    if (velocityX !== 0 && velocityY !== 0) {
      const nSpeed = speed * 0.707;
      velocityX = velocityX > 0 ? nSpeed : -nSpeed;
      velocityY = velocityY > 0 ? nSpeed : -nSpeed;
    }

    this.player.setVelocity(velocityX, velocityY);
    if (animation) this.player.anims.play(animation, true);

    // Limpiar UI si nos alejamos
    if (this.nearbyPic) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.nearbyPic.x, this.player.y);
      // Separación en Y también
      if (this.player.y > 140 || dist > 40) {
          this.clearEInstruction();
          this.nearbyPic = null;
      }
    }

    // Interacción con los cuadros
    if (Phaser.Input.Keyboard.JustDown(this.interactKey) && this.nearbyPic) {
        this.diveIntoPainting(this.nearbyPic);
    }
  }

  exitHouse() {
    if (this.exiting) return;
    this.exiting = true;

    this.player.setVelocity(0, 0);
    this.clearEInstruction();

    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('scene-game', { fromHouse: true });
    });
  }

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
}
