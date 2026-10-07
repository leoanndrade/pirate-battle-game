import { Application, Container } from 'pixi.js';
import { AssetManager } from './AssetManager';
import { inputManager } from './InputManager';
import { EntityManager } from './EntityManager';
import { gameEvents } from '../utils/EventEmitter';
import { soundManager } from './SoundManager';
import { Island } from './entities/Island';

export class GameApplication {
  public app: Application;
  private isInitialized = false;
  
  public gameContainer: Container;
  public entityManager!: EntityManager;

  public score: number = 0;
  public timeRemaining: number = 60; // default 60s
  public isPaused: boolean = true;
  
  public screenShakeTime: number = 0;
  public triggerScreenShake(duration: number = 0.3) {
    this.screenShakeTime = duration;
  }
  
  private timeAccumulator: number = 0;
  private onResizeObj: () => void;

  constructor() {
    this.app = new Application();
    this.gameContainer = new Container();
    this.onResizeObj = this.handleResize.bind(this);
  }

  public async init(canvas: HTMLCanvasElement, container: HTMLElement) {
    if (this.isInitialized) return;
    this.isInitialized = true; // Set early to prevent StrictMode double-execution

    await this.app.init({
      canvas,
      resizeTo: container,
      backgroundColor: 0x1a73e8, // Placeholder
      resolution: Math.max(window.devicePixelRatio, 2),
      autoDensity: true,
      antialias: false,
    });

    await AssetManager.loadAssets();
    await soundManager.preloadAll();
    inputManager.init();

    this.app.stage.addChild(this.gameContainer);

    this.entityManager = new EntityManager(this.gameContainer);
    await this.entityManager.loadMap();
    this.entityManager.initPlayer();
    
    const safeSpawn = this.entityManager.findSafeSpawnPoint();
    this.entityManager.player.x = safeSpawn ? safeSpawn.x : this.app.screen.width / 2;
    this.entityManager.player.y = safeSpawn ? safeSpawn.y : this.app.screen.height / 2;

    this.isInitialized = true;

    gameEvents.emit('SCORE_CHANGED', this.score);
    gameEvents.emit('TIME_CHANGED', this.timeRemaining);

    this.handleResize();
    window.addEventListener('resize', this.onResizeObj);

    this.setupGameLoop();
  }

  public startGame(duration: number, spawnRate: number) {
    this.isPaused = false;
    this.score = 0;
    this.timeRemaining = duration;
    this.timeAccumulator = 0;

    this.entityManager.player.reset();
    
    const safeSpawn = this.entityManager.findSafeSpawnPoint();
    this.entityManager.player.x = safeSpawn ? safeSpawn.x : this.app.screen.width / 2;
    this.entityManager.player.y = safeSpawn ? safeSpawn.y : this.app.screen.height / 2;
    
    this.entityManager.player.rotation = -Math.PI / 2;

    this.entityManager.entities = this.entityManager.entities.filter(e => {
      if (e === this.entityManager.player) return true;
      if (e instanceof Island) return true;
      if (e.container && e.container.parent) e.container.parent.removeChild(e.container);
      return false;
    });

    this.entityManager.SPAWN_RATE = spawnRate;
    this.entityManager.spawnCooldown = spawnRate;
    
    soundManager.play('game_start', 0.7);
    soundManager.playLoop('ocean_ambience', 0.2);

    gameEvents.emit('SCORE_CHANGED', this.score);
    gameEvents.emit('TIME_CHANGED', this.timeRemaining);
  }

  public pauseGame() {
    this.isPaused = true;
    soundManager.play('game_pause');
    soundManager.stopLoop('ocean_ambience');
  }

  public resumeGame() {
    this.isPaused = false;
    soundManager.play('game_resume');
    soundManager.playLoop('ocean_ambience', 0.2);
  }

  public endGame() {
    this.isPaused = true;
    soundManager.stopLoop('ocean_ambience');
    soundManager.play('game_over', 0.8);
  }

  private handleResize() {
  }

  private updateCamera(delta: number) {
    if (!this.entityManager || !this.entityManager.player || this.entityManager.mapWidth === 0) return;

    const zoom = 1.5;
    this.gameContainer.scale.set(zoom);

    const player = this.entityManager.player;

    let targetX = (this.app.screen.width / 2) - (player.x * zoom);
    let targetY = (this.app.screen.height / 2) - (player.y * zoom);

    const minX = Math.min(0, this.app.screen.width - (this.entityManager.mapWidth * zoom));
    const minY = Math.min(0, this.app.screen.height - (this.entityManager.mapHeight * zoom));

    this.gameContainer.x = Math.max(minX, Math.min(0, targetX));
    this.gameContainer.y = Math.max(minY, Math.min(0, targetY));

    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= delta;
      
      const intensity = this.screenShakeTime * 100; 
      this.gameContainer.x += (Math.random() - 0.5) * intensity;
      this.gameContainer.y += (Math.random() - 0.5) * intensity;
    }
  }

  private setupGameLoop() {
    this.app.ticker.add((ticker) => {
      const deltaSec = ticker.deltaMS / 1000;
      if (!this.isPaused && this.timeRemaining > 0) {
        this.update(deltaSec);
      }
    });
  }

  private update(delta: number) {
    if (!this.entityManager) return;
    
    this.entityManager.update(delta);
    this.updateCamera(delta);

    this.timeAccumulator += delta;
    if (this.timeAccumulator >= 1) {
      this.timeRemaining -= 1;
      this.timeAccumulator -= 1;
      gameEvents.emit('TIME_CHANGED', this.timeRemaining);

      if (this.timeRemaining <= 0) {
        this.endGame();
        gameEvents.emit('GAME_OVER', 'TIME_UP');
      }
    }
  }

  public addScore(points: number) {
    this.score += points;
    gameEvents.emit('SCORE_CHANGED', this.score);
  }

  public destroy() {
    if (this.isInitialized) {
      window.removeEventListener('resize', this.onResizeObj);
      this.entityManager.destroyAll();
      inputManager.destroy();
      this.app.destroy(false, { children: true, texture: false });
      this.isInitialized = false;
    }
  }
}

export const gameEngine = new GameApplication();

if (typeof window !== 'undefined') {
  (window as any).gameEngine = gameEngine;
}
