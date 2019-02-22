import StreamDefinition from './StreamDefinition';
import Stream from './Stream';

export default interface Resolver {
  resolve(streamDefinition: StreamDefinition): Stream | undefined;
}
