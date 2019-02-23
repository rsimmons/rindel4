import Activatable from './Activatable';
import Activation from './Activation';
import FunctionArguments from './FunctionArguments';
import Resolver from './Resolver';
import UserFunctionDefinition from './UserFunctionDefinition';

/**
 * Note that this only implements Activatable, not FunctionDefinition, and the underlying
 * definition is private. So if a caller wants to manipulate the underlying UserFunctionDefinition,
 * they should have a separate reference to it.
 */
export default class BoundUserFunctionDefinition implements Activatable {
  constructor(private readonly userFunctionDefinition: UserFunctionDefinition, private readonly resolver: Resolver | null) {
  }

  activate(requestUpdate: () => void, functionArguments: FunctionArguments): Activation {
    return this.userFunctionDefinition.activateWithResolver(requestUpdate, functionArguments, this.resolver);
  }
}
