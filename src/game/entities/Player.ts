import { Entity } from './Entity';
import { AssetManager } from '../AssetManager';
import { inputManager } from '../InputManager';
import { gameEvents } from '../../utils/EventEmitter';
import { Graphics, AnimatedSprite } from 'pixi.js';
import { gameEngine } from '../GameApplication';
import { soundManager } from '../SoundManager';

export class Player extends Entity {
  public maxSpeed = 40; // pixels per second
  public acceleration = 75;
  public friction = 0.96; // Water drag

  public turnSpeed = Math.PI / 4; // radians per second
  
  public health = 100;
  public maxHealth = 100;

  private frontFireCooldown = 0;
  private sideFireCooldown = 0;
  private readonly FIRE_RATE_FRONT = 1.0; // 1 second
  private readonly FIRE_RATE_SIDE = 2.0; // 2 seconds

  public onFire?: (x: number, y: number, rotation: number) => void;

  private indicators: Graphics;

  constructor() {
    super(AssetManager.getTexture('ship_1.png')); 
    
    this.sprite.rotation = -Math.PI / 2;
    this.rotation = -Math.PI / 2; 
    
    this.x = 400;
    this.y = 300;

    gameEvents.emit('PLAYER_HEALTH_CHANGED', this.health);

    this.indicators = new Graphics();
    this.container.addChild(this.indicators);
    this.drawIndicators();
  }

  private drawIndicators() {
    this.indicators.clear();
    
    const drawArrow = (x: number, y: number, rot: number) => {
      this.indicators.moveTo(x, y);
      this.indicators.lineTo(x + Math.cos(rot) * 20, y + Math.sin(rot) * 20);

      this.indicators.lineTo(x + Math.cos(rot) * 20 - Math.cos(rot - 0.5) * 5, y + Math.sin(rot) * 20 - Math.sin(rot - 0.5) * 5);
      this.indicators.moveTo(x + Math.cos(rot) * 20, y + Math.sin(rot) * 20);
      this.indicators.lineTo(x + Math.cos(rot) * 20 - Math.cos(rot + 0.5) * 5, y + Math.sin(rot) * 20 - Math.sin(rot + 0.5) * 5);
    };

    this.indicators.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });

    drawArrow(20, 0, 0); // Front

    drawArrow(0, -15, -Math.PI / 2 - 0.1);
    drawArrow(0, -15, -Math.PI / 2);
    drawArrow(0, -15, -Math.PI / 2 + 0.1);

    drawArrow(0, 15, Math.PI / 2 - 0.1);
    drawArrow(0, 15, Math.PI / 2);
    drawArrow(0, 15, Math.PI / 2 + 0.1);
  }

  public takeDamage(amount: number) {
    if (this.isDead || this.isDying) return;
    this.health -= amount;
    
    this.updateVisualDamage();
    gameEvents.emit('PLAYER_HEALTH_CHANGED', this.health);
    gameEvents.emit('PLAYER_TOOK_DAMAGE');
    
    if (gameEngine) {
      gameEngine.triggerScreenShake(0.3);
    }

    if (this.health <= 0) {
      this.health = 0;
      this.isDying = true;
      this.playExplosion();
    }
  }

  public fireSprite?: AnimatedSprite;

  protected updateVisualDamage() {
    if (this.health <= 0) {
      this.sprite.texture = AssetManager.getTexture('ship_19.png');
      return;
    }

    const ratio = this.health / this.maxHealth;
    if (ratio >= 0.66) {
      this.sprite.texture = AssetManager.getTexture('ship_1.png');
    } else if (ratio >= 0.33) {
      this.sprite.texture = AssetManager.getTexture('ship_7.png');
    } else {
      this.sprite.texture = AssetManager.getTexture('ship_13.png');

      if (!this.fireSprite) {
        const fireTex = [AssetManager.getTexture('fire_1.png'), AssetManager.getTexture('fire_2.png')];
        this.fireSprite = new AnimatedSprite(fireTex);
        this.fireSprite.animationSpeed = 0.1;
        this.fireSprite.play();
        this.fireSprite.anchor.set(0.5);
        this.container.addChild(this.fireSprite);
      }
    }
  }

  public explosionSprite?: AnimatedSprite;

  public reset() {
    this.isDead = false;
    this.isDying = false;
    this.health = this.maxHealth;
    this.sprite.alpha = 1;
    this.sprite.texture = AssetManager.getTexture('ship_1.png');
    this.vx = 0;
    this.vy = 0;
    if (this.fireSprite) {
      this.container.removeChild(this.fireSprite);
      this.fireSprite = undefined;
    }
    if (this.explosionSprite) {
      this.container.removeChild(this.explosionSprite);
      this.explosionSprite = undefined;
    }
  }

  protected playExplosion() {
    if (this.fireSprite) this.container.removeChild(this.fireSprite);
    
    soundManager.playRandom(['ship_explosion_1', 'ship_explosion_2'], 0.8);
    soundManager.play('ship_sinking', 0.6);

    const textures = [
      AssetManager.getTexture('explosion_1.png'),
      AssetManager.getTexture('explosion_2.png'),
      AssetManager.getTexture('explosion_3.png')
    ];
    this.explosionSprite = new AnimatedSprite(textures);
    this.explosionSprite.animationSpeed = 0.15;
    this.explosionSprite.loop = false;
    this.explosionSprite.anchor.set(0.5);
    this.explosionSprite.onComplete = () => {
      this.isDead = true;
      gameEngine.endGame();
      gameEvents.emit('GAME_OVER', 'PLAYER_DIED');
    };
    
    this.container.addChild(this.explosionSprite);
    this.explosionSprite.play();
  }

  protected handleDyingFade(delta: number) {
    if (this.isDying) {
      this.sprite.alpha = Math.max(0, this.sprite.alpha - delta);
    }
  }

  public update(delta: number) {
    if (this.isDead) return;
    if (this.isDying) {
      this.handleDyingFade(delta);
      return;
    }

    if (this.isForward) {
      this.vx += Math.cos(this.rotation) * this.acceleration * delta;
      this.vy += Math.sin(this.rotation) * this.acceleration * delta;
    }

    this.vx *= Math.pow(this.friction, delta * 60);
    this.vy *= Math.pow(this.friction, delta * 60);

    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > this.maxSpeed) {
      const ratio = this.maxSpeed / currentSpeed;
      this.vx *= ratio;
      this.vy *= ratio;
    }

    this.x += this.vx * delta;
    this.y += this.vy * delta;

    if (this.isForward) {
      if (this.isLeft) {
        this.rotation -= this.turnSpeed * delta;
      }
      if (this.isRight) {
        this.rotation += this.turnSpeed * delta;
      }
    }

    if (this.frontFireCooldown > 0) this.frontFireCooldown -= delta;
    if (this.sideFireCooldown > 0) this.sideFireCooldown -= delta;

    if (this.isFireFront && this.frontFireCooldown <= 0) {
      this.fireFront();
      this.frontFireCooldown = this.FIRE_RATE_FRONT;
    }

    if (this.isFireSide && this.sideFireCooldown <= 0) {
      this.fireSide();
      this.sideFireCooldown = this.FIRE_RATE_SIDE;
    }

    const mapWidth = gameEngine.entityManager?.mapWidth || window.innerWidth;
    const mapHeight = gameEngine.entityManager?.mapHeight || window.innerHeight;
    
    this.x = Math.max(20, Math.min(this.x, mapWidth - 20));
    this.y = Math.max(20, Math.min(this.y, mapHeight - 20));

    if (this.x === 20 || this.x === mapWidth - 20) this.vx = 0;
    if (this.y === 20 || this.y === mapHeight - 20) this.vy = 0;

    this.syncRender();
  }

  private fireFront() {
    if (!this.onFire) return;
    soundManager.playRandom(['cannon_fire_1', 'cannon_fire_2', 'cannon_fire_3'], 0.4);

    this.onFire(this.x, this.y, this.rotation);
  }

  private fireSide() {
    if (!this.onFire) return;
    soundManager.play('cannon_broadside', 0.5);

    const leftAngle = this.rotation - Math.PI / 2;
    const rightAngle = this.rotation + Math.PI / 2;

    this.onFire(this.x, this.y, leftAngle - 0.1);
    this.onFire(this.x, this.y, leftAngle);
    this.onFire(this.x, this.y, leftAngle + 0.1);

    this.onFire(this.x, this.y, rightAngle - 0.1);
    this.onFire(this.x, this.y, rightAngle);
    this.onFire(this.x, this.y, rightAngle + 0.1);
  }

  private get isForward() { return inputManager.isForward; }
  private get isLeft() { return inputManager.isLeft; }
  private get isRight() { return inputManager.isRight; }
  private get isFireFront() { return inputManager.isFireFront; }
  private get isFireSide() { return inputManager.isFireSide; }
}
