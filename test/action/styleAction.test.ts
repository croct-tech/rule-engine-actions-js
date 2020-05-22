import StyleAction, {StyleDefinition} from '../../src/action/styleAction';

beforeEach(() => {
    jest.restoreAllMocks();
    document.body = document.createElement('body');
});

describe('A style action', () => {
    test('should add classes to matching elements', async () => {
        const firstDiv = document.createElement('div');
        firstDiv.classList.add('example');
        firstDiv.classList.add('firstExample');

        const secondDiv = document.createElement('div');
        secondDiv.classList.add('example');
        secondDiv.classList.add('secondExample');

        expect(firstDiv.classList.contains('firstExample')).toBe(true);
        expect(secondDiv.classList.contains('secondExample')).toBe(true);

        document.body.appendChild(firstDiv);
        document.body.appendChild(secondDiv);

        const definition: StyleDefinition = {
            element: '.example',
            operation: 'add-class',
            className: 'personalized',
        };

        const action = new StyleAction(definition);

        await action.apply();

        expect(firstDiv.classList.contains('example')).toBe(true);
        expect(firstDiv.classList.contains('firstExample')).toBe(true);
        expect(firstDiv.classList.contains('personalized')).toBe(true);

        expect(secondDiv.classList.contains('example')).toBe(true);
        expect(secondDiv.classList.contains('secondExample')).toBe(true);
        expect(secondDiv.classList.contains('personalized')).toBe(true);
    });

    test('should remove classes from matching elements', async () => {
        const firstDiv = document.createElement('div');
        firstDiv.classList.add('example');
        firstDiv.classList.add('firstExample');

        const secondDiv = document.createElement('div');
        secondDiv.classList.add('example');
        secondDiv.classList.add('secondExample');

        expect(firstDiv.classList.contains('firstExample')).toBe(true);
        expect(secondDiv.classList.contains('secondExample')).toBe(true);

        document.body.appendChild(firstDiv);
        document.body.appendChild(secondDiv);

        const definition: StyleDefinition = {
            element: '.example',
            operation: 'remove-class',
            className: 'example',
        };

        const action = new StyleAction(definition);

        await action.apply();

        expect(firstDiv.classList.contains('example')).toBe(false);
        expect(firstDiv.classList.contains('firstExample')).toBe(true);

        expect(secondDiv.classList.contains('example')).toBe(false);
        expect(secondDiv.classList.contains('secondExample')).toBe(true);
    });
});
