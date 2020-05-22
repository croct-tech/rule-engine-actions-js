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
    ])('should %s a user attribute to the provided value', async (operation: 'set' | 'add' | 'combine') => {
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
    ])('should %s a session attribute to the provided value', async (operation: 'set' | 'add' | 'combine') => {
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

    test('should capture attribute values from input fields', async () => {
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
                type: 'element',
                element: '.example',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch.set).toHaveBeenCalledWith('plan', 'enterprise');
        expect(patch.save).toHaveBeenCalled();
    });

    test('should normalize the attribute value using the specified normalizer', async () => {
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

        const definition: PatchDefinition = {
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'element',
                element: '.example',
                validation: validation,
                normalization: jest.fn().mockReturnValue('Enterprise'),
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(validation).toHaveBeenCalledWith('enterprise');

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch.set).toHaveBeenCalledWith('plan', 'Enterprise');
        expect(patch.save).toHaveBeenCalled();
    });

    test('should not capture attribute values from password fields', async () => {
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
                type: 'element',
                element: '.example',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(sdk.user.edit).not.toHaveBeenCalled();
    });

    test('should only capture attributes if the input value satisfies the specified validation', async () => {
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

        const nonMatchingAction = new PatchAction({
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'element',
                element: '.example',
                validation: (): boolean => false,
            },
        });

        await nonMatchingAction.apply(sdk);

        expect(patch.save).not.toHaveBeenCalled();

        const matchingAction = new PatchAction({
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'element',
                element: '.example',
                validation: (): boolean => true,
            },
        });

        await matchingAction.apply(sdk);

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch.set).toHaveBeenCalledWith('plan', 'enterprise');
        expect(patch.save).toHaveBeenCalled();
    });

    test('should only capture attributes if the input value matches the specified regex', async () => {
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

        const nonMatchingAction = new PatchAction({
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'element',
                element: '.example',
                validation: /startup/,
            },
        });

        await nonMatchingAction.apply(sdk);

        expect(patch.save).not.toHaveBeenCalled();

        const matchingAction = new PatchAction({
            subject: 'user',
            attribute: 'plan',
            operation: 'set',
            source: {
                type: 'element',
                element: '.example',
                validation: /enterprise/,
            },
        });

        await matchingAction.apply(sdk);

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch.set).toHaveBeenCalledWith('plan', 'enterprise');
        expect(patch.save).toHaveBeenCalled();
    });

    test('should capture attribute values from select fields', async () => {
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
                type: 'element',
                element: '.example',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch.set).toHaveBeenCalledWith('plan', 'enterprise');
        expect(patch.save).toHaveBeenCalled();
    });

    test('should capture attribute values from textarea fields', async () => {
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
                type: 'element',
                element: '.example',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch.set).toHaveBeenCalledWith('plan', 'enterprise');
        expect(patch.save).toHaveBeenCalled();
    });

    test('should capture attribute values from the content of non-form fields', async () => {
        const div = document.createElement('div');
        div.textContent = 'enterprise';
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
                type: 'element',
                element: '.example',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(sdk.user.edit).toHaveBeenCalled();
        expect(patch.set).toHaveBeenCalledWith('plan', 'enterprise');
        expect(patch.save).toHaveBeenCalled();
    });

    test('should not fail if an element does not exist', async () => {
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
                type: 'element',
                element: '.non-existent-element',
            },
        };

        const action = new PatchAction(definition);

        await action.apply(sdk);

        expect(patch.save).not.toHaveBeenCalled();
    });
});
