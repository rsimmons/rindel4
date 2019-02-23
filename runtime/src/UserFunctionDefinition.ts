import Activation from './Activation';
import FunctionArguments from './FunctionArguments';
import FunctionDefinition from './FunctionDefinition';
import FunctionSignature from './FunctionSignature';
import Resolver from './Resolver';
import StreamDefinition from './StreamDefinition';
import StreamReference from './StreamReference';
import UserFunctionActivation from './UserFunctionActivation';

interface ApplicationSettings {
}

/**
 * The application of a function definition (user or native).
 *
 * Note that a single application (static time) may correspond to many activations (run time).
 */
class Application {
  readonly containingDefinition: FunctionDefinition;
  readonly appliedDefinition: FunctionDefinition;
  readonly functionArguments: FunctionArguments; // TODO: how to change these?
  readonly settings: ApplicationSettings;
  readonly inputs: Map<string, StreamReference>;
  readonly outputs: Map<string, StreamDefinition>;

  constructor(containingDefinition: UserFunctionDefinition, appliedDefinition: FunctionDefinition, functionArguments: FunctionArguments, settings: ApplicationSettings) {
    this.containingDefinition = containingDefinition;
    this.appliedDefinition = appliedDefinition;
    this.functionArguments = functionArguments;
    this.settings = settings; // TODO: take default settings from appliedDefinition?

    // Create input/output objects to match signature of appliedDefinition
    this.inputs = new Map();
    for (const sigIn of appliedDefinition.signature.inputs) {
      this.inputs.set(sigIn.name, new StreamReference(null, containingDefinition));
    }

    this.outputs = new Map();
    for (const sigOut of appliedDefinition.signature.outputs) {
      this.outputs.set(sigOut.name, new StreamDefinition(sigOut.tempo));
    }
  }

  // TODO: setSettings? will need to notify containingDefinition
}

export default class UserFunctionDefinition implements FunctionDefinition {
  readonly signature: FunctionSignature;

  private readonly parentDefinition: UserFunctionDefinition | null;
  private readonly childDefinitions: Set<UserFunctionDefinition> = new Set();
  private readonly applications: Set<Application> = new Set();
  private readonly applicationSortIndex: Map<Application, number> = new Map(); // the result of toposort
  private readonly activations: Set<UserFunctionActivation> = new Set(); // all activations of this definition

  constructor(parentDefinition: UserFunctionDefinition | null, signature: FunctionSignature) {
    this.parentDefinition = parentDefinition;
    this.signature = signature;
  }

  activateWithResolver(requestUpdate: () => void, functionArguments: FunctionArguments, resolver: Resolver | null): UserFunctionActivation {
    const activation = new UserFunctionActivation(this, requestUpdate, functionArguments, resolver);

    // Add the new activation to the set of all activations of this definition
    this.activations.add(activation);

    return activation;
  }

  /**
   * Notify this definition that one of its activations was deactivated
   */
  deactivatedActivation(activation: UserFunctionActivation) {
    this.activations.delete(activation);
  }

  addChildDefinition(signature: FunctionSignature): UserFunctionDefinition {
    const def = new UserFunctionDefinition(this, signature);

    this.childDefinitions.add(def);

    return def;
  }

  addApplication(definition: FunctionDefinition, functionArguments: FunctionArguments, settings: ApplicationSettings): Application {
    // TODO: validate functionArguments

    // TODO: default settings here, or in Application constructor?
    const app = new Application(this, definition, functionArguments, settings);

    this.applications.add(app);

    // TODO: update sort. even though inputs aren't connected yet, there could be a function-argument
    //  that references an outer scope stream, so this application needs to be placed in sort.

    // TODO: notify all activations of this definition about change. they should request updates if necessary? wrap in begin/end update?

    return app;
  }

  removeApplication(application: Application): void {
    if (!this.applications.has(application)) {
      throw new Error('Can\'t remove application that hasn\'t been added');
    }

    this.applications.delete(application);

    // TODO: update sort

    // TODO: notify all activations of this definition about change. they should request updates if necessary? wrap in begin/end update?
  }

  /**
   * Notify the definition that some StreamReference that it owns has changed its target.
   */
  changedReference(): void {
    // TODO: Update toposort

    // TODO: notify all activations of this definition about change. they should request updates if necessary? wrap in begin/end update?
  }
}
