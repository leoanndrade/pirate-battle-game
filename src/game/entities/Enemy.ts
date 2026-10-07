import { Entity } from './Entity';
import { Player } from './Player';
import { Texture, AnimatedSprite } from 'pixi.js';
import { AssetManager } from '../AssetManager';
import { soundManager } from '../SoundManager';

export abstract class Enemy extends Entity {
  public health: number = 100;
  public maxHealth: number = 100;
  protected target: Player;
  public scoreValue: number = 1;

  protected fireSprite?: AnimatedSprite;

  constructor(texture: Texture, target: Player, x: number, y: number) {
    super(texture);
    this.target = target;
    this.x = x;
    this.y = y;
    
    this.sprite.rotation = -Math.PI / 2;
  }

  public takeDamage(amount: number) {
    if (this.isDead || this.isDying) return;
    this.health -= amount;
    
    this.updateVisualDamage();

    if (this.health <= 0) {
      this.health = 0;
      this.isDying = true;
      this.playExplosion();
    }
  }

  protected updateVisualDamage() {}

  protected playExplosion() {

    if (this.fireSprite) {
      this.container.removeChild(this.fireSprite);
    }
    
    soundManager.playRandom(['ship_explosion_1', 'ship_explosion_2'], 0.6);
    soundManager.play('ship_sinking', 0.4);

    const textures = [
      AssetManager.getTexture('explosion_1.png'),
      AssetManager.getTexture('explosion_2.png'),
      AssetManager.getTexture('explosion_3.png')
    ];
    const explosion = new AnimatedSprite(textures);
    explosion.animationSpeed = 0.15;
    explosion.loop = false;
    explosion.anchor.set(0.5);
    explosion.onComplete = () => {
      this.isDead = true;
    };
    
    this.container.addChild(explosion);
    explosion.play();
  }

  protected handleDyingFade(delta: number) {
    if (this.isDying) {
      this.sprite.alpha = Math.max(0, this.sprite.alpha - delta);
    }
  }

  protected getAngleToTarget(): number {
    return Math.atan2(this.target.y - this.y, this.target.x - this.x);
  }

  protected getDistanceToTarget(): number {
    return Math.sqrt(
      Math.pow(this.target.x - this.x, 2) + Math.pow(this.target.y - this.y, 2)
    );
  }

  protected getSteeringAngle(targetX: number, targetY: number): number {
    const numRays = 16;
    const rayLength = 300;
    const shipRadius = 50;
    const islands = (window as any).gameEngine?.entityManager?.islands || [];

    const interest = new Array(numRays).fill(0);
    const danger = new Array(numRays).fill(0);

    const angleToTarget = Math.atan2(targetY - this.y, targetX - this.x);
    
    for (let i = 0; i < numRays; i++) {
      const rayAngle = (i / numRays) * Math.PI * 2;
      let diff = rayAngle - angleToTarget;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      interest[i] = Math.max(0, 1 - Math.abs(diff) / Math.PI);
    }

    for (const island of islands) {
      for (let i = 0; i < numRays; i++) {
        const rayAngle = (i / numRays) * Math.PI * 2;
        let hitDist = -1;

        for (let d = shipRadius; d <= rayLength; d += 20) {
          const testX = this.x + Math.cos(rayAngle) * d;
          const testY = this.y + Math.sin(rayAngle) * d;
          
          let hit = false;
          if (island.isRect) {
            const rx = island.x - island.width / 2;
            const ry = island.y - island.height / 2;
            if (testX > rx && testX < rx + island.width && testY > ry && testY < ry + island.height) {
              hit = true;
            }
          } else {
            const dx = testX - island.x;
            const dy = testY - island.y;
            if (Math.sqrt(dx * dx + dy * dy) < island.radius) {
              hit = true;
            }
          }

          if (hit) {
            hitDist = d;
            break;
          }
        }

        if (hitDist > 0) {
          const dangerScore = 1 - (hitDist / rayLength);
          danger[i] = Math.max(danger[i], dangerScore);
          
          const prev1 = (i - 1 + numRays) % numRays;
          const next1 = (i + 1) % numRays;
          const prev2 = (i - 2 + numRays) % numRays;
          const next2 = (i + 2) % numRays;
          
          danger[prev1] = Math.max(danger[prev1], dangerScore * 0.9);
          danger[next1] = Math.max(danger[next1], dangerScore * 0.9);
          danger[prev2] = Math.max(danger[prev2], dangerScore * 0.5);
          danger[next2] = Math.max(danger[next2], dangerScore * 0.5);
        }
      }
    }

    let bestDirection = this.rotation;
    let maxScore = -Infinity;

    for (let i = 0; i < numRays; i++) {
      const score = interest[i] - danger[i] * 5.0; // Penalty multiplier
      if (score > maxScore) {
        maxScore = score;
        bestDirection = (i / numRays) * Math.PI * 2;
      }
    }

    return bestDirection;
  }
}
