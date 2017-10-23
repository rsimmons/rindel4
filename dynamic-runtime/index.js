import PriorityQueue from './PriorityQueue';
import Stream from './Stream';

function removeSingle(arr, val) {
  const idx = arr.indexOf(val);
  if (idx < 0) {
    throw new Error('value not in array');
  }
  arr.splice(idx, 1);
  const idx2 = arr.indexOf(val);
  if (idx2 >= 0) {
    throw new Error('value present more than once');
  }
}

function assert(v) {
  if (!v) {
    throw new Error('assertion failed');
  }
}

class OutPort {
  constructor(containingDefinition) {
    this.containingDefinition = containingDefinition;
    this.connections = Set();
  }
}

class InPort {
  constructor(containingDefinition) {
    this.containingDefinition = containingDefinition;
    this.connections = Set();
    // TODO: have a specification of the task to be performed when receiving an update
  }
}

class Connection {
  constructor(outPort, inPort, path) {
    this.outPort = outPort;
    this.inPort = inPort;
    this.path = path;
  }
}

// Within a UserDefinition, this represents the application of a native function
class NativeApplication {
  constructor(nativeDefinition) {
    this.nativeDefinition = nativeDefinition;
    // TODO: store port objects?
  }
}

// Definition of a user-defined (not native) function
// containingDefinition is the UserDefinition that contains this one, or null if this is a root-level definition.
// outPort will be null iff containingDefinition is null
class UserDefinition {
  constructor(containingDefinition, outPort) {
    this.containingDefinition = containingDefinition;
    this.outPort = outPort;

    this.definitions = new Set();
    this.nativeApplications = new Set();

    // All activations of this definition (UserActivation instances)
    this.activations = new Set();
  }
}

// Combination of a function definition and a containing activation (outer scope).
//  The containingActivation could be null if the definition is not contained in another definition.
class Closure {
  constructor(definition, containingActivation) {
    this.definition = definition;
    this.containingActivation = containingActivation;
  }
}

// Activation of a user-defined (not native) function
class UserActivation {
  constructor() {
    // Maps from OutPort and InPort objects to their corresponding Stream objects for this activation
    this.outPortStream = new Map();
    this.inPortStream = new Map();

    // Map from native applications (within this user-defined function) to their activations (NativeApplication -> NativeActivation)
    this.containedNativeActivations = new Map();

    // Map from contained definitions to their activations within the context of this activation (UserDefinition -> Set(UserActivation))
    this.containedDefinitionActivations = new Map();
  }
}

// Activation of a native (not user-defined) function
class NativeActivation {
}

class NewDynamicRuntime {
  constructor() {
    this.pumping = false; // is there currently a call to pump() running?
    this.priorityQueue = new PriorityQueue(); // this should be empty unless we are pumping
    this.currentInstant = 1; // before pump this is next instant, during pump it's current instant

    this.rootDefinitions = new Set(); // function definitions not contained by others

    this.connections = new Set(); // all connections, since they can cross definitions so not owned by definitions
  }

  // Create a new (initially empty) user-defined function definition at the root level (not contained within another definition)
  addRootUserDefinition() {
    const definition = new UserDefinition(null, null);

    this.rootDefinitions.add(definition);

    return definition;
  }

  // Create a new (initially empty) user-defined function definition, contained within the given containingDefinition.
  addContainedUserDefinition(containingDefinition) {
    const outPort = new OutPort(containingDefinition); // this port represents the output of the function-value of the new definition

    const definition = new UserDefinition(containingDefinition, outPort);

    containingDefinition.definitions.add(definition);

    // Update all activations of the containing definition
    for (const containingActivation of containingDefinition.activations) {
      // Make closure with definition and containingActivation
      const closure = new Closure(definition, containingActivation);

      // Make a stream with the closure as value
      const stream = new Stream(closure, this.currentInstant);

      // Store the closure-output stream in the containing activation, associated with the outPort
      containingActivation.outPortStream.set(outPort, stream);

      // Add an entry to the map from contained definitions to their activation sets
      containingActivation.containedDefinitionActivations.set(definition, new Set());
    }

    return definition;
  }

  // containingActivation may be null if the definition does not reference any outer scopes.
  // Return a UserActivation
  _activateUserDefinition(definition, containingActivation) {
    const activation = new UserActivation();

    // TODO: fill out the activation with stuff based on the definition (activate native applications, make closures for contained definitions, etc)

    // Add the new activation to the set of _all_ activations of this definition
    definition.activations.add(activation);

    // Add the new activation to the set of activations of this definition within the given containing activation
    containingActivation.containedDefinitionActivations.get(definition).add(activation);

    return activation;
  }

  _activateNativeDefinition(definition) {
    // TODO: implement. return NativeActivation. this may involve creating Streams, hooking output callbacks
  }

  // Activate the given definition (native or user-defined).
  // If containingActivation is non-null, then it is the containing activation to be used for resolving references to outer scopes.
  // The tuple of (definition, containingActivation) is effectively a closure (since activations know their parent activations).
  activateDefinition(definition, containingActivation) {
    if (definition instanceof UserDefinition) {
      // definition is user-defined
      return this._activateUserDefinition(definition, containingActivation);
    } else {
      // TODO: Have a class for NativeDefinition so we can instanceof check it here?
      // Definition is native.
      // Since native functions can't have references to outer scopes, we don't need to pass on our containingActivation argument.
      return this._activateNativeDefinition(definition);
    }
  }

  addNativeApplication(containingDefinition, nativeDefinition) {
    // TODO: also create port objects? in the future they need to be dynamically created, but we could pre-create for now and store in app object
    // TODO: verify that nativeDefinition is in fact a native definition?

    const app = new NativeApplication(nativeDefinition);

    containingDefinition.nativeApplications.add(app);

    // For each current activation of the containing definition, make an activation of the native definition
    //  and store it in the containing activation
    for (const containingActivation of containingDefinition.activations) {
      // Make an activation of nativeDefinition
      const newActivation = this._activateNativeDefinition(nativeDefinition);

      // Store the new activation in the containing activation
      containingActivation.containedNativeActivations.set(app, newActivation);
    }

    return app;
  }

  _notifyInPort(inPort, activation) {
    // TODO: see what task is associated with inPort, and insert it into the priority queue
  }

  // Propagate value change along the given connection within the context of the given activation.
  // TODO: We could use this same function to flow an undefined when we disconnect a connection. Could take an optional "value override" parameter
  _flowConnection(cxn, activation) {
    // Since a connection may go into a contained definition, flowing a connection (within the context of a single activation)
    //  may cause the value to "fan out" to multiple activations (or none). So first, we compute the set of relevant activations
    //  on the downstream end of the connection.
    let downstreamActivations = [activation];
    for (const def of cxn.path) {
      const nextDownstreamActivations = [];

      for (const act of downstreamActivations) {
        // TODO: for each activation of def (within the context of act), add it to nextDownstreamActivations
      }

      downstreamActivations = nextDownstreamActivations;
    }

    // Now copy the change from the outPort stream to each inPort stream
    const outStream = activation.outPortStream.get(cxn.outPort);
    for (const act of downstreamActivations) {
      const inStream = act.inPortStream.get(cxn.inPort);
      assert(outStream.lastChangedInstant > inStream.lastChangedInstant); // I think this should be true
      inStream.latestValue = outStream.latestValue; // copy the actual value downstream!
      this._notifyInPort(cxn.inPort, act); // trigger anything "listening" on this port
    }
  }

  // Figure out the series of nested definitions that we need to enter to get from outPort to inPort.
  //  Return an array of definition objects. If outPort and inPort are in same scope, then the array
  //  will be empty.
  //  If there is no path, then return null.
  _computeDefinitionPath(outPort, inPort) {
    // Shortcut the common case
    if (outPort.containingDefinition === inPort.containingDefinition) {
      return [];
    }

    // TODO: implement. need to do lowest common ancestor of definition tree, I think. look at the containingDefinition of ports
    throw new Error('unimplemented');
  }

  // NOTE: This returns a path if valid, otherwise returns null
  _validateConnection(outPort, inPort) {
    const path = _computeDefinitionPath(outPort, inPort);
    if (!path) {
      return null;
    }

    // TODO: add further checks

    return path;
  }

  isValidConnection(outPort, inPort) {
    return !!_validateConnection(outPort, inPort);
  }

  addConnection(outPort, inPort) {
    // Validate connection (which finds its definition path as a side effect)
    const v = this._validateConnection(outPort, inPort);
    if (!v) {
      throw new Error('invalid connection, caller should check first');
    }
    const path = v;

    const cxn = new Connection(outPort, inPort, path);

    this.connections.add(cxn);

    // "Flow" the connection for all activations of the definition containing outPort.
    for (const act of outPort.containingDefinition.activations) {
      this._flowConnection(cxn, act);
    }
  }
}

export default class DynamicRuntime {
  constructor() {
    this.nodeMap = new Map(); // maps nodeId -> instance record
    this.nextNodeId = 1;

    this.cxnMap = new Map(); // maps cxnId -> connection record
    this.nextCxnId = 1;

    this.pumping = false; // is there currently a call to pump() running?
    this.priorityQueue = new PriorityQueue(); // this should be empty unless we are pumping

    this.currentInstant = 1; // before pump this is next instant, during pump it's current instant
  }

  addNode(nodeDef) {
    const nid = this.nextNodeId;
    this.nextNodeId++;

    // Create inputs map
    const inputs = {}; // map port name to record
    for (const k in nodeDef.inputs) {
      inputs[k] = {
        cxn: null,
        stream: new Stream(),
      }
      inputs[k].stream.lastChangedInstant = this.currentInstant;
    }

    // Create output streams and cxn lists
    const outputs = {}; // maps port name to record
    for (const k in nodeDef.outputs) {
      outputs[k] = {
        cxns: [],
        stream: new Stream(),
      };
    }

    // TODO: can we do this without a closure?
    const setOutputs = (changedOutputs) => {
      const pq = this.priorityQueue;

      // For each changed output, save to stream and insert PQ tasks for downstream ports
      for (const outPort in changedOutputs) {
        // TODO: I think we can do a sanity check here: if the lastChangedInstant of this
        //  stream is the current instant, then we are in some kind of cycle or a node
        //  has misbehaved and output more than once
        outputs[outPort].stream.setValue(changedOutputs[outPort], this.currentInstant);

        // Insert PQ tasks for downstream nodes
        for (const cid of outputs[outPort].cxns) {
          const cxn = this.cxnMap.get(cid);
          const downstreamNodeId = cxn.toNodeId;
          this.insertNodeTask(downstreamNodeId);
        }
      }

      if (!this.pumping) {
        this.pump();
      }
    };

    // Build context object
    const context = {
      setOutputs,
      state: null,
      // TODO: can we define setState without a closure?
      setState: (newState) => {
        // TODO: Do we want to immediately reflect state update to nodes? Perhaps there is no harm
        context.state = newState;
      },
      transient: null,
    };

    // Instantiate node if it has a create method
    // NOTE: This doesn't actually return anything, create() calls
    //  functions in context to set outputs, store state, etc.
    if (nodeDef.create) {
      nodeDef.create(context);
    }

    // Make record in map
    this.nodeMap.set(nid, {
      nodeDef,
      context,
      inputs,
      outputs,
      // toposortIndex: null, // since not connected, no index
      toposortIndex: nid, // TODO: unhack (restore line above) when we have toposort
    });

    return nid;
  }

  removeNode(nodeId) {
    const node = this.nodeMap.get(nodeId);

    // Remove any connections involving this node
    for (const p in node.inputs) {
      if (node.inputs[p].cxn) {
        this.internalRemoveConnection(node.inputs[p].cxn, nodeId);
      }
    }
    for (const p in node.outputs) {
      for (const cid of node.outputs[p].cxns) {
        this.internalRemoveConnection(cid, nodeId);
      }
    }

    // Call destroy function, if present
    if (node.nodeDef.destroy) {
      node.nodeDef.destroy(node.context);
    }

    // Remove the node from map
    this.nodeMap.delete(nodeId);

    // Do any necessary updating
    this.pump();
  }

  disconnectPort(nodeId, isInput, port) {
    const node = this.nodeMap.get(nodeId);

    if (isInput) {
      if (node.inputs[port].cxn) {
        this.internalRemoveConnection(node.inputs[port].cxn);
      }
    } else {
      for (const cid of node.outputs[port].cxns) {
        this.internalRemoveConnection(cid);
      }
    }

    // Do any necessary updating
    this.pump();
  }

  addConnection(fromNodeId, fromPort, toNodeId, toPort) {
    const cid = this.nextCxnId;
    this.nextCxnId++;

    // TODO: we could sanity check node ids and port names

    const fromNode = this.nodeMap.get(fromNodeId);
    const toNode = this.nodeMap.get(toNodeId);

    if (toNode.inputs[toPort].cxn) {
      throw new Error('input port already has a connection');
    }

    fromNode.outputs[fromPort].cxns.push(cid);
    toNode.inputs[toPort].cxn = cid;
    toNode.inputs[toPort].stream = fromNode.outputs[fromPort].stream;

    this.cxnMap.set(cid, {
      fromNodeId,
      fromPort,
      toNodeId,
      toPort,
    });

    if (!this.updateToposort()) {
      // Sort failed, so need to roll back addition
      // TODO: implement
      throw new Error('sort failed');
    }

    // Update downstream node unless stream is event
    if (fromNode.nodeDef.outputs[fromPort].tempo !== 'event') {
      this.insertNodeTask(toNodeId);
      this.pump();
    }

    return cid;
  }

  clear() {
    // Destroy all nodes (many require cleanup)
    for (const [nid, node] of this.nodeMap) {
      if (node.nodeDef.destroy) {
        node.nodeDef.destroy(node.context);
      }
    }

    this.nodeMap.clear();
    this.cxnMap.clear();
    this.pumping = false;
    this.priorityQueue.clear();
  }

  internalRemoveConnection(cxnId, dontUpdateNodeId) {
    const cxn = this.cxnMap.get(cxnId);

    const fromNode = this.nodeMap.get(cxn.fromNodeId);
    const toNode = this.nodeMap.get(cxn.toNodeId);

    removeSingle(fromNode.outputs[cxn.fromPort].cxns, cxnId);

    toNode.inputs[cxn.toPort].cxn = null;
    const stream = new Stream();
    stream.lastChangedInstant = this.currentInstant;
    toNode.inputs[cxn.toPort].stream = stream;

    if (cxn.toNodeId !== dontUpdateNodeId) {
      this.insertNodeTask(cxn.toNodeId);
    }

    this.cxnMap.delete(cxnId);
  }

  removeConnection(cxnId) {
    this.internalRemoveConnection(cxnId);
    this.pump();
  }

  updateToposort() {
    // TODO: implement
    return true;
  }

  insertNodeTask(nodeId) {
    const priority = this.nodeMap.get(nodeId).toposortIndex;
    this.priorityQueue.insert(priority, nodeId);
  }

  pump() {
    const pq = this.priorityQueue;
    const instant = this.currentInstant;

    if (pq.isEmpty()) {
      // Shortcut to not increment instant count
      return;
    }

    while (!pq.isEmpty()) {
      const nid = pq.pop();

      // Keep popping and discarding as long as next task is for same node id (there may be duplicates)
      while (!pq.isEmpty() && (pq.peek() === nid)) {
        pq.pop();
      }

      // Do update for given node
      const nodeRec = this.nodeMap.get(nid);
      const inputs = {};
      for (const k in nodeRec.nodeDef.inputs) {
        const inputStream = nodeRec.inputs[k].stream;
        const changed = inputStream.lastChangedInstant === instant;

        if (nodeRec.nodeDef.inputs[k].tempo === 'event') {
          inputs[k] = {
            value: changed ? inputStream.latestValue : undefined, // don't expose old event data
            present: changed,
          };
        } else {
          inputs[k] = {
            value: inputStream.latestValue,
            changed,
          };
        }
      }
      if (!nodeRec.nodeDef.update) {
        throw new Error('node has inputs but no update function');
      }
      nodeRec.nodeDef.update(nodeRec.context, inputs);
    }

    this.currentInstant++;
  }
}
