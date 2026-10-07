import { Assets, Texture, Rectangle } from 'pixi.js';

export class AssetManager {
  private static isLoaded = false;
  
  public static async loadAssets(onProgress?: (progress: number) => void) {
    if (this.isLoaded) return;
    
    Assets.add({ alias: 'ui', src: '/assets/spritesheet/ui_sheet.json' });
    Assets.add({ alias: 'ships', src: '/assets/spritesheet/ships_miscellaneous_sheet.png' });
    Assets.add({ alias: 'tiles', src: '/assets/tilesheet/tiles_sheet.png' });
    
    await Assets.load(['ui', 'ships', 'tiles'], onProgress);
    
    await this.parseStarlingXML('ships', '/assets/spritesheet/ships_miscellaneous_sheet.xml');

    this.isLoaded = true;
  }
  
  private static async parseStarlingXML(textureAlias: string, xmlUrl: string) {
    const baseTexture = await Assets.get(textureAlias);
    
    const response = await fetch(xmlUrl);
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const subTextures = xmlDoc.getElementsByTagName('SubTexture');
    for (let i = 0; i < subTextures.length; i++) {
      const node = subTextures[i];
      const name = node.getAttribute('name')!;
      const x = parseInt(node.getAttribute('x')!, 10);
      const y = parseInt(node.getAttribute('y')!, 10);
      const width = parseInt(node.getAttribute('width')!, 10);
      const height = parseInt(node.getAttribute('height')!, 10);
      
      const frame = new Rectangle(x, y, width, height);
      const texture = new Texture({ source: baseTexture.source, frame });
      
      Assets.cache.set(name, texture);
    }
  }

  public static getTexture(name: string): Texture {
    return Assets.get(name);
  }
}
