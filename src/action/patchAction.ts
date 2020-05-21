import {PluginSdk} from '@croct/plug/plugin';
import {JsonValue} from '@croct/plug/sdk/json';
import {Action} from './index';

type InputSource = {
    type: 'input',
    element: string,
    validation?: RegExp,
    normalization?: {(value: string): JsonValue},
}

type ProvidedSource = {
    type: 'provided',
    value: JsonValue,
}

export type PatchDefinition = {
    subject: 'user' | 'session',
    attribute: string,
    operation: 'set' | 'add' | 'combine',
    source: ProvidedSource | InputSource,
}

export class PatchAction implements Action {
    private readonly definition: PatchDefinition;

    public constructor(definition: PatchDefinition) {
        this.definition = definition;
    }

    public async apply(sdk: PluginSdk): Promise<void> {
        const value = this.getAttributeValue();

        if (value === undefined) {
            return;
        }

        const {operation, attribute, subject} = this.definition;

        const patch = sdk[subject].edit();

        switch (operation) {
            case 'set':
                patch.set(attribute, value);
                break;

            case 'add':
                patch.add(attribute, value);
                break;

            case 'combine':
                patch.combine(attribute, value);
                break;
        }

        await patch.save();
    }

    private getAttributeValue(): JsonValue|undefined {
        const {source} = this.definition;

        switch (source.type) {
            case 'provided':
                return source.value;

            case 'input': {
                const element = document.querySelector(source.element);

                if (element === null) {
                    return undefined;
                }

                const value = this.getElementValue(element);

                if (value === null || source.validation?.test(value) === false) {
                    return undefined;
                }

                return source.normalization ? source.normalization(value) : value;
            }
        }
    }

    private getElementValue(element: Element): string|null {
        if (element instanceof HTMLInputElement) {
            return element.type === 'password' ? null : element.value;
        }

        if (element instanceof HTMLSelectElement) {
            return element.value;
        }

        if (element instanceof HTMLTextAreaElement) {
            return element.value;
        }

        return null;
    }
}
