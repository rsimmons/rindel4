import StreamDefinition from './StreamDefinition';

export default interface Resolver {
  resolve(streamDefinition: StreamDefinition): Stream;
}
