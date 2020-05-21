import {Rule} from '@croct/plug-rule-engine/rule';
import {Context} from '@croct/plug-rule-engine/context';
import {Action} from '../src/action';
import ActionExtension from '../src/extension';
import {createPluginSdkMock} from './mocks';

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('An action trigger extension', () => {
    test('should trigger the action specified in the rule', async () => {
        const sdk = createPluginSdkMock();
        const action: Action = {
            apply: jest.fn().mockReturnValue(Promise.resolve()),
        };

        const extension = new ActionExtension(
            {
                fooAction: {
                    trigger: {
                        type: 'match',
                    },
                    action: {
                        type: 'custom',
                        handler: action,
                    },
                },
            },
            sdk,
        );

        const context = new Context({});
        const rule: Rule = {
            name: 'foo',
            properties: {action: 'fooAction'},
        };

        await extension.apply(rule);

        expect(action.apply).toHaveBeenCalledWith({
            evaluator: sdk.evaluator,
            tracker: sdk.tracker,
            user: sdk.user,
            session: sdk.session,
            context: context,
        });
    });

    test('should trigger the action function specified in the rule', async () => {
        const sdk = createPluginSdkMock();
        const action = jest.fn().mockReturnValue(Promise.resolve());

        const extension = new ActionExtension(
            {
                fooAction: {
                    trigger: {
                        type: 'match',
                    },
                    action: {
                        type: 'custom',
                        handler: {
                            apply: action,
                        },
                    },
                },
            },
            sdk,
        );

        const context = new Context({});
        const rule: Rule = {
            name: 'foo',
            properties: {action: 'fooAction'},
        };

        await extension.apply(rule);

        expect(action).toHaveBeenCalledWith({
            evaluator: sdk.evaluator,
            tracker: sdk.tracker,
            user: sdk.user,
            session: sdk.session,
            context: context,
        });
    });

    test('should not trigger any action if action name is not specified', async () => {
        const extension = new ActionExtension(
            {
                fooAction: {
                    trigger: {
                        type: 'match',
                    },
                    action: {
                        type: 'custom',
                        handler: {
                            apply: jest.fn(),
                        },
                    },
                },
            },
            createPluginSdkMock(),
        );

        const rule: Rule = {
            name: 'foo',
            properties: {},
        };

        await expect(extension.apply(rule)).resolves.toBeUndefined();
    });

    test('should fail if the specified action does not exist', async () => {
        const extension = new ActionExtension(
            {
                fooAction: {
                    trigger: {
                        type: 'match',
                    },
                    action: {
                        type: 'custom',
                        handler: {
                            apply: jest.fn(),
                        },
                    },
                },
            },
            createPluginSdkMock(),
        );

        const rule: Rule = {
            name: 'bar',
            properties: {action: 'barAction'},
        };

        const promise = extension.apply(rule);

        await expect(promise).rejects.toThrow(
            'Action "barAction" registered for rule "bar" does not exist.',
        );
    });

    test('should fail if the specified action is invalid', async () => {
        const extension = new ActionExtension(
            {
                fooAction: {
                    trigger: {
                        type: 'match',
                    },
                    action: {
                        type: 'custom',
                        handler: {
                            apply: jest.fn(),
                        },
                    },
                },
            },
            createPluginSdkMock(),
        );

        const rule: Rule = {
            name: 'foo',
            properties: {action: undefined},
        };

        const promise = extension.apply(rule);

        await expect(promise).rejects.toThrow(
            'Invalid action registered for rule "foo", '
            + 'expected an instance of Action or function but got object.',
        );
    });
});
