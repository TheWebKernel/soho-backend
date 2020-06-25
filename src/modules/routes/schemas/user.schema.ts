import * as Ajv from 'ajv';

export const ajv = new Ajv({
	removeAdditional: true,
	useDefaults: true,
	coerceTypes: true,
	allErrors: true,
	nullable: true,
});

ajv.addSchema({
	$id: 'urn:schema:request:userPostReq',
	type: 'object',
	required: ['email', 'password', 'role'],
	properties: {
		email: {
			type: 'string',
			format: 'email',
			errorMessage: {
				type: 'Bad email',
				format: 'Invalid email',
			},
		},
		password: {
			type: 'string',
			minLength: 6,
			errorMessage: {
				type: 'Bad password',
				minLength: 'Password should be minimum 6 characters',
			},
		},
		role: {
			type: 'string',
			errorMessage: {
				type: 'Bad password',
			},
		},
	},
	errorMessage: {
		required: {
			email: 'Email missing', // specify error message for when the
			password: 'Password missing', // property is missing from input
			role: 'Role Missing',
		},
	},
});

ajv.addSchema({
	$id: 'urn:schema:request:getUserHeaders',
	type: 'object',
	required: ['Authorization'],
	properties: {
		Authorization: { type: 'string' },
	},
});

ajv.addSchema({
	$id: 'urn:schema:request:getUserParams',
	type: 'object',
	required: ['id'],
	properties: {
		id: { type: 'string', format: 'uuid' },
	},
});
