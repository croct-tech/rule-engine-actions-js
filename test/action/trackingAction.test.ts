import {ExternalEvent} from '@croct/plug/sdk/event';
import {createPluginSdkMock} from '../mocks';
import TrackingAction from '../../src/action/trackingAction';

beforeEach(() => {
    jest.restoreAllMocks();
});

describe('A tracking action', () => {
    test('should track events', async () => {
        const sdk = createPluginSdkMock();

        sdk.tracker.track = jest.fn().mockResolvedValue(undefined);

        const event: ExternalEvent = {
            type: 'goalCompleted',
            goalId: 'foo',
        };

        const action = new TrackingAction(event);

        await action.apply(sdk);

        expect(sdk.tracker.track).toHaveBeenCalledWith('goalCompleted', {goalId: 'foo'});
    });
});
