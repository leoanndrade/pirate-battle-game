import { Container, Sprite, Texture, Rectangle } from 'pixi.js';
import { AssetManager } from './AssetManager';
import { Island } from './entities/Island';

export class TiledMapParser {
  public static async loadMap(jsonUrl: string, container: Container, islandsArray: Island[]) {
    const response = await fetch(jsonUrl);
    const mapData = await response.json();

    const baseTexture = AssetManager.getTexture('tiles');
    const cols = Math.floor(baseTexture.width / mapData.tilewidth);
    
    const mapWidth = mapData.width * mapData.tilewidth;
    const mapHeight = mapData.height * mapData.tileheight;

    for (const layer of mapData.layers) {
      if (layer.type === 'tilelayer') {
        const layerContainer = new Container();
        for (let i = 0; i < layer.data.length; i++) {
          const gid = layer.data[i];
          if (gid === 0) continue; // Empty tile

          const tileId = gid - 1;
          const xPos = (i % mapData.width) * mapData.tilewidth;
          const yPos = Math.floor(i / mapData.width) * mapData.tileheight;

          const tx = (tileId % cols) * mapData.tilewidth;
          const ty = Math.floor(tileId / cols) * mapData.tileheight;

          const frame = new Rectangle(tx, ty, mapData.tilewidth, mapData.tileheight);
          const tileTex = new Texture({ source: baseTexture.source, frame });
          const sprite = new Sprite(tileTex);

          sprite.x = xPos;
          sprite.y = yPos;
          layerContainer.addChild(sprite);
        }
        container.addChild(layerContainer);
      } 
      else if (layer.type === 'objectgroup' && layer.name === 'Collisions') {
        for (const obj of layer.objects) {
          if (obj.ellipse) {
            const radius = obj.width / 2;
            const centerX = obj.x + radius;
            const centerY = obj.y + radius;
            
            const collisionIsland = new Island(centerX, centerY);
            collisionIsland.radius = radius;
            collisionIsland.container.visible = false; 
            islandsArray.push(collisionIsland);
          } else {

            const centerX = obj.x + obj.width / 2;
            const centerY = obj.y + obj.height / 2;
            
            const collisionIsland = new Island(centerX, centerY);
            collisionIsland.isRect = true;
            collisionIsland.width = obj.width;
            collisionIsland.height = obj.height;
            collisionIsland.container.visible = false; 
            islandsArray.push(collisionIsland);
          }
        }
      }
    }
    
    return { mapWidth, mapHeight };
  }
}
