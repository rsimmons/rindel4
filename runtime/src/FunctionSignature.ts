import Tempo from './Tempo';

interface PortSpec {
  name: string;
  tempo: Tempo;
}

export default interface FunctionSignature {
  readonly inputs: PortSpec[];
  readonly outputs: PortSpec[];
}
