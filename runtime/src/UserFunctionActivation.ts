import Activation from './Activation';
import FunctionArguments from './FunctionArguments';
import Resolver from './Resolver';
import UserFunctionDefinition from './UserFunctionDefinition';

export default class UserFunctionActivation implements Activation {
  constructor(private readonly definition: UserFunctionDefinition, private readonly requestUpdate: () => void, private readonly functionArguments: FunctionArguments, private readonly resolver: Resolver | null) {
  }

  // TODO: update (equivalent of old evauluate)

  destroy(): void {
    // TODO: implement
  }
}
