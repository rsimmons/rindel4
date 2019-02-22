import UserFunctionDefinition from './UserFunctionDefinition';
import BoundUserFunctionDefinition from './BoundUserFunctionDefinition';
import FunctionSignature from './FunctionSignature';
import Activatable from './Activatable';

export function createRootUserFunctionDefinition(signature: FunctionSignature) : {functionDefinition: UserFunctionDefinition, activatable: Activatable} {
  const functionDefinition = new UserFunctionDefinition(null, signature);
  const activatable = new BoundUserFunctionDefinition(functionDefinition, null);

  // Return these separately so that caller doesn't need to retrieve the def from bound def (it can be hidden)
  return {
    functionDefinition,
    activatable,
  };
}
