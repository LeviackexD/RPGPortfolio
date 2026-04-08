# ⚔️ Interactive RPG Portfolio

¡Bienvenido a mi **Portfolio Interactivo**! Este proyecto no es un curriculum web tradicional, sino una recreación completa de un entorno con estética de **RPG 16-bits (Zelda / Pokémon)**. Explora mis experiencias profesionales interactuando con el entorno, los NPCs, los carteles dinámicos y, lo más importante, visitando "La casa de las habilidades" donde el código se materializa.

![Phaser 3](https://img.shields.io/badge/Phaser%203-Motor%20WebGL-brightgreen?style=for-the-badge&logo=phaser)
![Vite](https://img.shields.io/badge/Vite-Bundler%20Rápido-646CFF?style=for-the-badge&logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript)

## 🎮 Mecánicas y Funcionalidades

- **Exploración en Mundo Abierto:** Mapa procedural renderizado usando Canvas WebGL. Recorre los caminos utilizando **"WASD"** y colisiona fielmente con la vegetación, agua y muros interactivos.
- **Transiciones Tipo Retro:** Las zonas conectan de manera imperceptible cruzando puertas o pisando alfombras sin "tiempos de carga bruscos". Puedes saltar del mundo exterior al cálido interior de la "Pinacoteca de proyectos".
- **Efecto Pantomima y 'Mario 64' (HTML sobre Canvas):** Al pulsar 'E' frente a los diferentes cuadros decorativos en el interior de la casa, los cuadros saltarán al centro de la cámara en un fundido *Smooth* incrustando DOM e IFrames reales sobre el juego para que visualices prototipos de diseño, gifs y descripciones sobre cada red de trabajo.
- **Buzón Interactivo de Contacto:** Sustituyendo al clásico *"Footer"*, se localiza de forma orgánica en la región sur del mapa principal permitiendo links directos hacia Github y LinkedIn del autor.
- **Soundtrack Original Ajustable:** Un enigmático _soundtrack_ de fondo que se detiene o reproduce según tu gusto entrando al "Modo Pausa" In-Game (`Pulsando ESC`), como en una cabina real de consola antigua.

## 🚀 Despliegue Local Rápido

El proyecto está empaquetado usando **Vite** para ofrecer compilaciones vertiginosas y un servidor seguro out-of-the-box.

1. Clona el repositorio:
   ```bash
   git clone https://github.com/LeviackexD/RPGPortfolio.git
   ```
2. Entra al directorio:
   ```bash
   cd RPGPortfolio
   ```
3. Instala las dependencias y corre el servidor de desarrollo:
   ```bash
   npm install
   npm run dev
   ```
4. Navega a la URL local (usualmente `http://localhost:5173/portfolio`) para empezar tu exploración.

## 🛠️ Estructura del Código Frontend

La base de código se apoya en una arquitectura modular de Phaser Scene Manager:
- `BootScene.js`: Responsable de preconfigurar e hidratar el ecosistema sonoro (Contextos de Audio).
- `PreloadScene.js`: La gran taberna de recursos. Almacena temporalmente una pantalla visual simulada mientras los componentes estáticos (spritesheets, dom objects y tilemaps) se descargan.
- `MenuScene.js`: Sistema de loggeo visual principal estilo título clásico, con interpolaciones Tween y un submenú para audios (menú "Créditos").
- `GameScene.js`: El núcleo masivo que integra al Player, procesando el bucle Update a 60fps constantes para colisiones de objetos (Fuente, Buzón y el Exterior de la casa).
- `HouseScene.js`: Un ambiente cerrado RPG. Usa `dom: { createContainer: true }` y técnicas de escala Tween-Chain para proyectar paneles de tecnología sobre web.

---

💼 *Creado como una carta de amor a los videojuegos y una vitrina laboral robusta.*
