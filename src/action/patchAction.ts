import {PluginSdk} from '@croct/plug/plugin';
import {JsonValue} from '@croct/plug/sdk/json';
import {Action} from './index';

type ElementSource = {
    type: 'element',
    element: string,
    validation?: {(value: string): boolean} | RegExp,
    normalization?: {(value: string): JsonValue},
};

type ProvidedSource = {
    type: 'provided',
    value: JsonValue,
};

export type PatchDefinition = {
    subject: 'user' | 'session',
    attribute: string,
    operation: 'set' | 'add' | 'combine',
    source: ProvidedSource | ElementSource,
};

export default class PatchAction implements Action {
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

            case 'element': {
                const element = document.querySelector(source.element);

                if (element === null) {
                    return undefined;
                }

                let value: JsonValue = this.getElementValue(element);

                if (value === null) {
                    return undefined;
                }

                const {validation, normalization} = source;

                if (validation !== undefined) {
                    const validator = validation instanceof RegExp
                        ? validation.test.bind(validation)
                        : validation;

                    if (!validator(value)) {
                        return undefined;
                    }
                }

                if (normalization !== undefined) {
                    value = normalization(value);
                }

                return value;
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

        return element.textContent;
    }
}
