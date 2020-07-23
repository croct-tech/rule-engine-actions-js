import {ExternalTrackingEvent} from '@croct/plug/sdk/tracking';
import {PluginSdk} from '@croct/plug/plugin';
import {Action} from './index';

export default class TrackingAction implements Action {
    private readonly event: ExternalTrackingEvent;

    public constructor(event: ExternalTrackingEvent) {
        this.event = event;
    }

    public apply(sdk: PluginSdk): Promise<void> {
        const {type, ...payload} = this.event;

        return sdk.tracker.track(type, payload).then(() => {
            // omit result
        });
    }
}
