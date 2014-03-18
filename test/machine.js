'use strict';

var test = require('tape');
var path = require('path');
var machine = require('../lib/machine');


test('config', function(t) {
    // Mandatory config
    t.throws(function () {
        machine.create();
    });

    // Mandatory flow definition
    t.throws(function () {
        machine.create({});
    });

    // Requirements fulfilled;
    t.doesNotThrow(function () {
        machine.create({
            definition: require('./fixtures/default')
        });
    });

    t.end();
});


test('create', function (t) {
    var flow, states;

    flow = machine.create({
        definition: require('./fixtures/default')
    });

    t.test('initial state', function (t) {
        flow.run(undefined, undefined, function (err, result) {
            t.error(err);
            t.ok(result);
            t.ok(result.states);
            t.ok(result.states['e1']);
            states = result.states;
            t.end();
        });
    });


    t.test('addtional state', function (t) {
        flow.run(undefined, states, function (err, result) {
            t.error(err);
            t.ok(result);
            t.ok(result.states);
            t.ok(result.states['e1']);
            t.ok(result.states['e2']);
            t.end();
        });
    });

});


test('resume', function (t) {
    var flow, states;

    flow = machine.create({
        definition: require('./fixtures/default')
    });

    states = {};

    t.test('nonexistent state', function (t) {
        var context = {
            key: 'e5s5',
            eventId: undefined
        };

        flow.run(context, states, function (err, result) {
            t.ok(err);
            t.equal('EXECUTION_KEY_NOT_FOUND', err.code);
            t.end();
        });
    });


    t.test('existing state', function (t) {

        // Start flow
        flow.run(undefined, states, function (err, result) {
            t.error(err);

            var time = process.hrtime();
            flow.run({ key: result.model.flowExecutionKey, eventId: 'submit' }, result.states, function (err, result) {

                console.log(process.hrtime(time));
                t.error(err);
                t.ok(result);
                t.ok(result.states);
                t.ok(result.states['e1']);
                t.end();
            });

        });

    });

});
