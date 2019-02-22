import FunctionArguments from './FunctionArguments';
import Activation from './Activation';
import Resolver from './Resolver';
import UserFunctionActivation from './UserFunctionActivation';
import FunctionSignature from './FunctionSignature';

export default class UserFunctionDefinition {
  // TODO: addChildDefinition, takes a signature
  // TODO: addApplication, takes AppliableFunctionDefinition, function-arguments, settings?
  // TODO: removeApplication
  // TODO: setStreamReference, takes either an application input or definition output and a StreamDefinition | undefined
  // TODO: setApplicationSettings?, takes application, new settings
  // TODO: notify that an activation of this was deactivated

  // All activations of this definition
  activations: Set<UserFunctionActivation> = new Set();

  constructor(private readonly parentDefinition: UserFunctionDefinition | null, private readonly signature: FunctionSignature) {
  }

  activateWithResolver(requestUpdate: () => void, functionArguments: FunctionArguments, resolver: Resolver | null): Activation {
    const activation = new UserFunctionActivation(this, requestUpdate, functionArguments, resolver);

    // Add the new activation to the set of all activations of this definition
    this.activations.add(activation);

    return activation;
  }
}
