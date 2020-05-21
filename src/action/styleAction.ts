import {Action} from './index';

export type StyleDefinition = {
    element: string,
    operation: 'add' | 'remove',
    className: string | string[],
};

export class StyleAction implements Action {
    private readonly definition: StyleDefinition;

    public constructor(definition: StyleDefinition) {
        this.definition = definition;
    }

    public apply(): void {
        const {element: selector, className} = this.definition;
        const classes = Array.isArray(className) ? className : [className];
        const elements: NodeListOf<HTMLElement> = window.document.querySelectorAll(selector);

        elements.forEach(element => element.classList[this.definition.operation](...classes));
    }
}
