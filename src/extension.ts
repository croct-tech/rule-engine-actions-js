import {PluginSdk} from '@croct/plug/plugin';
import {ExternalEvent} from '@croct/plug/sdk/event';
import {Extension} from '@croct/plug-rule-engine/extension';
import {Rule} from '@croct/plug-rule-engine/rule';
import CustomAction, {ActionHandler} from './action/customAction';
import PatchAction, {PatchDefinition} from './action/patchAction';
import StyleAction, {StyleDefinition} from './action/styleAction';
import TrackingAction from './action/trackingAction';
import {Action} from './action';

type CustomActionDefinition = {
    type: 'custom',
    handler: ActionHandler | ActionHandler[],
}

type TrackingActionDefinition = {
    type: 'tracking',
    event: ExternalEvent,
}

type PatchActionDefinition = PatchDefinition & {
    type: 'patch',
}

type StyleActionDefinition = StyleDefinition & {
    type: 'style',
}

export type ActionDefinition =
    CustomActionDefinition
    | TrackingActionDefinition
    | PatchActionDefinition
    | StyleActionDefinition;

type EventTrigger = {
    type: 'event',
    element: string,
    event: keyof HTMLElementEventMap,
}

type MatchTrigger = {
    type: 'match',
}

export type ActionTrigger = MatchTrigger | EventTrigger;

export type ConditionalAction = {
    trigger: ActionTrigger,
    action: ActionDefinition,
}

export type ActionProperty = string|string[];

export type ActionMap = {[key: string]: ConditionalAction | ConditionalAction[]};

export default class ActionExtension implements Extension {
    private readonly sdk: PluginSdk;

    private readonly actions: ActionMap = {};

    public constructor(actions: ActionMap, sdk: PluginSdk) {
        this.actions = actions;
        this.sdk = sdk;
    }

    public async apply({name, properties: {action}}: Rule): Promise<void> {
        if (action === undefined) {
            return;
        }

        const logger = this.sdk.getLogger();

        const pending = [];
        for (const actionName of Array.isArray(action) ? action : [action]) {
            const current = this.actions[actionName];

            if (current === undefined) {
                logger.error(`Action "${actionName}" registered for rule "${name}" does not exist.`);

                continue;
            }

            pending.push(...this.applyAll(Array.isArray(current) ? current : [current]));
        }

        await Promise.all(pending);
    }

    private applyAll(actions: ConditionalAction[]): Promise<void>[] {
        const pending = [];
        for (const {trigger, action} of actions) {
            const promise = this.trigger(trigger, this.createAction(action));

            if (promise instanceof Promise) {
                pending.push(promise);
            }
        }

        return pending;
    }

    private trigger(trigger: ActionTrigger, action: Action): Promise<void>|void {
        switch (trigger.type) {
            case 'match':
                return action.apply(this.sdk);

            case 'event':
                window.document.querySelectorAll(trigger.element).forEach(element => {
                    element.addEventListener(trigger.event, () => action.apply(this.sdk))
                });
                break;
        }
    }

    private createAction(definition: ActionDefinition): Action {
        switch (definition.type) {
            case 'patch':
                return new PatchAction(definition);

            case 'tracking':
                return new TrackingAction(definition.event);

            case 'style':
                return new StyleAction(definition);

            case 'custom':
                return new CustomAction(
                    Array.isArray(definition.handler)
                        ? definition.handler
                        : [definition.handler],
                );
        }
    }
}
