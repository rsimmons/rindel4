import Activation from './Activation';
import UserFunctionDefinition from './UserFunctionDefinition';
import FunctionArguments from './FunctionArguments';
import Resolver from './Resolver';

export default class UserFunctionActivation implements Activation {
  constructor(private readonly definition: UserFunctionDefinition, private readonly requestUpdate: () => void, private readonly functionArguments: FunctionArguments, private readonly resolver: Resolver | null) {
  }

  // TODO: update (equivalent of old evauluate)

  destroy(): void {
    // TODO: implement
  }
}
