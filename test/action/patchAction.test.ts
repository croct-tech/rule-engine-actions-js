import {createPluginSdkMock} from '../mocks';
import PatchAction, {PatchDefinition} from '../../src/action/patchAction';
import 'jest-extended';

beforeEach(() => {
    jest.restoreAllMocks();
    document.body = document.createElement('body');
});

describe('A patch action', () => {
    test.each<[string]>([
        ['set'],
        ['add'],
        ['combine'],
    ])('should %s an attribute to user with a provided value', async (operation: 'set' | 'add' | 'combine') => {
        const sdk = createPluginSdkMock();

        const patch: any = {
            set: jest.fn().mockImplementation(() => patch),
            add: jest.fn().mockImplementation(() => patch),
            combine: jest.fn().mockImplementation(() => patch),
            save: jest.fn().mockReturnValue(Promise.resolve()),
        };

        Object.defineProperty(sdk.user, 'edit', {
            value: jest.fn().mockReturnValue(patch),
        });

        const definition: PatchDefinition = {
            subject: 'user',
            attribute: 'someAttribute',
            operation: operation,
            source: {
                type: 'provided',
                value: 'foo',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch[operation]).toHaveBeenCalledWith('someAttribute', 'foo');
        expect(patch.save).toHaveBeenCalled();
    });

    test.each<[string]>([
        ['set'],
        ['add'],
        ['combine'],
    ])('should %s an attribute to session with a provided value', async (operation: 'set' | 'add' | 'combine') => {
        const sdk = createPluginSdkMock();

        const patch: any = {
            set: jest.fn().mockImplementation(() => patch),
            add: jest.fn().mockImplementation(() => patch),
            combine: jest.fn().mockImplementation(() => patch),
            save: jest.fn().mockReturnValue(Promise.resolve()),
        };

        Object.defineProperty(sdk.session, 'edit', {
            value: jest.fn().mockReturnValue(patch),
        });

        const definition: PatchDefinition = {
            subject: 'session',
            attribute: 'someAttribute',
            operation: operation,
            source: {
                type: 'provided',
                value: 'foo',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(sdk.session.edit).toHaveBeenCalled();
        expect(patch[operation]).toHaveBeenCalledWith('someAttribute', 'foo');
        expect(patch.save).toHaveBeenCalled();
    });

    test('should set an attribute with a value of an input validated by a function', async () => {
        const input = document.createElement('input');
        input.value = 'enterprise';
        input.classList.add('example');

        document.body.appendChild(input);

        const sdk = createPluginSdkMock();
        const patch: any = {
            set: jest.fn().mockImplementation(() => patch),
            save: jest.fn().mockReturnValue(Promise.resolve()),
        };

        Object.defineProperty(sdk.user, 'edit', {
            value: jest.fn().mockReturnValue(patch),
        });

        const validation = jest.fn().mockReturnValue(true);
        const normalization = jest.fn().mockReturnValue('Enterprise');
        const definition: PatchDefinition = {
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'input',
                element: '.example',
                validation: validation,
                normalization: normalization,
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch.set).toHaveBeenCalledWith('plan', 'Enterprise');
        expect(patch.save).toHaveBeenCalled();
        expect(validation).toHaveBeenCalledBefore(normalization);
    });

    test('should not set an attribute with a value of a password input', async () => {
        const input = document.createElement('input');
        input.type = 'password';
        input.classList.add('example');

        document.body.appendChild(input);

        const sdk = createPluginSdkMock();
        const patch: any = {
            set: jest.fn().mockImplementation(() => patch),
            save: jest.fn(),
        };

        Object.defineProperty(sdk.user, 'edit', {
            value: jest.fn().mockReturnValue(patch),
        });

        const definition: PatchDefinition = {
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'input',
                element: '.example',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(patch.save).not.toHaveBeenCalled();
    });

    test('should not set an attribute with a value of an input if it does not match the given regex', async () => {
        const input = document.createElement('input');
        input.value = 'enterprise';
        input.classList.add('example');

        document.body.appendChild(input);

        const sdk = createPluginSdkMock();
        const patch: any = {
            set: jest.fn().mockImplementation(() => patch),
            save: jest.fn().mockReturnValue(Promise.resolve()),
        };

        Object.defineProperty(sdk.user, 'edit', {
            value: jest.fn().mockReturnValue(patch),
        });

        const definition: PatchDefinition = {
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'input',
                element: '.example',
                validation: /[0-9][a-z]+/,
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(patch.save).not.toHaveBeenCalled();
    });

    test('should set an attribute with a value of a selection', async () => {
        const option = document.createElement('option');
        option.value = 'enterprise';

        const select = document.createElement('select');
        select.add(option);
        select.classList.add('example');

        document.body.appendChild(select);

        const sdk = createPluginSdkMock();
        const patch: any = {
            set: jest.fn().mockImplementation(() => patch),
            save: jest.fn().mockReturnValue(Promise.resolve()),
        };

        Object.defineProperty(sdk.user, 'edit', {
            value: jest.fn().mockReturnValue(patch),
        });

        const definition: PatchDefinition = {
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'input',
                element: '.example',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch.set).toHaveBeenCalledWith('plan', 'enterprise');
        expect(patch.save).toHaveBeenCalled();
    });

    test('should set an attribute with a value of a text area', async () => {
        const textArea = document.createElement('textarea');
        textArea.value = 'enterprise';
        textArea.classList.add('example');

        document.body.appendChild(textArea);

        const sdk = createPluginSdkMock();
        const patch: any = {
            set: jest.fn().mockImplementation(() => patch),
            save: jest.fn().mockReturnValue(Promise.resolve()),
        };

        Object.defineProperty(sdk.user, 'edit', {
            value: jest.fn().mockReturnValue(patch),
        });

        const definition: PatchDefinition = {
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'input',
                element: '.example',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch.set).toHaveBeenCalledWith('plan', 'enterprise');
        expect(patch.save).toHaveBeenCalled();
    });

    test('should not set an attribute with a value of another element types', async () => {
        const div = document.createElement('div');
        div.classList.add('example');

        document.body.appendChild(div);

        const sdk = createPluginSdkMock();
        const patch: any = {
            set: jest.fn().mockImplementation(() => patch),
            save: jest.fn().mockReturnValue(Promise.resolve()),
        };

        Object.defineProperty(sdk.user, 'edit', {
            value: jest.fn().mockReturnValue(patch),
        });

        const definition: PatchDefinition = {
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'input',
                element: '.example',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(patch.save).not.toHaveBeenCalled();
    });

    test('should not set an attribute with a value of an element that does not exist', async () => {
        const sdk = createPluginSdkMock();
        const patch: any = {
            set: jest.fn().mockImplementation(() => patch),
            save: jest.fn().mockReturnValue(Promise.resolve()),
        };

        Object.defineProperty(sdk.user, 'edit', {
            value: jest.fn().mockReturnValue(patch),
        });

        const definition: PatchDefinition = {
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'input',
                element: '.example',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(patch.save).not.toHaveBeenCalled();
    });
});
