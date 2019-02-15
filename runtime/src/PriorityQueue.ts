import FastPriorityQueue from 'fastpriorityqueue';

interface Element {
  readonly priority: string;
  readonly data: any;
}

export default class PriorityQueue {
  fpq: any

  constructor() {
    this.fpq = new FastPriorityQueue((a: Element, b: Element) => (a.priority < b.priority));
  }

  isEmpty(): boolean {
    return this.fpq.isEmpty();
  }

  // element is expected to have "priority" property that is a string
  insert(priority: string, data: any): void {
    this.fpq.add({priority, data});
  }

  pop(): any {
    return this.fpq.poll().data;
  }

  peek(): any {
    return this.fpq.peek().data;
  }

  clear(): void {
    while (!this.fpq.isEmpty()) {
      this.fpq.poll();
    }
  }
}
