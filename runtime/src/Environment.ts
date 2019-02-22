import StreamDefinition from './StreamDefinition';
import Resolver from './Resolver';

export class Environment implements Resolver {
  private readonly parentResolver: Resolver | null;
  // TODO: our own local Map

  resolve(streamDefinition: StreamDefinition): Stream | undefined {
    // TODO: implement: try to find in our local map, fall back on parentResolver
  }
}
