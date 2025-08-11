import '@types/jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(members: ReadonlyArray<any>): R;
    }
  }
}

export {};