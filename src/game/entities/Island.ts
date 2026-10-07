import { Texture, Rectangle, Sprite } from 'pixi.js';
import { Entity } from './Entity';
import { AssetManager } from '../AssetManager';

export class Island extends Entity {
  public radius: number = 0;
  public width: number = 0;
  public height: number = 0;
  public isRect: boolean = false;

  constructor(x: number, y: number) {
    super(Texture.EMPTY);
    
    this.container.removeChild(this.sprite);

    const baseTexture = AssetManager.getTexture('tiles');
    const tileSize = 64;
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const frame = new Rectangle(col * tileSize, row * tileSize, tileSize, tileSize);
        const tileTex = new Texture({ source: baseTexture.source, frame });
        const tileSprite = new Sprite(tileTex);
        
        tileSprite.x = (col - 1) * tileSize;
        tileSprite.y = (row - 1) * tileSize;
        
        this.container.addChild(tileSprite);
      }
    }

    this.x = x;
    this.y = y;
    
    this.radius = 85;

    this.syncRender();
  }

  public update(_delta: number) {

  }
}
