import engine from '@croct/plug-rule-engine/plugin';
import {PluginArguments} from '@croct/plug/plugin';
import ActionExtension, {ActionMap, ActionProperty} from './extension';
import {actionMapSchema} from './schema';

declare module '@croct/plug-rule-engine/plugin' {
    export interface ExtensionConfigurations {
        actions?: ActionMap;
    }
}

declare module '@croct/plug-rule-engine/rule' {
    export interface RuleProperties {
        action?: ActionProperty;
    }
}

engine.extend('actions', ({options, sdk}: PluginArguments<ActionMap>) => {
    actionMapSchema.validate(options);

    return new ActionExtension(options, sdk);
});
