/** @implements {ICreateWorkoutSet} */
class CreateWorkoutSet extends HTMLElement {
  /** @type {string} */ setId;
  /** @type {HTMLLegendElement} */ #legend;
  /** @type {HTMLButtonElement} */ #addExerciseBtn;
  /** @type {HTMLButtonElement} */ #copySetBtn;
  /** @type {HTMLButtonElement} */ #deleteSetBtn;

  constructor() {
    super();

    this.#legend = this.querySelector('legend');
    this.#addExerciseBtn = this.querySelector('.add-exercise-btn');
    this.#copySetBtn = this.querySelector('.copy-set-btn');
    this.#deleteSetBtn = this.querySelector('.delete-set-btn');

    this.#addExerciseBtn.addEventListener('click', this);
    this.#copySetBtn.addEventListener('click', this);
    this.#deleteSetBtn.addEventListener('click', this);
    this.addEventListener('cali-circuit:delete-exercise', this);
  }

  handleEvent(/** @type {CustomEvent} */ event) {
    if (!(event.target instanceof HTMLElement)) throw new Error('Not an instance of HTMLElement');
    if (event.target.matches('.add-exercise-btn')) this.#addExercise();
    if (event.target.matches('.copy-set-btn')) this.#copySet();
    if (event.target.matches('.delete-set-btn')) this.#deleteSet();
    if (event.type === 'cali-circuit:delete-exercise') this.#deleteExerciseHandler(event);
  }

  static observedAttributes = ['set-id'];

  attributeChangedCallback(
    /** @type {string} */ name,
    /** @type {string | null} */ prev,
    /** @type {string | null} */ next
  ) {
    if (next === prev) return;
    
    this[name.replace(/-(\w)/g, (_, letter) => letter.toUpperCase())] = next;

    this.#legend.textContent = `Set ${next}`;   
    const createSetExercises = this.querySelectorAll('create-set-exercise');
    createSetExercises.forEach((element) => element.setAttribute('set-id', next));
  }

  disconnectedCallback() {
    this.#addExerciseBtn.removeEventListener('click', this)
    this.#copySetBtn.removeEventListener('click', this)
    this.#deleteSetBtn.removeEventListener('click', this)
  }

  #addExercise() {
    const lastExerciseElement = this.querySelector('create-set-exercise:last-of-type');

    if (!(lastExerciseElement instanceof HTMLElement)) throw new Error('Not an instance of HTMLElement');

    const lastExerciseElementCopy = /** @type {HTMLElement} */ (lastExerciseElement.cloneNode(true));

    lastExerciseElementCopy.setAttribute('set-id', this.setId);

    const lastExerciseId = Number(lastExerciseElement.getAttribute('exercise-id'));
    lastExerciseElementCopy.setAttribute('exercise-id', String(lastExerciseId + 1));

    lastExerciseElement.after(lastExerciseElementCopy);
  }

  #copySet() {
    const event = new CustomEvent('cali-circuit:copy-set', {bubbles: true, detail: this})
    this.dispatchEvent(event);
  }

  #deleteSet() {
    const event = new CustomEvent('cali-circuit:delete-set', {bubbles: true, detail: this});
    this.dispatchEvent(event);
  }

  #deleteExerciseHandler(/** @type {CustomEvent} */ event) {
    const element = event.detail;

    if (!(element instanceof HTMLElement)) throw new Error('Not an instance of HTMLElement');

    const deletedExerciseId = Number(element.getAttribute('exercise-id'));
    element.remove();

    const exerciseElements = this.querySelectorAll('create-set-exercise');

    exerciseElements.forEach(element => {
      const exerciseId = Number(element.getAttribute('exercise-id'));
      if (exerciseId > deletedExerciseId) {
        element.setAttribute('exercise-id', String(exerciseId - 1));
      }
    });
  }

  resetExercises() {
    const exerciseElements = this.querySelectorAll('create-set-exercise');
    exerciseElements.forEach((element, index) => index > 0 && element.remove());
  }
};

customElements.define('create-workout-set', CreateWorkoutSet);
