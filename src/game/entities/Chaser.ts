import { Player } from './Player';
import { Enemy } from './Enemy';
import { AssetManager } from '../AssetManager';
import { AnimatedSprite } from 'pixi.js';

export class Chaser extends Enemy {
  public maxSpeed = 25.0;
  public turnSpeed = 0.5;
  public collisionDamage = 20;

  constructor(target: Player, x: number, y: number) {
    super(AssetManager.getTexture('dinghy_large_1.png'), target, x, y);
    this.maxHealth = 50;
    this.health = 50;
    this.scoreValue = 10;
  }

  protected updateVisualDamage() {
    if (this.health <= 0) {
      this.sprite.texture = AssetManager.getTexture('dinghy_large_3.png');
    } else if (this.health <= this.maxHealth * 0.5) {
      this.sprite.texture = AssetManager.getTexture('dinghy_large_2.png');
      
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

    this.syncRender();
  }
}
