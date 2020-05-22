import engine from '@croct/plug-rule-engine/plugin';
import {ExtensionFactory} from '@croct/plug-rule-engine/extension';
import {createPluginSdkMock} from './mocks';
import ActionExtension from '../src/extension';
import '../src/index';

jest.mock('@croct/plug-rule-engine/plugin', () => ({
    default: {
        extend: jest.fn(),
    },
}));

jest.mock('../src/extension', () => {
    const actual = jest.requireActual('../src/extension');

    return {
        ...actual,
        default: jest.fn(),
    };
});

describe('An action extension installer', () => {
    test('should register the extension', () => {
        expect(engine.extend).toBeCalledWith('actions', expect.anything());

        const [, factory]: [string, ExtensionFactory] = (engine.extend as jest.Mock).mock.calls[0];

        const sdk = createPluginSdkMock();

        factory({options: {}, sdk: sdk});

        expect(ActionExtension).toBeCalledTimes(1);
        expect(ActionExtension).toBeCalledWith({}, sdk);
    });

    test.each<[any, string]>([
        [
            {fooAction: 1},
            "Expected value of type object or array at path '/fooAction', actual integer.",
        ],
        [
            {
                fooAction: {
                    action: {
                        type: 'custom',
                        handler: {apply: jest.fn()},
                    },
                },
            },
            "Missing property '/fooAction/trigger'.",
        ],
        [
            {
                fooAction: {trigger: 'match'},
            },
            "Missing property '/fooAction/action'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: 1,
                },
            },
            "Expected value of type object at path '/fooAction/action', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {},
                },
            },
            "Missing property '/fooAction/action/type'.",
        ],

        /**
         * Triggers
         */

        [
            {
                fooAction: {
                    trigger: 1,
                    action: {
                        type: 'custom',
                        handler: {apply: jest.fn()},
                    },
                },
            },
            "Expected value of type object at path '/fooAction/trigger', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {},
                    action: {
                        type: 'custom',
                        handler: {apply: jest.fn()},
                    },
                },
            },
            "Missing property '/fooAction/trigger/type'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'foo'},
                    action: {
                        type: 'custom',
                        handler: {apply: jest.fn()},
                    },
                },
            },
            "Unexpected value at path '/fooAction/trigger/type', expecting 'match' or 'event', found 'foo'.",
        ],

        /**
         * Custom Action
         */

        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {type: 'custom'},
                },
            },
            "Missing property '/fooAction/action/handler'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'custom',
                        handler: 1,
                    },
                },
            },
            "Expected value of type function, object or array at path '/fooAction/action/handler', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'custom',
                        handler: {},
                    },
                },
            },
            "Missing property '/fooAction/action/handler/apply'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'custom',
                        handler: {apply: 1},
                    },
                },
            },
            "Expected value of type function at path '/fooAction/action/handler/apply', actual integer.",
        ],

        /**
         * Tracking Action
         */

        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'tracking',
                    },
                },
            },
            "Missing property '/fooAction/action/event'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'tracking',
                        event: 1,
                    },
                },
            },
            "Expected a JSON object at path '/fooAction/action/event', actual integer.",
        ],

        /**
         * Patch Action
         */

        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        attribute: 'name',
                        operation: 'set',
                        source: {
                            type: 'provided',
                            value: 'Carol',
                        },
                    },
                },
            },
            "Missing property '/fooAction/action/subject'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'user',
                        operation: 'set',
                        source: {
                            type: 'provided',
                            value: 'Carol',
                        },
                    },
                },
            },
            "Missing property '/fooAction/action/attribute'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'user',
                        attribute: 'name',
                        source: {
                            type: 'provided',
                            value: 'Carol',
                        },
                    },
                },
            },
            "Missing property '/fooAction/action/operation'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'user',
                        attribute: 'name',
                        operation: 'set',
                    },
                },
            },
            "Missing property '/fooAction/action/source'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 1,
                        attribute: 'name',
                        operation: 'set',
                        source: {
                            type: 'provided',
                            value: 'Carol',
                        },
                    },
                },
            },
            "Expected value of type string at path '/fooAction/action/subject', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'foo',
                        attribute: 'name',
                        operation: 'set',
                        source: {
                            type: 'provided',
                            value: 'Carol',
                        },
                    },
                },
            },
            "Unexpected value at path '/fooAction/action/subject', expecting 'user' or 'session', found 'foo'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'user',
                        attribute: 1,
                        operation: 'set',
                        source: {
                            type: 'provided',
                            value: 'Carol',
                        },
                    },
                },
            },
            "Expected value of type string at path '/fooAction/action/attribute', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'user',
                        attribute: 'name',
                        operation: 1,
                        source: {
                            type: 'provided',
                            value: 'Carol',
                        },
                    },
                },
            },
            "Expected value of type string at path '/fooAction/action/operation', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'user',
                        attribute: 'name',
                        operation: 'foo',
                        source: {
                            type: 'provided',
                            value: 'Carol',
                        },
                    },
                },
            },
            "Unexpected value at path '/fooAction/action/operation', expecting 'set', 'add' or 'combine', found 'foo'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'user',
                        attribute: 'name',
                        operation: 'set',
                        source: {
                            type: 'foo',
                        },
                    },
                },
            },
            "Unexpected value at path '/fooAction/action/source/type', expecting 'input' or 'provided', found 'foo'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'user',
                        attribute: 'name',
                        operation: 'set',
                        source: {
                            type: 'provided',
                        },
                    },
                },
            },
            "Missing property '/fooAction/action/source/value'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'session',
                        attribute: 'plan',
                        operation: 'combine',
                        source: {
                            type: 'input',
                        },
                    },
                },
            },
            "Missing property '/fooAction/action/source/element'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'session',
                        attribute: 'plan',
                        operation: 'combine',
                        source: {
                            type: 'input',
                            element: 1,
                        },
                    },
                },
            },
            "Expected value of type string at path '/fooAction/action/source/element', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'session',
                        attribute: 'plan',
                        operation: 'combine',
                        source: {
                            type: 'input',
                            element: 'planInput',
                            validation: 1,
                        },
                    },
                },
            },
            "Expected value of type function or RegExp at path '/fooAction/action/source/validation', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'patch',
                        subject: 'session',
                        attribute: 'plan',
                        operation: 'combine',
                        source: {
                            type: 'input',
                            element: 'planInput',
                            normalization: 1,
                        },
                    },
                },
            },
            "Expected value of type function at path '/fooAction/action/source/normalization', actual integer.",
        ],

        /**
         * Style Action
         */

        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'style',
                        operation: 'add-class',
                        className: 'someClass',
                    },
                },
            },
            "Missing property '/fooAction/action/element'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'style',
                        element: 'someButton',
                        className: 'someClass',
                    },
                },
            },
            "Missing property '/fooAction/action/operation'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'style',
                        element: 'someButton',
                        operation: 'add-class',
                    },
                },
            },
            "Missing property '/fooAction/action/className'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'style',
                        element: 1,
                        operation: 'add-class',
                        className: 'someClass',
                    },
                },
            },
            "Expected value of type string at path '/fooAction/action/element', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'style',
                        element: 'someButton',
                        operation: 1,
                        className: 'someClass',
                    },
                },
            },
            "Expected value of type string at path '/fooAction/action/operation', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'style',
                        element: 'someButton',
                        operation: 'foo',
                        className: 'someClass',
                    },
                },
            },
            "Unexpected value at path '/fooAction/action/operation', expecting 'add-class' or "
                + "'remove-class', found 'foo'.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'style',
                        element: 'someButton',
                        operation: 'add-class',
                        className: 1,
                    },
                },
            },
            "Expected value of type string or array at path '/fooAction/action/className', actual integer.",
        ],
        [
            {
                fooAction: {
                    trigger: {type: 'match'},
                    action: {
                        type: 'style',
                        element: 'someButton',
                        operation: 'add-class',
                        className: [1],
                    },
                },
            },
            "Expected value of type string at path '/fooAction/action/className/0', actual integer.",
        ],
    ])('should reject definitions %p', (actions: any, error: string) => {
        const [, factory]: [string, ExtensionFactory] = (engine.extend as jest.Mock).mock.calls[0];

        function create(): void {
            factory({options: actions, sdk: createPluginSdkMock()});
        }

        expect(create).toThrow(error);
    });

    test.each<[any]>([
        [{}],

        /**
         * Custom Action
         */

        [{
            fooAction: {
                trigger: {type: 'match'},
                action: {
                    type: 'custom',
                    handler: {apply: jest.fn()},
                },
            },
        }],
        [{
            fooAction: {
                trigger: {type: 'match'},
                action: {
                    type: 'custom',
                    handler: [
                        {apply: jest.fn()},
                        jest.fn(),
                    ],
                },
            },
        }],

        /**
         * Tracking Action
         */

        [{
            fooAction: {
                trigger: {type: 'match'},
                action: {
                    type: 'tracking',
                    event: {type: 'goalCompleted', goalId: 'foo'},
                },
            },
        }],

        /**
         * Patch Action
         */

        [{
            fooAction: {
                trigger: {type: 'match'},
                action: {
                    type: 'patch',
                    subject: 'user',
                    attribute: 'name',
                    operation: 'set',
                    source: {
                        type: 'provided',
                        value: 'Carol',
                    },
                },
            },
        }],
        [{
            fooAction: {
                trigger: {type: 'match'},
                action: {
                    type: 'patch',
                    subject: 'session',
                    attribute: 'plan',
                    operation: 'add',
                    source: {
                        type: 'provided',
                        value: 'free',
                    },
                },
            },
        }],
        [{
            fooAction: {
                trigger: {type: 'match'},
                action: {
                    type: 'patch',
                    subject: 'session',
                    attribute: 'plan',
                    operation: 'combine',
                    source: {
                        type: 'input',
                        element: 'planInput',
                    },
                },
            },
        }],
        [{
            fooAction: {
                trigger: {type: 'match'},
                action: {
                    type: 'patch',
                    subject: 'session',
                    attribute: 'plan',
                    operation: 'combine',
                    source: {
                        type: 'input',
                        element: 'planInput',
                        validation: /[a-z]+/,
                        normalization: jest.fn(),
                    },
                },
            },
        }],
        [{
            fooAction: {
                trigger: {type: 'match'},
                action: {
                    type: 'patch',
                    subject: 'session',
                    attribute: 'plan',
                    operation: 'combine',
                    source: {
                        type: 'input',
                        element: 'planInput',
                        validation: jest.fn(),
                    },
                },
            },
        }],

        /**
         * Style Action
         */

        [{
            fooAction: {
                trigger: {type: 'match'},
                action: {
                    type: 'style',
                    element: 'someButton',
                    operation: 'add-class',
                    className: 'someClass',
                },
            },
        }],
        [{
            fooAction: {
                trigger: {type: 'match'},
                action: {
                    type: 'style',
                    element: 'someButton',
                    operation: 'remove-class',
                    className: ['firstClass', 'secondClass'],
                },
            },
        }],
    ])('should accept valid definitions', (actions: any) => {
        const [, factory]: [string, ExtensionFactory] = (engine.extend as jest.Mock).mock.calls[0];

        function create(): void {
            factory({options: actions, sdk: createPluginSdkMock()});
        }

        expect(create).not.toThrowError();
    });
});
