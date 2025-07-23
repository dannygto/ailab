import { EventEmitter } from 'events';
import { DeviceConnectionEventType } from './types.js';
export class BaseProtocolAdapter {
    constructor(id, name, protocolName, supportedConnectionTypes) {
        this.id = id;
        this.name = name;
        this.protocolName = protocolName;
        this.supportedConnectionTypes = supportedConnectionTypes;
        this.eventEmitter = new EventEmitter();
        this.connectionStates = new Map();
        this.eventEmitter.setMaxListeners(100);
    }
    async initialize() {
        console.log(`Initializing ${this.name} adapter`);
    }
    getConnectionState(deviceId) {
        if (!this.connectionStates.has(deviceId)) {
            return this.createDefaultConnectionState();
        }
        return this.connectionStates.get(deviceId);
    }
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
    off(event, callback) {
        this.eventEmitter.off(event, callback);
    }
    supportsFeature(featureName) {
        return false;
    }
    getProtocolSpecificMethod(methodName) {
        return null;
    }
    createDefaultConnectionState() {
        return {
            isConnected: false,
            connectionAttempts: 0,
            errors: [],
            statistics: {
                dataSent: 0,
                dataReceived: 0,
                commandsSent: 0,
                responsesReceived: 0
            }
        };
    }
    initializeConnectionState(deviceId) {
        this.connectionStates.set(deviceId, this.createDefaultConnectionState());
    }
    updateConnectionState(deviceId, updates) {
        const currentState = this.getConnectionState(deviceId);
        const updatedState = { ...currentState, ...updates };
        this.connectionStates.set(deviceId, updatedState);
    }
    recordStatistics(deviceId, updates) {
        const currentState = this.getConnectionState(deviceId);
        const updatedStatistics = {
            ...currentState.statistics,
            ...updates
        };
        this.updateConnectionState(deviceId, { statistics: updatedStatistics });
    }
    recordError(deviceId, errorMessage) {
        const currentState = this.getConnectionState(deviceId);
        const errors = [
            ...currentState.errors,
            { message: errorMessage, timestamp: new Date().toISOString() }
        ];
        if (errors.length > 10) {
            errors.shift();
        }
        this.updateConnectionState(deviceId, { errors });
    }
    emitConnectedEvent(deviceId) {
        const event = {
            type: DeviceConnectionEventType.CONNECTED,
            deviceId,
            timestamp: new Date().toISOString()
        };
        this.eventEmitter.emit(DeviceConnectionEventType.CONNECTED, event);
    }
    emitDisconnectedEvent(deviceId) {
        const event = {
            type: DeviceConnectionEventType.DISCONNECTED,
            deviceId,
            timestamp: new Date().toISOString()
        };
        this.eventEmitter.emit(DeviceConnectionEventType.DISCONNECTED, event);
    }
    emitErrorEvent(deviceId, error) {
        const event = {
            type: DeviceConnectionEventType.ERROR,
            deviceId,
            timestamp: new Date().toISOString(),
            error
        };
        this.eventEmitter.emit(DeviceConnectionEventType.ERROR, event);
    }
    emitDataReceivedEvent(deviceId, data) {
        const event = {
            type: DeviceConnectionEventType.DATA_RECEIVED,
            deviceId,
            timestamp: new Date().toISOString(),
            data
        };
        this.eventEmitter.emit(DeviceConnectionEventType.DATA_RECEIVED, event);
    }
    emitStateChangedEvent(deviceId, state) {
        const event = {
            type: DeviceConnectionEventType.STATE_CHANGED,
            deviceId,
            timestamp: new Date().toISOString(),
            data: state
        };
        this.eventEmitter.emit(DeviceConnectionEventType.STATE_CHANGED, event);
    }
    emitCommandSentEvent(deviceId, command) {
        const event = {
            type: DeviceConnectionEventType.COMMAND_SENT,
            deviceId,
            timestamp: new Date().toISOString(),
            data: command
        };
        this.eventEmitter.emit(DeviceConnectionEventType.COMMAND_SENT, event);
    }
    emitCommandResultEvent(deviceId, command, result) {
        const event = {
            type: DeviceConnectionEventType.COMMAND_RESULT,
            deviceId,
            timestamp: new Date().toISOString(),
            data: { command, result }
        };
        this.eventEmitter.emit(DeviceConnectionEventType.COMMAND_RESULT, event);
    }
}
//# sourceMappingURL=base-protocol-adapter.js.map