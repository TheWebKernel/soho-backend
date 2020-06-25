import { boomify } from 'boom';
import * as fp from 'fastify-plugin';

export default fp(async (server, opts, next) => {
	server.post(
		'/auth',
		{
			schema: {
				body: {
					type: 'object',
					required: ['email', 'password'],
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
					},
					errorMessage: {
						required: {
							email: 'Email missing', // specify error message for when the
							password: 'Password missing', // property is missing from input
						},
					},
				},
				response: {
					200: {
						type: 'object',
						properties: {
							uuid: { type: 'string', format: 'uuid' },
							token: { type: 'string' },
							refreshToken: { type: 'string' },
							expiresAt: { type: 'string', format: 'date-time' },
						},
					},
					400: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								message: { type: 'string' },
							},
							required: ['message'],
						},
					},
				},
			},
			attachValidation: true,
		},
		async (request, reply) => {
			try {
				if (request.validationError) {
					return reply.code(400).send(request.validationError);
				}
				const { User } = server.db.models;
				const { email, password } = request.body;
				const user = await User.findOne({ email });

				if (!user) {
					return reply.code(400).send([{ message: 'No such email found.' }]);
				}

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const correctPassword = await (user as any).comparePassword(password);

				if (!correctPassword) {
					return reply.code(400).send([{ message: 'Wrong password.' }]);
				}

				return reply.code(200).send({ uuid: user.uuid, token: server.jwt.sign(user.uuid) });
			} catch (error) {
				request.log.error(error);
				throw boomify(error);
			}
		},
	);
	next();
});
