import CustomAction from '../../src/action/customAction';
import {createPluginSdkMock} from '../mocks';
import 'jest-extended';
import {Action} from '../../src/action';

beforeEach(() => {
    jest.restoreAllMocks();
    document.body = document.createElement('body');
});

describe('A custom action', () => {
    test('should apply all given actions', async () => {
        const firstAction = {apply: jest.fn()};
        const secondAction = jest.fn();
        const thirdAction = {apply: (): Promise<void> => Promise.resolve()};
        const fourthAction = (): Promise<void> => Promise.resolve();
        const sdk = createPluginSdkMock();

        jest.spyOn(thirdAction, 'apply');

        const action = new CustomAction([firstAction, secondAction, thirdAction, fourthAction]);

        await action.apply(sdk);

        expect(firstAction.apply).toHaveBeenCalled();
        expect(secondAction).toHaveBeenCalled();
        expect(thirdAction.apply).toHaveBeenCalled();
        expect(firstAction.apply).toHaveBeenCalledBefore(secondAction);
    });

    test('should remove a class from a given element', async () => {
        const sdk = createPluginSdkMock();
        const logger = sdk.getLogger();

        const action = new CustomAction([{} as Action]);

        await action.apply(sdk);

        expect(logger.error).toHaveBeenCalledWith('Expected an action object or function but got object.');
    });
});
