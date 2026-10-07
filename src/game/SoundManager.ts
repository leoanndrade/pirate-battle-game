export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private loopSounds: Map<string, HTMLAudioElement> = new Map();

  public loadSound(name: string, url: string) {
    const audio = new Audio(url);
    this.sounds.set(name, audio);
  }

  public loadLoop(name: string, url: string) {
    const audio = new Audio(url);
    audio.loop = true;
    this.loopSounds.set(name, audio);
  }

  public play(name: string, volume: number = 0.5) {
    const audio = this.sounds.get(name);
    if (audio) {

      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = volume;
      clone.play().catch(e => console.warn('Audio play failed:', e));
    }
  }

  public playRandom(names: string[], volume: number = 0.5) {
    const name = names[Math.floor(Math.random() * names.length)];
    this.play(name, volume);
  }

  public playLoop(name: string, volume: number = 0.5) {
    const audio = this.loopSounds.get(name);
    if (audio && audio.paused) {
      audio.volume = volume;
      audio.play().catch(e => console.warn('Audio play failed:', e));
    }
  }

  public stopLoop(name: string) {
    const audio = this.loopSounds.get(name);
    if (audio && !audio.paused) {
      audio.pause();
    }
  }

  public setLoopVolume(name: string, volume: number) {
    const audio = this.loopSounds.get(name);
    if (audio) {
      audio.volume = volume;
    }
  }

  public async preloadAll() {
    this.loadSound('cannon_fire_1', '/assets/sounds/cannon_fire_1.wav');
    this.loadSound('cannon_fire_2', '/assets/sounds/cannon_fire_2.wav');
    this.loadSound('cannon_fire_3', '/assets/sounds/cannon_fire_3.wav');
    this.loadSound('cannon_broadside', '/assets/sounds/cannon_broadside.wav');
    
    this.loadSound('cannonball_water_hit_1', '/assets/sounds/cannonball_water_hit_1.wav');
    this.loadSound('cannonball_water_hit_2', '/assets/sounds/cannonball_water_hit_2.wav');
    
    this.loadSound('ship_wood_hit_1', '/assets/sounds/ship_wood_hit_1.wav');
    this.loadSound('ship_wood_hit_2', '/assets/sounds/ship_wood_hit_2.wav');
    
    this.loadSound('ship_explosion_1', '/assets/sounds/ship_explosion_1.wav');
    this.loadSound('ship_explosion_2', '/assets/sounds/ship_explosion_2.wav');
    this.loadSound('ship_sinking', '/assets/sounds/ship_sinking.wav');
    
    this.loadSound('ship_collision', '/assets/sounds/ship_collision.wav');
    this.loadSound('score_point', '/assets/sounds/score_point.wav');
    
    this.loadSound('game_start', '/assets/sounds/game_start.wav');
    this.loadSound('game_over', '/assets/sounds/game_over.wav');
    this.loadSound('game_complete', '/assets/sounds/game_complete.wav');
    this.loadSound('game_pause', '/assets/sounds/game_pause.wav');
    this.loadSound('game_resume', '/assets/sounds/game_resume.wav');
    
    this.loadSound('ui_click', '/assets/sounds/ui_click.wav');
    this.loadSound('ui_hover', '/assets/sounds/ui_hover.wav');
    this.loadSound('ui_back', '/assets/sounds/ui_back.wav');
    this.loadSound('ui_open', '/assets/sounds/ui_open.wav');
    this.loadSound('ui_close', '/assets/sounds/ui_close.wav');
    
    this.loadSound('health_low', '/assets/sounds/health_low.wav');
    this.loadSound('time_warning', '/assets/sounds/time_warning.wav');
    
    this.loadLoop('ocean_ambience', '/assets/sounds/ocean_ambience_loop.wav');
    this.loadLoop('ship_sailing', '/assets/sounds/ship_sailing_loop.wav');
  }
}

export const soundManager = new SoundManager();
