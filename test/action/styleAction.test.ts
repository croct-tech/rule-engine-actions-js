import StyleAction, {StyleDefinition} from '../../src/action/styleAction';

beforeEach(() => {
    jest.restoreAllMocks();
    document.body = document.createElement('body');
});

describe('A style action', () => {
    test('should add a class to a given element', async () => {
        const div = document.createElement('div');
        div.classList.add('firstExample');
        div.classList.add('secondExample');

        document.body.appendChild(div);

        expect(div.classList.contains('firstExample')).toBe(true);
        expect(div.classList.contains('secondExample')).toBe(true);

        const definition: StyleDefinition = {
            element: '.firstExample',
            operation: 'add-class',
            className: 'thirdExample',
        };

        const action = new StyleAction(definition);

        await action.apply();

        expect(div.classList.contains('firstExample')).toBe(true);
        expect(div.classList.contains('secondExample')).toBe(true);
        expect(div.classList.contains('thirdExample')).toBe(true);
    });

    test('should remove a class from a given element', async () => {
        const div = document.createElement('div');
        div.classList.add('firstExample');
        div.classList.add('secondExample');

        expect(div.classList.contains('firstExample')).toBe(true);
        expect(div.classList.contains('secondExample')).toBe(true);

        document.body.appendChild(div);

        const definition: StyleDefinition = {
            element: '.firstExample',
            operation: 'remove-class',
            className: 'secondExample',
        };

        const action = new StyleAction(definition);

        await action.apply();

        expect(div.classList.contains('firstExample')).toBe(true);
    });
});
