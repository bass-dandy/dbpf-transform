declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchBuffer(expected: ArrayBuffer): R;
    }
  }
}

export {};
