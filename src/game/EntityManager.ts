import { Container } from 'pixi.js';
import { Entity } from './entities/Entity';
import { Player } from './entities/Player';
import { Projectile } from './entities/Projectile';
import { Island } from './entities/Island';
import { Enemy } from './entities/Enemy';
import { Chaser } from './entities/Chaser';
import { Shooter } from './entities/Shooter';
import { gameEngine } from './GameApplication';
import { TiledMapParser } from './TiledMapParser';
import { soundManager } from './SoundManager';

export class EntityManager {
  public entities: Entity[] = [];
  public player!: Player;
  public islands: Island[] = [];
  public container: Container;

  public mapWidth: number = 0;
  public mapHeight: number = 0;

  public spawnCooldown = 0;
  public SPAWN_RATE = 8.0; // Seconds between spawns

  constructor(container: Container) {
    this.container = container;
  }

  public async loadMap() {
    const { mapWidth, mapHeight } = await TiledMapParser.loadMap('/assets/maps/level1.json', this.container, this.islands);
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    
    for (const island of this.islands) {
      this.entities.push(island);
      this.container.addChild(island.container);
    }
  }

  public initPlayer() {
    this.player = new Player();
    this.player.x = 400;
    this.player.y = 300;
    
    this.player.onFire = (x: number, y: number, rotation: number) => {
      const proj = new Projectile(x, y, rotation, false);
      this.addEntity(proj);
    };

    this.addEntity(this.player);
  }

  public addEntity(entity: Entity) {
    this.entities.push(entity);
    this.container.addChild(entity.container);
  }

  public removeEntity(entity: Entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
      this.container.removeChild(entity.container);
      entity.destroy();
    }
  }

  public update(delta: number) {

    this.spawnCooldown -= delta;
    if (this.spawnCooldown <= 0) {
      this.spawnEnemy();
      this.spawnCooldown = this.SPAWN_RATE;
    }

    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];
      entity.update(delta);

      if (entity.isDead) {
        if (entity instanceof Enemy && !this.player.isDead) {
          if (entity.scoreValue > 0) {
            gameEngine.addScore(entity.scoreValue);
            soundManager.play('score_point', 0.8);
          }
        }
        this.removeEntity(entity);
      }
    }
    
    this.checkCollisions();
  }

  public findSafeSpawnPoint(avoidPlayer: boolean = false): { x: number, y: number } | null {
    let x = this.mapWidth / 2;
    let y = this.mapHeight / 2;
    let validSpawn = false;
    let attempts = 0;

    while (!validSpawn && attempts < 50) {
      attempts++;
      x = 100 + Math.random() * (this.mapWidth - 200);
      y = 100 + Math.random() * (this.mapHeight - 200);
      
      if (avoidPlayer && this.player) {
        if (Math.abs(x - this.player.x) < 400 && Math.abs(y - this.player.y) < 400) {
          continue; 
        }
      }

      let insideIsland = false;
      for (const island of this.islands) {
        if (island.isRect) {
          const rx = island.x - island.width / 2;
          const ry = island.y - island.height / 2;
          if (x > rx - 50 && x < rx + island.width + 50 && y > ry - 50 && y < ry + island.height + 50) {
            insideIsland = true;
            break;
          }
        } else {
          const dist = Math.sqrt(Math.pow(x - island.x, 2) + Math.pow(y - island.y, 2));
          if (dist < island.radius + 50) {
            insideIsland = true;
            break;
          }
        }
      }

      if (insideIsland) {
        continue;
      }
      validSpawn = true;
    }
    
    if (!validSpawn) return null;
    return { x, y };
  }

  private spawnEnemy() {
    if (this.player.isDead) return;

    const spawnPoint = this.findSafeSpawnPoint(true);
    if (!spawnPoint) return;
    const { x, y } = spawnPoint;

    const isChaser = Math.random() > 0.5;
    const enemy = isChaser ? new Chaser(this.player, x, y) : new Shooter(this.player, x, y);
    
    if (enemy instanceof Shooter) {
      enemy.onFire = (sx, sy, sRot) => {
        const proj = new Projectile(sx, sy, sRot, true);
        this.addEntity(proj);
      };
    }
    
    this.addEntity(enemy);
  }

  private checkCollisions() {
    const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    const resolveCircleVsRect = (circleX: number, circleY: number, circleRadius: number, rectX: number, rectY: number, rectW: number, rectH: number) => {
      
      const rx = rectX - rectW / 2;
      const ry = rectY - rectH / 2;
      
      const closestX = Math.max(rx, Math.min(circleX, rx + rectW));
      const closestY = Math.max(ry, Math.min(circleY, ry + rectH));

      const distanceX = circleX - closestX;
      const distanceY = circleY - closestY;
      const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

      if (distanceSquared < (circleRadius * circleRadius)) {
        const distance = Math.sqrt(distanceSquared);
        if (distance === 0) {
          
          return { overlap: circleRadius, angle: -Math.PI / 2 };
        }
        return { overlap: circleRadius - distance, angle: Math.atan2(distanceY, distanceX) };
      }
      return null;
    };

    const resolveCircleVsCircle = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
      const dist = getDistance(x1, y1, x2, y2);
      if (dist < r1 + r2) {
        return { overlap: (r1 + r2) - dist, angle: Math.atan2(y1 - y2, x1 - x2) };
      }
      return null;
    };

    const projectiles = this.entities.filter(e => e instanceof Projectile) as Projectile[];
    const enemies = this.entities.filter(e => e instanceof Enemy) as Enemy[];
    
    for (const island of this.islands) {

      for (const proj of projectiles) {
        if (proj.isDead) continue;
        
        let hit = false;
        if (island.isRect) {
          hit = resolveCircleVsRect(proj.x, proj.y, 5, island.x, island.y, island.width, island.height) !== null;
        } else {
          hit = resolveCircleVsCircle(proj.x, proj.y, 5, island.x, island.y, island.radius) !== null;
        }
        
        if (hit) {
          proj.isDead = true;
        }
      }

      if (this.player && !this.player.isDead) {
        const playerRadius = 15;
        let collision = island.isRect 
          ? resolveCircleVsRect(this.player.x, this.player.y, playerRadius, island.x, island.y, island.width, island.height)
          : resolveCircleVsCircle(this.player.x, this.player.y, playerRadius, island.x, island.y, island.radius);

        if (collision) {
          this.player.x += Math.cos(collision.angle) * collision.overlap;
          this.player.y += Math.sin(collision.angle) * collision.overlap;
          this.player.vx = 0;
          this.player.vy = 0;
        }
      }

      for (const enemy of enemies) {
        if (enemy.isDead) continue;
        const enemyRadius = 15;
        let collision = island.isRect 
          ? resolveCircleVsRect(enemy.x, enemy.y, enemyRadius, island.x, island.y, island.width, island.height)
          : resolveCircleVsCircle(enemy.x, enemy.y, enemyRadius, island.x, island.y, island.radius);

        if (collision) {
          enemy.x += Math.cos(collision.angle) * collision.overlap;
          enemy.y += Math.sin(collision.angle) * collision.overlap;
          enemy.vx = 0;
          enemy.vy = 0;
        }
      }
    }

    const shipRadius = 35;
    for (const proj of projectiles) {
      if (proj.isDead) continue;

      if (!proj.isEnemy) {

        for (const enemy of enemies) {
          if (enemy.isDead) continue;
          if (getDistance(proj.x, proj.y, enemy.x, enemy.y) < shipRadius + 5) {
            enemy.takeDamage(proj.damage);
            soundManager.playRandom(['ship_wood_hit_1', 'ship_wood_hit_2'], 0.6);
            proj.isDead = true;
            break;
          }
        }
      } else {

        if (!this.player.isDead) {
          if (getDistance(proj.x, proj.y, this.player.x, this.player.y) < shipRadius + 5) {
            this.player.takeDamage(proj.damage);
            soundManager.playRandom(['ship_wood_hit_1', 'ship_wood_hit_2'], 0.8);
            proj.isDead = true;
          }
        }
      }
    }

    if (!this.player.isDead) {
      for (const enemy of enemies) {
        if (enemy instanceof Chaser && enemy.health > 0 && !this.player.isDead) {
          if (getDistance(this.player.x, this.player.y, enemy.x, enemy.y) < shipRadius * 2) {
            this.player.takeDamage(enemy.collisionDamage);
            soundManager.play('ship_collision', 0.8);
            enemy.scoreValue = 0; 
            enemy.takeDamage(9999);
          }
        }
      }
    }
  }

  public destroyAll() {
    for (const entity of this.entities) {
      this.container.removeChild(entity.container);
      entity.destroy();
    }
    this.entities = [];
    this.islands = [];
  }
}
