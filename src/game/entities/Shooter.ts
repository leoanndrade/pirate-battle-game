import { Player } from './Player';
import { Enemy } from './Enemy';
import { AssetManager } from '../AssetManager';
import { AnimatedSprite } from 'pixi.js';
import { soundManager } from '../SoundManager';

export class Shooter extends Enemy {
  public maxSpeed = 12.5; 
  public turnSpeed = 0.3; 
  public attackRange = 300; 
  
  public spawnCooldown = 0;
  public SPAWN_RATE = 10.0;
  private fireCooldown = 0;
  private readonly FIRE_RATE = 10.0;

  public onFire?: (x: number, y: number, rotation: number) => void;

  constructor(target: Player, x: number, y: number) {
    super(AssetManager.getTexture('ship_2.png'), target, x, y);
    this.maxHealth = 100;
    this.health = 100;
    this.scoreValue = 20;
  }

  protected updateVisualDamage() {
    if (this.health <= 0) {
      this.sprite.texture = AssetManager.getTexture('ship_20.png');
    } else if (this.health <= this.maxHealth * 0.25) {
      this.sprite.texture = AssetManager.getTexture('ship_14.png');
    } else if (this.health <= this.maxHealth * 0.75) {
      this.sprite.texture = AssetManager.getTexture('ship_8.png');
    }

    if (this.health > 0 && this.health <= this.maxHealth * 0.25) {
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

  public update(delta: number) {
    if (this.isDead) return;
    if (this.isDying) {
      this.handleDyingFade(delta);
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);

    if (distToPlayer > this.attackRange * 0.8) {
      const targetAngle = this.getSteeringAngle(this.target.x, this.target.y);
      let diff = targetAngle - this.rotation;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      if (Math.abs(diff) < this.turnSpeed * delta) {
        this.rotation = targetAngle;
      } else {
        this.rotation += Math.sign(diff) * this.turnSpeed * delta;
      }

      this.x += Math.cos(this.rotation) * this.maxSpeed * delta;
      this.y += Math.sin(this.rotation) * this.maxSpeed * delta;
    } else {
      if (this.fireCooldown > 0) this.fireCooldown -= delta;
      
      const directAngle = Math.atan2(dy, dx);
      let aimDiff = directAngle - this.rotation;
      while (aimDiff < -Math.PI) aimDiff += Math.PI * 2;
      while (aimDiff > Math.PI) aimDiff -= Math.PI * 2;

      if (Math.abs(aimDiff) < this.turnSpeed * delta) {
        this.rotation = directAngle;
      } else {
        this.rotation += Math.sign(aimDiff) * this.turnSpeed * delta;
      }

      if (this.fireCooldown <= 0 && Math.abs(aimDiff) < 0.2) {
        this.fire();
        this.fireCooldown = this.FIRE_RATE;
      }
    }

    this.syncRender();
  }

  private fire() {
    if (this.onFire) {
      soundManager.playRandom(['cannon_fire_1', 'cannon_fire_2', 'cannon_fire_3'], 0.3);
      this.onFire(this.x, this.y, this.rotation);
    }
  }
}
