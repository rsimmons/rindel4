import Stream from './Stream';
import StreamDefinition from './StreamDefinition';

export default interface Resolver {
  resolve(streamDefinition: StreamDefinition): Stream | undefined;
}
