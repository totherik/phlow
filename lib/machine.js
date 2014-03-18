'use strict';

var assert = require('assert');
var thing = require('core-util-is');
var util = require('./util');
var c = require('./constants');
var debug = require('debuglog')('webflow/machine');


var proto = {

    run: function run(context, states, callback) {
        var self, key, eventId, startState, execution;

        self = this;
        context = context || {};
        states = states || {};
        key = context.key;
        eventId = context.eventId;

        function complete(err) {
            var model;

            if (err) {
                callback(err);
                return;
            }

            model = {
                states: states,
                model: {
                    viewName: util.peek(execution.history).viewName,
                    flowExecutionKey: execution.key + 's' + (execution.history.length)
                }
            };

            callback(null, model);
        }

        if (key) {
            // Resume flow
            debug('Resuming execution of flow %s.', key);
            this._getCurrentExecution(context.key, states, function onCurrentExecution(err, exec) {
                if (err) {
                    complete(err);
                    return;
                }

                execution = exec;
                self._getNextState(exec, eventId, function onNextState(err, nextState) {
                    if (err) {
                        complete(err);
                        return;
                    }

                    self._execute(exec, nextState, complete);
                });

            });
            return;
        }

        // Create flow
        key = util.createKey(function exists(key) {
            return states && states[key];
        });

        debug('Creating new flow %s.', key);
        execution = states[key] = {
            key: key,
            history: [],
            chain: [{
                flow: this.startFlow.name,
                state: undefined
            }]
        };

        this._execute(execution, this.startFlow.startState, complete);
    },

    _getCurrentExecution: function _getCurrentExecution(executionKey, states, callback) {
        var err, match, execution, stateKey, state;

        match = c.ESKEY_REGEX.exec(executionKey);
        if (!match) {
            err = new Error('invalid eskey ' + executionKey);
            err.code = c.Error.EXECUTION_KEY_WRONG_FORMAT;
            callback(err);
            return;
        }

        execution = states[match[1]];
        if (!execution) {
            err = new Error('execution key not found: ' + match[1]);
            err.code = c.Error.EXECUTION_KEY_NOT_FOUND;
            callback(err);
            return;
        }

        stateKey = parseInt(match[2], 10);
        state = execution.history[stateKey - 1];
        if (!state) {
            err = new Error('execution state not found: ' + stateKey);
            err.code = c.Error.EXECUTION_STEP_NOT_FOUND;
            callback(err);
            return;
        }

        // Remove any history past this state (e.g. back button was used)
        execution.history = execution.history.slice(0, stateKey);
        execution.chain = util.clone(execution.chain); // TODO: Why clone?
        callback(null, execution);
    },


    _getNextState: function _getNextState(execution, eventId, callback) {
        var context, flow, state, event, err;

        context = util.peek(execution.chain);
        flow = this.definition[context.flow]
        state = flow.states[context.state];
        event = state[eventId];

        if (!event) {
            err = new Error('Unknown event id from front end \'' + eventId + '\' for flow \'' + context.flow + '\' and view state \'' + context.state + '\'');
            err.code = c.Error.UNKNOWN_EVENT_ID_FROM_FRONT_FRONT_END;
            callback(err);
            return;
        }

        if (thing.isString(event.onExit)) {
            state.impl[event.onExit](function onExitDone(err, eventId) {
                if (err) {
                    callback(err);
                    return;
                }

                eventId = eventId || 'success';
                if (typeof eventId !== 'string' || !event.transitions || !event.transitions[eventId]) {
                    err = new Error('Unknown event id "' + eventId + '" for flow \'' + context.flow + '\' and view state \'' + context.state + '\' and onExit:' + event.onExit);
                    err.code = c.Error.UNKNOWN_EVENT_ID_FROM_VIEW_ONEXIT;
                    callback(err);
                    return;
                }

                callback(null, event.transitions[eventId]);
            });
            return;
        }

        // event is string?
        callback(null, event);
    },


    _execute: function _execute(execution, nextState, callback) {
        var err, self, context, flow, state;

        if (!execution.chain.length) {
            callback(null);
            return;
        }

        self = this;
        context = util.peek(execution.chain);
        flow = this.definition[context.flow];
        state = flow.states[nextState];

        if (!state) {
            err = new Error('State ' + nextState + ' in ' + flow.name + ' does not exist');
            err.code = c.Error.STATE_NAME_NOT_EXIST;
            callback(err);
            return;
        }


        debug('Advancing to %s state \'%s\'', state.type, nextState);
        switch (state.type) {

            case 'view':
                // Base case
                context.state = nextState;
                state = flow.states[context.state];
                state.impl.onEntry(function onEntryDone(err, viewName) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    execution.history.push({
                        flow:     context.flow,
                        state:    context.state,
                        chain:    util.clone(context.chain),
                        viewName: viewName || state.viewName
                    });

                    callback(null, execution);
                });
                break;

            case 'action':
                context.state = nextState;
                state = flow.states[context.state];
                state.impl.onEntry(function onEntryDone(err, eventId) {
                    var event;

                    if (err) {
                        callback(err);
                        return;
                    }

                    event = state[eventId];
                    if (!event) {
                        err = new Error('executeActionState: Unknown event id "' + eventId + '" for flow:' + context.flow + ' and action state:' + context.state);
                        err.code = c.Error.UNKNOWN_EVENT_ID_FROM_ACTION_EXECUTION;
                        callback(err);
                        return;
                    }

                    self._execute(execution, event, callback);
                });
                break;

            case 'subflow':
                // Update current context
                context.state = nextState;

                // Enforce security policy
                if (flow.securedRoles && !this.policy(flow.securedRoles)) {
                    err = new Error('Security violation for flow ' + flow.name);
                    err.code = c.Error.FLOW_SECURITY_VIOLATION;
                    callback(err);
                    return;
                }

                // Update execution chain with new flow.
                execution.chain.push({
                    flow: flow.name,
                    state: undefined
                });

                // Recurse until we encounter an 'action' or 'view' state.
                this._execute(execution, flow.startState, callback);
                break;

            case 'end':
                context = execution.chain.pop();
                if (!execution.chain.length) {
                    // Flow complete
                    callback(null);
                    return;
                }

                // Recurse until we encounter an `action` or `view` state
                context = util.peek(execution.chain);
                flow = this.definition[context.flow];
                state = flow.states[context.state];
                this._execute(execution, state.transitions[state.name], callback);
                break;

            default:
                err = new Error('Invalid state type \'' + state.type + '\'');
                err.code = e.Error.INVALID_STATE_TYPE;
                callback(err);
        }

    }

};


exports.create = function create(options) {
    var startFlow;

    debug('Creating machine');

    assert(thing.isObject(options), 'Configuration options are required.');
    assert(thing.isObject(options.definition), 'A flow definition is required.');

    startFlow = options.startFlow || c.DEFAULT_FLOW;
    assert(thing.isObject(options.definition[startFlow]), 'Start flow \'' + startFlow + '\' is not defined.');

    return Object.create(proto, {

        startFlow: {
            get: function get() {
                return this.definition[startFlow];
            }
        },

        definition: {
            value: options.definition,
            enumerable: true,
            writable: true
        },

        policy: {
            value: options.policy || c.NOOP,
            enumerable: true,
            writable: true
        }

    });

}
