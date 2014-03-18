'use strict';

var machine = require('./lib/machine');
var c = require('./lib/constants');


module.exports = function middleware(options) {
    var flow;

    flow = machine.create(options);

    return function(res, res, next) {
        var key, state;

        key = req.param(c.EXECUTION_KEY);
        state = req.session[c.SESSION_KEY];

        flow.run(key, state, function (err, result) {
            if (err) {
                next(err);
                return;
            }

            req.session[c.SESSION_KEY] = result.state;
            res.webflow = res.webflow || {};
            res.webflow.model = result.model;
            next();
        });

    };

}
