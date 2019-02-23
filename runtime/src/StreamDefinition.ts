import Tempo from './Tempo';

export default class StreamDefinition {
  readonly tempo: Tempo;

  constructor(tempo: Tempo) {
    this.tempo = tempo;
  }
}
