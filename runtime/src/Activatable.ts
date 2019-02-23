import Activation from './Activation';
import FunctionArguments from './FunctionArguments';
import FunctionDefinition from './FunctionDefinition';

/**
 * Activatable is a function definition that can be activated. If a function definition references
 * streams in outer scopes, then it needs to be bound to an environment to make it activatable.
 *
 * Note: Activatable intentionally does not inherit from FunctionDefinition, since this only
 * represents the activatable behavior.
 */
export default interface Activatable {
  activate(requestUpdate: () => void, functionArguments: FunctionArguments): Activation;
}
