import { Container, Sprite, Texture } from 'pixi.js';

export abstract class Entity {
  public container: Container;
  public sprite: Sprite;
  
  public x: number = 0;
  public y: number = 0;
  public rotation: number = 0;
  
  public vx: number = 0;
  public vy: number = 0;
  
  public isDead: boolean = false;
  public isDying: boolean = false;

  constructor(texture: Texture) {
    this.container = new Container();
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5); // Center origin
    this.container.addChild(this.sprite);
  }

  public abstract update(delta: number): void;

  protected syncRender() {
    this.container.x = this.x;
    this.container.y = this.y;
    this.container.rotation = this.rotation;
  }
  
  public destroy() {
    this.container.destroy({ children: true });
  }
}
