import {PluginSdk} from '@croct/plug/plugin';

export interface Action {
    apply(sdk: PluginSdk): Promise<void> | void;
}

export interface ActionFunction {
    (sdk: PluginSdk): Promise<void> | void;
}
