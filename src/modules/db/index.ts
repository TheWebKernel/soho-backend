import * as fp from 'fastify-plugin';
import * as Mongoose from 'mongoose';
import { Model } from 'mongoose';
import { RoleModel, Role } from './models/roles';
import { User, UserModel } from './models/user';

export interface Models {
	User: Model<UserModel>;
	Role: Model<RoleModel>;
}

export interface Db {
	models: Models;
}

export default fp(async (fastify, opts: { uri: string; useUnifiedTopology: boolean }, next) => {
	Mongoose.connection.on('connected', () => {
		fastify.log.info({ actor: 'MongoDB' }, 'connected');
	});

	Mongoose.connection.on('disconnected', () => {
		fastify.log.error({ actor: 'MongoDB' }, 'disconnected');
	});

	await Mongoose.connect(opts.uri, {
		useNewUrlParser: true,
		useUnifiedTopology: opts.useUnifiedTopology,
	});

	const models: Models = {
		User: User,
		Role: Role,
	};

	fastify.decorate('db', { models });

	next();
});
