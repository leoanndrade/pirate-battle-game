import { Entity } from './Entity';
import { AssetManager } from '../AssetManager';
import { soundManager } from '../SoundManager';
import { Graphics } from 'pixi.js';

export class Projectile extends Entity {
  public speed = 200;
  public lifeTime = 2; // seconds
  private age = 0;
  public isEnemy: boolean;
  public damage = 25; // Base damage
  private tail: Graphics;

  constructor(x: number, y: number, rotation: number, isEnemy: boolean = false) {
    super(AssetManager.getTexture('cannon_ball.png'));
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.isEnemy = isEnemy;

    this.tail = new Graphics();

    this.container.addChildAt(this.tail, 0);
  }

  public update(delta: number) {
    if (this.isDead) return;

    this.age += delta;
    if (this.age >= this.lifeTime) {
      soundManager.playRandom(['cannonball_water_hit_1', 'cannonball_water_hit_2'], 0.2);
      this.isDead = true;
      return;
    }

    this.x += Math.cos(this.rotation) * this.speed * delta;
    this.y += Math.sin(this.rotation) * this.speed * delta;

    this.syncRender();

    this.tail.clear();
    const trailLength = Math.min(this.age * this.speed, 120);
    
    if (trailLength > 5) {

      this.tail.moveTo(0, -3);
      this.tail.lineTo(0, 3);
      this.tail.lineTo(-trailLength, 0);
      this.tail.fill({ color: this.isEnemy ? 0xff4444 : 0xdddddd, alpha: 0.6 });
    }
  }
}
