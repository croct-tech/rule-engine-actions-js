import {Action} from './index';

type ClassOperation = {
    operation: 'add-class' | 'remove-class',
    element: string,
    className: string | string[],
}

export type StyleDefinition = {element: string} & ClassOperation;

export default class StyleAction implements Action {
    private readonly definition: StyleDefinition;

    public constructor(definition: StyleDefinition) {
        this.definition = definition;
    }

    public apply(): void {
        const elements: NodeListOf<HTMLElement> = window.document.querySelectorAll(this.definition.element);

        switch (this.definition.operation) {
            case 'add-class':
            case 'remove-class': {
                const {className} = this.definition;
                const classes = Array.isArray(className) ? className : [className];
                const method = this.definition.operation === 'add-class' ? 'add' : 'remove';

                elements.forEach(element => element.classList[method](...classes));
                break;
            }
        }
    }
}
