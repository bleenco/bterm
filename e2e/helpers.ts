export function wait(mseconds): Promise<null> {
  return new Promise(resolve => {
    setTimeout(() => resolve(), mseconds);
  });
}
