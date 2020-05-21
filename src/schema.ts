import {
    ArrayType,
    JsonType,
    MixedSchema,
    ObjectType,
    StringType,
    UnionType,
    FunctionType,
} from '@croct/plug/sdk/validation';

/**
 * Action definition schemas
 */
const actionHandlerSchema = new UnionType(
    new FunctionType(),
    new ObjectType({
        required: ['apply'],
        additionalProperties: true,
        properties: {
            apply: new FunctionType(),
        },
    }),
);

const customActionDefinitionSchema = new ObjectType({
    required: ['handler'],
    properties: {
        handler: actionHandlerSchema,
    },
});

const trackingActionDefinitionSchema = new ObjectType({
    required: ['event'],
    properties: {
        event: new ObjectType(),
    },
});

const styleActionDefinitionSchema = new ObjectType({
    required: ['element'],
    properties: {
        element: new StringType({minLength: 1}),
        operation: new StringType({enumeration: ['add', 'remove']}),
        className: new UnionType(
            new StringType(),
            new ArrayType({
                items: new StringType({minLength: 1}),
            }),
        ),
    },
});

const providedSourceSchema = new ObjectType({
    required: ['value'],
    properties: {
        value: new JsonType(),
    },
});

const inputSourceSchema = new ObjectType({
    required: ['element'],
    properties: {
        element: new StringType({minLength: 1}),
        validation: new ObjectType(),
        normalization: new MixedSchema(),
    },
});

const patchSourceSchema = new ObjectType({
    required: ['type'],
    properties: {
        type: new StringType({enumeration: ['input', 'provided']}),
    },
    subtypes: {
        discriminator: 'type',
        schemas: {
            provided: providedSourceSchema,
            input: inputSourceSchema,
        },
    },
});

const patchActionDefinitionSchema = new ObjectType({
    required: ['event'],
    properties: {
        subject: new StringType({
            enumeration: ['user', 'session'],
        }),
        attribute: new StringType({
            format: 'pointer',
        }),
        operation: new StringType({
            enumeration: ['set', 'add', 'combine'],
        }),
        source: patchSourceSchema,
    },
});

const actionDefinitionSchema = new ObjectType({
    required: ['type'],
    additionalProperties: true,
    properties: {
        type: new StringType({
            enumeration: ['custom', 'tracking', 'operation', 'css'],
        }),
    },
    subtypes: {
        discriminator: 'type',
        schemas: {
            custom: customActionDefinitionSchema,
            tracking: trackingActionDefinitionSchema,
            patch: patchActionDefinitionSchema,
            style: styleActionDefinitionSchema,
        },
    },
});

/**
 * Triggers
 */

const matchTriggerSchema = new ObjectType();

const eventTriggerSchema = new ObjectType({
    required: ['element', 'event'],
    properties: {
        element: new StringType({minLength: 1}),
        event: new StringType({minLength: 1}),
    },
});

const triggerSchema = new ObjectType({
    required: ['type'],
    additionalProperties: true,
    properties: {
        type: new StringType({
            enumeration: ['match', 'event'],
        }),
    },
    subtypes: {
        discriminator: 'type',
        schemas: {
            match: matchTriggerSchema,
            event: eventTriggerSchema,
        },
    },
});

const actionConditionSchema = new ObjectType({
    required: ['trigger', 'action'],
    properties: {
        trigger: triggerSchema,
        action: actionDefinitionSchema,
    },
});

export const actionMapSchema = new ObjectType({
    additionalProperties: new UnionType(
        actionConditionSchema,
        new ArrayType({
            items: actionConditionSchema,
        }),
    ),
});
