'use strict';

var machine = require('./lib/machine');
var c = require('./lib/constants');


module.exports = function middleware(options) {
    var flow;

    flow = machine.create(options);

    return function(req, res, next) {
        var context, state;

        context = {
            key: req.param(c.EXECUTION_KEY),
            eventId: req.param(c.EVENT_ID)
        };

        state = req.session[c.SESSION_KEY];

        flow.run(context, state, function (err, result) {
            if (err) {
                next(err);
                return;
            }

            req.session[c.SESSION_KEY] = result.state;
            res.phlow = res.phlow || {};
            res.phlow.model = result.model;
            next();
        });
    };

}
