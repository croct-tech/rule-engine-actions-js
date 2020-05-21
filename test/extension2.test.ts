import {Rule} from '@croct/plug-rule-engine/rule';
import {Action, ActionFunction} from '../src/action';
import ActionExtension from '../src/extension';
import {createPluginSdkMock} from './mocks';

afterEach(() => {
    jest.restoreAllMocks();
});

describe('An action trigger extension', () => {
    test('should trigger custom actions', async () => {
        const sdk = createPluginSdkMock();

        let resolveActionFunction: {(): void} = jest.fn();

        const actionFunction: ActionFunction = jest.fn()
            .mockImplementation((): Promise<void> => new Promise(resolve => {
                resolveActionFunction = resolve;
            }));

        let resolveActionObject: {(): void} = jest.fn();

        const actionObject: Action = {
            apply: jest.fn().mockImplementation((): Promise<void> => new Promise(resolve => {
                resolveActionObject = resolve;
            })),
        };

        const extension = new ActionExtension(
            {
                fooAction: {
                    trigger: {
                        type: 'match',
                    },
                    action: {
                        type: 'custom',
                        handler: [actionObject, actionFunction],
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
        expect(actionFunction).toHaveBeenCalledWith(sdk);
        expect(actionObject.apply).toHaveBeenCalledWith(sdk);

        resolveActionFunction();

        expect(done).not.toHaveBeenCalled();

        resolveActionObject();

        await promise;

        expect(done).toHaveBeenCalled();
    });
});
