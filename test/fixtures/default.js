'use strict';

module.exports = {

    rootflow: {

        name: 'rootflow',

        startState: 'firstState',

        endStates: ['end'],

        states: {

            firstState: {

                type: 'view',

                impl: {

                    onEntry: function (done) {
                        // Defaults to `viewName`
                        done();
                    },

                    submit: function (done) {
                        done(null, 'success');
                    }

                },

                viewName: 'firstPage',

                submit: {

                    onExit: 'submit',

                    transitions: {

                        success: 'secondState'

                    }

                }

            },

            secondState: {

                type: 'action',

                impl: {

                    onEntry: function (done) {
                        done(null, 'success');
                    }

                },

                success: 'thirdState'

            },

            thirdState: {

                type: 'action',

                impl: {

                    onEntry: function (done) {
                        done(null, 'success');
                    }

                },

                success: 'end'

            },

            end: {
                name: 'end',
                type: 'end'
            }

        }

    }

};
