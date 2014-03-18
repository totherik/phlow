'use strict';

var machine = require('./lib/machine');
var c = require('./lib/constants');



// module.exports = function (options) {
//
//     Object.keys(defaults).forEach(function (setting) {
//         options[setting] = options[setting] || defaults[setting];
//     });
//
//
//
//     return Object.create(null, {
//
//         service: function (req, res, next) {
//             var key, task;
//
//             if (!req.session) {
//                 next(new Error('Session support is required for this feature.'));
//                 return;
//             }
//
//             // req.session[c.SESSION_KEY] = req.session[c.SESSION_KEY] || {};
//             // task = req.param[c.EXECUTION_KEY] ? flow.resume(options) : flow.create(options);
//             // task(req, res, next);
//
//             execution = req.session[c.SESSION_KEY];
//             flow.run(execution, function (err, result) {
//                 if (err) {
//                     next(err);
//                     return;
//                 }
//
//                 req.session[c.SESSION_KEY] = result.execution;
//                 res.webflow = res.webflow || {};
//                 res.webflow.model = result.model;
//                 next();
//             }
//
//             // req.session
//
//             // req.param('execution')
//             // req.param('_eventId')
//
//             // res.webflow.model = {
//             //     viewName: last(execution.steps).viewName,
//             //     flowExecutionKey: execution.ekey + 's' + (execution.steps.length)
//             // }
//         }
//
//     });
//
// };


module.exports = function middleware(options) {
    var flow;

    var flow = machine.create(options);

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
