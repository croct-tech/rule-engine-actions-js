import {Rule} from '@croct/plug-rule-engine/rule';
import {ExternalEvent} from '@croct/plug/sdk/event';
import {ActionFunction} from '../src/action';
import ActionExtension, {ActionCondition, PatchActionDefinition} from '../src/extension';
import PatchAction from '../src/action/patchAction';
import CustomAction from '../src/action/customAction';
import StyleAction, {StyleDefinition} from '../src/action/styleAction';
import TrackingAction from '../src/action/trackingAction';
import {createPluginSdkMock} from './mocks';

jest.mock('../src/action/patchAction');
jest.mock('../src/action/customAction');
jest.mock('../src/action/styleAction');
jest.mock('../src/action/trackingAction');

afterEach(() => {
    jest.resetAllMocks();
});

describe('An action trigger extension', () => {
    test('should wait actions to complete', async () => {
        const actionMock = (CustomAction as jest.Mock);
        const sdk = createPluginSdkMock();

        let resolveAction: {(): void} = jest.fn();

        actionMock.prototype.apply = jest.fn().mockImplementation(() => new Promise(resolve => {
            resolveAction = resolve;
        }));

        const extension = new ActionExtension(
            {
                fooAction: {
                    trigger: {
                        type: 'match',
                    },
                    action: {
                        type: 'custom',
                        handler: resolveAction,
                    },
                },
            },
            sdk,
        );

        const rule: Rule = {
            name: 'foo',
            properties: {action: 'fooAction'},
        };

        const done = jest.fn();

        const promise = extension.apply(rule).then(done);

        await new Promise(resolve => window.setTimeout(resolve, 10));

        expect(done).not.toHaveBeenCalled();

        resolveAction();

        await promise;

        expect(done).toHaveBeenCalled();
    });

    test('should trigger actions when an event is fired', async () => {
        const actionMock = (CustomAction as jest.Mock);
        actionMock.prototype.apply = jest.fn();

        const fooDiv = document.createElement('div');
        fooDiv.classList.add('example');

        document.body.appendChild(fooDiv);

        const barDiv = document.createElement('div');
        barDiv.classList.add('example');

        document.body.appendChild(barDiv);

        const extension = new ActionExtension(
            {
                fooAction: {
                    trigger: {
                        type: 'event',
                        event: 'click',
                        element: '.example',
                    },
                    action: {
                        type: 'custom',
                        handler: jest.fn(),
                    },
                },
            },
            createPluginSdkMock(),
        );

        const rule: Rule = {
            name: 'foo',
            properties: {action: 'fooAction'},
        };

        await extension.apply(rule);

        expect(CustomAction).toHaveBeenCalled();

        const action = (CustomAction as jest.Mock).mock.instances[0];

        expect(action.apply).not.toHaveBeenCalled();

        const event = new Event('click', {bubbles: false, cancelable: false, composed: false});

        fooDiv.dispatchEvent(event);
        barDiv.dispatchEvent(event);

        expect(action.apply).toBeCalledTimes(2);
    });

    test('should trigger custom actions', async () => {
        const sdk = createPluginSdkMock();
        const actionFunction: ActionFunction = jest.fn();

        const extension = new ActionExtension(
            {
                fooAction: {
                    trigger: {
                        type: 'match',
                    },
                    action: {
                        type: 'custom',
                        handler: actionFunction,
                    },
                },
            },
            sdk,
        );

        const rule: Rule = {
            name: 'foo',
            properties: {action: 'fooAction'},
        };

        await extension.apply(rule);

        expect(CustomAction).toHaveBeenCalledWith([actionFunction]);

        const action = (CustomAction as jest.Mock).mock.instances[0];

        expect(action.apply).toHaveBeenCalledWith(sdk);
    });

    test('should trigger patch actions', async () => {
        const actionDefinition: Omit<PatchActionDefinition, 'type'> = {
            subject: 'user',
            attribute: 'foo',
            operation: 'set',
            source: {
                type: 'provided',
                value: 'bar',
            },
        };

        const actionCondition: ActionCondition = {
            trigger: {
                type: 'match',
            },
            action: {
                type: 'patch',
                ...actionDefinition,
            },
        };

        const sdk = createPluginSdkMock();
        const extension = new ActionExtension({fooAction: actionCondition}, sdk);

        const rule: Rule = {
            name: 'foo',
            properties: {action: 'fooAction'},
        };

        await extension.apply(rule);

        expect(PatchAction).toHaveBeenCalledWith(actionDefinition);

        const action = (PatchAction as jest.Mock).mock.instances[0];

        expect(action.apply).toHaveBeenCalledWith(sdk);
    });

    test('should trigger style actions', async () => {
        const styleDefinition: StyleDefinition = {
            element: '#foo',
            operation: 'remove-class',
            className: ['foo', 'bar'],
        };

        const actionCondition: ActionCondition = {
            trigger: {
                type: 'match',
            },
            action: {
                type: 'style',
                ...styleDefinition,
            },
        };

        const sdk = createPluginSdkMock();
        const extension = new ActionExtension({fooAction: actionCondition}, sdk);

        const rule: Rule = {
            name: 'foo',
            properties: {action: 'fooAction'},
        };

        await extension.apply(rule);

        expect(StyleAction).toHaveBeenCalledWith(styleDefinition);

        const action = (StyleAction as jest.Mock).mock.instances[0];

        expect(action.apply).toHaveBeenCalledWith(sdk);
    });

    test('should trigger tracking actions', async () => {
        const event: ExternalEvent = {
            type: 'goalCompleted',
            goalId: 'foo',
        };

        const actionCondition: ActionCondition = {
            trigger: {
                type: 'match',
            },
            action: {
                type: 'tracking',
                event: event,
            },
        };

        const sdk = createPluginSdkMock();
        const extension = new ActionExtension({fooAction: actionCondition}, sdk);

        const rule: Rule = {
            name: 'foo',
            properties: {action: 'fooAction'},
        };

        await extension.apply(rule);

        expect(TrackingAction).toHaveBeenCalledWith(event);

        const action = (TrackingAction as jest.Mock).mock.instances[0];

        expect(action.apply).toHaveBeenCalledWith(sdk);
    });

    test('should do nothing if action definition is undefined', async () => {
        const action = jest.fn();
        const actionCondition: ActionCondition = {
            trigger: {
                type: 'match',
            },
            action: {
                type: 'custom',
                handler: action,
            },
        };

        const extension = new ActionExtension({fooAction: actionCondition}, createPluginSdkMock());

        const rule: Rule = {
            name: 'foo',
            properties: {undefined},
        };

        await extension.apply(rule);

        expect(action).not.toHaveBeenCalled();
    });

    test('should log an error message if action name is not a string', async () => {
        const actionCondition: ActionCondition = {
            trigger: {
                type: 'match',
            },
            action: {
                type: 'custom',
                handler: jest.fn(),
            },
        };

        const sdk = createPluginSdkMock();
        const logger = sdk.getLogger();
        const extension = new ActionExtension({fooAction: actionCondition}, sdk);

        const rule: Rule = {
            name: 'foo',
            properties: {action: 1 as unknown as string},
        };

        await extension.apply(rule);

        expect(logger.error).toHaveBeenCalledWith(
            'Expected an action name but got value of type "integer" in rule "foo".',
        );
    });

    test('should log an error message if action is not registered', async () => {
        const actionCondition: ActionCondition = {
            trigger: {
                type: 'match',
            },
            action: {
                type: 'custom',
                handler: jest.fn(),
            },
        };

        const sdk = createPluginSdkMock();
        const logger = sdk.getLogger();
        const extension = new ActionExtension({fooAction: actionCondition}, sdk);

        const rule: Rule = {
            name: 'foo',
            properties: {action: 'barAction'},
        };

        await extension.apply(rule);

        expect(logger.error).toHaveBeenCalledWith(
            'Action "barAction" registered for rule "foo" does not exist.',
        );
    });
});
