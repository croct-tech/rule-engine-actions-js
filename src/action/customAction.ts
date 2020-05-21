import {PluginSdk} from '@croct/plug/plugin';
import {Action, ActionFunction} from './index';

export type ActionHandler = Action | ActionFunction;

function isAction(value: any): value is Action {
    return typeof value === 'object' && typeof value.apply === 'function';
}

export default class CustomAction implements Action {
    private readonly actions: ActionHandler[];

    public constructor(actions: ActionHandler[]) {
        this.actions = actions;
    }

    public apply(sdk: PluginSdk): Promise<void> {
        const logger = sdk.getLogger();
        const pending = [];

        for (const action of this.actions) {
            if (typeof action === 'function') {
                const promise = action(sdk);

                if (promise instanceof Promise) {
                    pending.push(promise);
                }

                continue;
            }

            if (isAction(action)) {
                const promise = action.apply(sdk);

                if (promise instanceof Promise) {
                    pending.push(promise);
                }

                continue;
            }

            logger.error(`Expected an action object or function but got ${typeof action}.`);
        }

        return Promise.all(pending).then(() => {
            // omit values
        })
    }
}
