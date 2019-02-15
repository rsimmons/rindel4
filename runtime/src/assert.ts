export default function assert(v: boolean) {
  if (!v) {
    throw new Error('assertion failed');
  }
}
