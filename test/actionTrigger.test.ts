import {Rule} from '../../src';
import {Context} from '../../src/context';
import ActionTrigger, {Action} from '../../src/ext/actions/actionTrigger';
import {MockContainer} from '../mock/mockContainer';

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('An action trigger extension', () => {
    test('should have a name', async () => {
        const extensionFactory = ActionTrigger.initialize({});

        expect(extensionFactory.getExtensionName()).toBe(ActionTrigger.name);
    });

    test('should trigger the action specified in the rule', async () => {
        const action: Action = {
            apply: jest.fn().mockReturnValue(Promise.resolve()),
        };

        const extensionFactory = ActionTrigger.initialize({fooAction: action});

        const container = new MockContainer();
        const extension = extensionFactory.create(container);

        const context = new Context({});
        const rule: Rule = {
            name: 'foo',
            properties: {action: 'fooAction'},
        };

        await extension.apply(rule, context);

        expect(action.apply).toHaveBeenCalledWith({
            evaluator: container.getEvaluator(),
            tracker: container.getTracker(),
            user: container.getUserFacade(),
            session: container.getSessionFacade(),
            context: context,
        });
    });

    test('should trigger the action function specified in the rule', async () => {
        const action = jest.fn().mockReturnValue(Promise.resolve());
        const extensionFactory = ActionTrigger.initialize({fooAction: action});

        const container = new MockContainer();
        const extension = extensionFactory.create(container);

        const context = new Context({});
        const rule: Rule = {
            name: 'foo',
            properties: {action: 'fooAction'},
        };

        await extension.apply(rule, context);

        expect(action).toHaveBeenCalledWith({
            evaluator: container.getEvaluator(),
            tracker: container.getTracker(),
            user: container.getUserFacade(),
            session: container.getSessionFacade(),
            context: context,
        });
    });

    test('should not trigger any action if action name is not specified', async () => {
        const extensionFactory = ActionTrigger.initialize({fooAction: {apply: jest.fn()}});
        const extension = extensionFactory.create(new MockContainer());

        const rule: Rule = {
            name: 'foo',
            properties: {},
        };

        await expect(extension.apply(rule, new Context({}))).resolves.toBeUndefined();
    });

    test('should fail if the specified action does not exist', async () => {
        const extensionFactory = ActionTrigger.initialize({fooAction: {apply: jest.fn()}});
        const extension = extensionFactory.create(new MockContainer());

        const rule: Rule = {
            name: 'bar',
            properties: {action: 'barAction'},
        };

        const promise = extension.apply(rule, new Context({}));

        await expect(promise).rejects.toThrow(
            'Action "barAction" registered for rule "bar" does not exist.',
        );
    });

    test('should fail if the specified action is invalid', async () => {
        const extensionFactory = ActionTrigger.initialize({fooAction: jest.fn()});
        const extension = extensionFactory.create(new MockContainer());

        const rule: Rule = {
            name: 'foo',
            properties: {action: {}},
        };

        const promise = extension.apply(rule, new Context({}));

        await expect(promise).rejects.toThrow(
            'Invalid action registered for rule "foo", '
            + 'expected an instance of Action or function but got object.',
        );
    });
});
