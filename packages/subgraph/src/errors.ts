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
