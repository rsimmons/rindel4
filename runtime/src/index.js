import UserDefinition from './UserDefinition';
import UserClosure from './UserClosure';
import * as nativeDefinitionHelpers from './nativeDefinitionHelpers';

// Create a closure of an empty user-defined function definition at the root level (not contained within another definition)
export function createRootUserClosure(signature) {
  return new UserClosure(new UserDefinition(null, signature), null);
}

export { nativeDefinitionHelpers };
