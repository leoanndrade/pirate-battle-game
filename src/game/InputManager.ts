export class InputManager {
  private keys: Map<string, boolean> = new Map();

  private boundOnKeyDown: (e: KeyboardEvent) => void;
  private boundOnKeyUp: (e: KeyboardEvent) => void;
  
  private isActive = false;

  constructor() {
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnKeyUp = this.onKeyUp.bind(this);
  }

  public init() {
    if (this.isActive) return;
    window.addEventListener('keydown', this.boundOnKeyDown);
    window.addEventListener('keyup', this.boundOnKeyUp);
    this.isActive = true;
  }

  public destroy() {
    if (!this.isActive) return;
    window.removeEventListener('keydown', this.boundOnKeyDown);
    window.removeEventListener('keyup', this.boundOnKeyUp);
    this.isActive = false;
    this.keys.clear();
  }

  private onKeyDown(e: KeyboardEvent) {
    this.keys.set(e.code, true);
  }

  private onKeyUp(e: KeyboardEvent) {
    this.keys.set(e.code, false);
  }

  public get isForward(): boolean {
    return this.keys.get('ArrowUp') || this.keys.get('KeyW') || false;
  }

  public get isLeft(): boolean {
    return this.keys.get('ArrowLeft') || this.keys.get('KeyA') || false;
  }

  public get isRight(): boolean {
    return this.keys.get('ArrowRight') || this.keys.get('KeyD') || false;
  }

  public get isFireFront(): boolean {
    return this.keys.get('Space') || false;
  }

  public get isFireSide(): boolean {
    return this.keys.get('KeyE') || this.keys.get('Enter') || false;
  }
}

export const inputManager = new InputManager();
