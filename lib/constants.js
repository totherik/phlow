'use strict';


module.exports = {

    EXECUTION_KEY: 'execution',

    EVENT_ID: '_eventId',

    SESSION_KEY: '__webflow__',

    ESKEY_REGEX: /^(e\d+)s(\d+)$/,

    Error: {
        MISSING_START_STATE_IN_FLOW_DEF: 'MISSING_START_STATE_IN_FLOW_DEF',
        MISSING_FLOW_NAME_IN_FLOW_DEF: 'MISSING_FLOW_NAME_IN_FLOW_DEF',
        DUPLICATE_FLOW_NAME_IN_FLOW_DEF: 'DUPLICATE_FLOW_NAME_IN_FLOW_DEF',

        // execution key
        EXECUTION_KEY_WRONG_FORMAT: 'EXECUTION_KEY_WRONG_FORMAT',   // not in /^(e\d+)s(\d+)$/ format
        EXECUTION_KEY_NOT_FOUND: 'EXECUTION_KEY_NOT_FOUND',         // not in qfSession
        EXECUTION_STEP_NOT_FOUND: 'EXECUTION_STEP_NOT_FOUND',       // case like s4 not found in e2

        // run time error
        UNKNOWN_EVENT_ID_FROM_ACTION_EXECUTION: 'UNKNOWN_EVENT_ID_FROM_ACTION_EXECUTION',
        UNKNOWN_EVENT_ID_FROM_FRONT_FRONT_END: 'UNKNOWN_EVENT_ID_FROM_FRONT_FRONT_END',
        UNKNOWN_EVENT_ID_FROM_VIEW_ONEXIT: 'UNKNOWN_EVENT_ID_FROM_VIEW_ONEXIT',
        STATE_NAME_NOT_EXIST: 'STATE_NAME_NOT_EXIST',
        FLOW_SECURITY_VIOLATION: 'FLOW_SECURITY_VIOLATION',
        INVALID_STATE_TYPE: 'INvALID_STATE_TYPE'
    },

    DEFAULT_FLOW: 'rootflow',

    BASEDIR: 'flowspecs',

    NOOP: function noop() {
        return true;
    }

};
