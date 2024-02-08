import { Graphics } from './graphics.js';

export class Game {
  constructor() {
    this.#initialize();
  }

  #initialize() {
    // instantiate graphics
    this.graphics = new Graphics();

    // initialize graphics
    this.graphics.initialize();

    // initialize entities
    this.entities = {};

    // call overridden method from child
    this.onInitialize();

    // create a render loop
    this.rAF();
  }

  addEntity(name, entity) {
    this.entities[name] = { entity: entity };
  }

  rAF() {
    requestAnimationFrame(() => {
      this.renderScene();
    });
  }

  renderScene() {
    this.graphics.render();
    this.rAF();
  }
}
