```javascript

{

    flowName: '',

    startState: '',

    endStates: ['theend']

    states: {

        action: {
            name: 'foobar',
            impl: {
                onEntry: function (req, res, next) {
                    next();
                }
            },
            '{event}': {
                onExit: function (req, res, next) {
                    next();
                },
                transitions: {
                    success: '{stateName}'
                }
            }
        },

        view: {
            name: 'name'
        },

        subflow: {
            name: 'name'
        },

        foobar: {
            name: 'foobar',
            type:'action|view|subflow'
        },

        theend: {
            name: 'theend',
            type: 'end'
        }

    }

}

```


```javascript
Session Contents:

{
    'e1': {
        key: 'e1',
        // history
        steps: [{
            flow: '',
            state: '',
            chain: '',
            view: ''
        }],
        chain: [ {
            flow: '',
            state: ''
        }]
    },
    'e2': {
        key: 'e2',
        // history
        steps: [{
            flow: '',
            state: '',
            chain: '',
            view: ''
        }],
        chain: [ {
            flow: '',
            state: ''
        }]
    }

}
```


```
       run

create     resume
  |          |
  |      run exit hook

      exec
```
