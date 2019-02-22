import StreamDefinition from './StreamDefinition';
import UserFunctionDefinition from './UserFunctionDefinition';

/**
 * A "slot"/container for a reference to a StreamDefinition, which can be re-assigned.
 *
 * These will occur in a user-defined function as the inputs to applications or the internal side
 * of definition outputs.
 */
export default class StreamReference {
  constructor(readonly target: StreamDefinition | null, readonly containingFunctionDefinition: UserFunctionDefinition) {
  }

  assign(target: StreamDefinition | null) : void {
    // TODO: set, notify containingFunctionDefinition
  }
}
