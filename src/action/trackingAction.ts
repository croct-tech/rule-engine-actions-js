import {ExternalEvent} from '@croct/plug/sdk/event';
import {PluginSdk} from '@croct/plug/plugin';
import {Action} from './index';

export default class TrackingAction implements Action {
    private readonly event: ExternalEvent;

    public constructor(event: ExternalEvent) {
        this.event = event;
    }

    public apply(sdk: PluginSdk): Promise<void> {
        const {type, ...payload} = this.event;

        return sdk.tracker.track(type, payload).then(() => {
            // omit result
        });
    }
}
