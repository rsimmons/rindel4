import StreamDefinition from './StreamDefinition';
import UserFunctionDefinition from './UserFunctionDefinition';

/**
 * A "slot"/container for a reference to a StreamDefinition, which can be re-assigned.
 *
 * These will occur in a user-defined function as the inputs to applications or the internal side
 * of definition outputs.
 */
export default class StreamReference {
  target: StreamDefinition | null;
  readonly owningDefinition: UserFunctionDefinition;

  constructor(target: StreamDefinition | null, owningDefinition: UserFunctionDefinition) {
    this.target = target;
    this.owningDefinition = owningDefinition;

  }

  assign(target: StreamDefinition | null) : void {
    // TODO: how do we validate the target? sorting aside. I guess we could ask the owning definition
    this.target = target;
    this.owningDefinition.changedReference();
  }
}
