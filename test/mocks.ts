import {Tracker} from '@croct/plug/sdk/tracking';
import {PluginSdk} from '@croct/plug/plugin';
import {Evaluator} from '@croct/plug/sdk/evaluation';
import {SessionFacade, Tab, UserFacade} from '@croct/plug/sdk';

export function createPluginSdkMock(): PluginSdk {
    const {
        Evaluator: EvaluatorMock,
    } = jest.genMockFromModule<{Evaluator: {new(): Evaluator}}>('@croct/plug/sdk/evaluation');

    const {
        Tracker: TrackerMock,
    } = jest.genMockFromModule<{Tracker: {new(): Tracker}}>('@croct/plug/sdk/tracking');

    const {
        SessionFacade: SessionFacadeMock,
    } = jest.genMockFromModule<{SessionFacade: {new(): SessionFacade}}>('@croct/plug/sdk');

    const {
        UserFacade: UserFacadeMock,
    } = jest.genMockFromModule<{UserFacade: {new(): UserFacade}}>('@croct/plug/sdk');

    const {
        Tab: TabMock,
    } = jest.genMockFromModule<{Tab: {new(): Tab}}>('@croct/plug/sdk');

    return {
        evaluator: new EvaluatorMock(),
        session: new SessionFacadeMock(),
        tab: new TabMock(),
        tracker: new TrackerMock(),
        user: new UserFacadeMock(),
        getTabStorage: jest.fn(),
        getBrowserStorage: jest.fn(),
        getLogger: jest.fn().mockReturnValue({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        }),
    };
}
