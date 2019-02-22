import StreamDefinition from './StreamDefinition';
import Resolver from './Resolver';
import Stream from './Stream';

export class Environment implements Resolver {
  // TODO: our own local Map

  constructor(private readonly parentResolver: Resolver | null) {
  }

  resolve(streamDefinition: StreamDefinition): Stream | undefined {
    // TODO: implement: try to find in our local map, fall back on parentResolver
    return undefined;
  }
}
