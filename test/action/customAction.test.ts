import CustomAction from '../../src/action/customAction';
import {createPluginSdkMock} from '../mocks';
import 'jest-extended';
import {Action} from '../../src/action';

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('A custom action', () => {
    test('should apply all specified actions', async () => {
        let resolveFirst: {(): void} = jest.fn();
        const firstAction = {
            apply: jest.fn().mockReturnValue(new Promise<void>(resolve => {
                resolveFirst = resolve;
            })),
        };

        let resolveSecond: {(): void} = jest.fn();
        const secondAction = jest.fn().mockReturnValue(new Promise<void>(resolve => {
            resolveSecond = resolve;
        }));

        const thirdAction = {apply: jest.fn()};
        const fourthAction = jest.fn();

        const sdk = createPluginSdkMock();

        jest.spyOn(thirdAction, 'apply');

        const action = new CustomAction([firstAction, secondAction, thirdAction, fourthAction]);

        const done = jest.fn();
        const promise = action.apply(sdk).then(done);

        await new Promise(resolve => window.setTimeout(resolve, 10));

        expect(done).not.toHaveBeenCalled();

        expect(firstAction.apply).toHaveBeenCalled();
        expect(secondAction).toHaveBeenCalled();
        expect(thirdAction.apply).toHaveBeenCalled();
        expect(fourthAction).toHaveBeenCalled();

        expect(firstAction.apply).toHaveBeenCalledBefore(secondAction as jest.Mock);
        expect(secondAction).toHaveBeenCalledBefore(thirdAction.apply as jest.Mock);
        expect(thirdAction.apply).toHaveBeenCalledBefore(fourthAction);

        resolveFirst();

        await new Promise(resolve => window.setTimeout(resolve, 10));

        expect(done).not.toHaveBeenCalled();

        resolveSecond();

        await promise;

        expect(done).toHaveBeenCalled();
    });

    test('should log an error if an action is invalid', async () => {
        const sdk = createPluginSdkMock();
        const logger = sdk.getLogger();

        const action = new CustomAction([{} as Action]);

        await action.apply(sdk);

        expect(logger.error).toHaveBeenCalledWith('Expected an action object or function but got object.');
    });
});
