import Activatable from './Activatable';
import UserFunctionDefinition from './UserFunctionDefinition';
import Resolver from './Resolver';

/**
 * Note that this only implements Activatable, not FunctionDefinition, and the underlying
 * definition is private. So if a caller wants to manipulate the underlying UserFunctionDefinition,
 * they should have a separate reference to it.
 */
export default class BoundUserFunctionDefinition implements Activatable {
  constructor(private readonly userFunctionDefinition: UserFunctionDefinition, private readonly resolver: Resolver | null) {
  }

  // TODO: implement Activatable
}
