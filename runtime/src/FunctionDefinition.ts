import FunctionSignature from './FunctionSignature';

export default interface FunctionDefinition {
  signature: FunctionSignature;

  // TODO: given explicit input name, and identity of function arguments, what is the list of output names that may synchronously change?
  // TODO: given an external stream, and the identity of all function-arguments, what is the list of output names that may synchronously change?
  // TODO: (only non-trivial for UserFunctionDefinition) what external streams do you depend on?
}
