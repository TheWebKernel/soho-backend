import { boomify } from 'boom';
import * as fp from 'fastify-plugin';
import { ajv } from './../schemas/user.schema';

export default fp(async (server, opts, next) => {
	server.get(
		'/users/:id',
		{
			preValidation: [server.authenticate],
			schema: {
				headers: ajv.getSchema('urn:schema:request:getUserHeaders').schema,
				params: ajv.getSchema('urn:schema:request:getUserParams').schema,
				response: {
					200: {
						type: 'object',
						required: ['uuid', 'username', 'firstName', 'lastName', 'createdAt', 'role'],
						properties: {
							uuid: { type: 'string', format: 'uuid' },
							username: { type: 'string' },
							firstName: { type: 'string' },
							lastName: { type: 'string' },
							role: {
								type: 'object',
								required: ['name', 'uuid'],
								properties: {
									name: { type: 'string' },
									uuid: { type: 'string', format: 'uuid' },
								},
							},
							createdAt: { type: 'string', format: 'date-time' },
						},
					},
				},
			},
		},
		async (request, reply) => {
			try {
				const uuid = request.params.id;

				const user = await server.db.models.User.findOne({
					uuid,
				}).populate('role');

				if (!user) {
					return reply.code(400).send([{ message: 'No such user found.' }]);
				}

				return reply.code(200).send(user);
			} catch (error) {
				request.log.error(error);
				return reply.send(400);
			}
		},
	);

	server.post(
		'/users',
		{
			schema: {
				body: ajv.getSchema('urn:schema:request:userPostReq').schema,
				response: {
					201: {
						type: 'object',
						properties: {},
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
					reply.code(400).send(request.validationError);
					return;
				}
				const { User, Role } = server.db.models;
				const { email, password, role } = request.body;
				let user = await User.findOne({ email });
				if (user) {
					return reply.code(400).send([{ message: 'User already exists for this email' }]);
				}

				const dbRole = await Role.findOne({ name: role });
				if (!dbRole) {
					return reply.code(400).send([{ message: 'Role does not exist' }]);
				}

				user = await User.create({ email, password, role: dbRole } as any);
				return reply.code(201).send(user);
			} catch (error) {
				request.log.error(error);
				throw boomify(error);
			}
		},
	);
	next();
});
