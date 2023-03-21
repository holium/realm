import { Step } from 'prosemirror-transform';

export class Authority {
  doc: any;
  steps: Step[];
  stepClientIDs: (string | number)[];
  onNewSteps: any[];

  constructor(doc: any) {
    this.doc = doc;
    this.steps = [];
    this.stepClientIDs = [];
    this.onNewSteps = [];
  }

  receiveSteps(
    version: number,
    steps: readonly Step[],
    clientID: string | number
  ) {
    if (version !== this.steps.length) return;

    // Apply and accumulate new steps
    steps.forEach((step) => {
      this.doc = step.apply(this.doc).doc;
      this.steps.push(step);
      this.stepClientIDs.push(clientID);
    });
    // Signal listeners
    this.onNewSteps.forEach(function (f) {
      f();
    });
  }

  stepsSince(version: number) {
    return {
      steps: this.steps.slice(version),
      clientIDs: this.stepClientIDs.slice(version),
    };
  }
}
