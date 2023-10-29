export class SubgraphNotUpportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubgraphNotUpportedError";
  }
}

export class SubgraphHatNotExistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubgraphHatNotExistError";
  }
}

export class SubgraphTreeNotExistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubgraphTreeNotExistError";
  }
}
export class SubgraphWearerNotExistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubgraphWearerNotExistError";
  }
}

export class InputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputValidationError";
  }
}
