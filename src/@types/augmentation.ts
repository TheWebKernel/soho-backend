/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fastify from 'fastify';
import * as http from 'http';

import { Db } from '../modules/db';
import { ValidationError } from 'ajv';

declare module 'fastify' {
	export interface FastifyInstance<
		HttpServer = http.Server,
		HttpRequest = http.IncomingMessage,
		HttpResponse = http.ServerResponse
	> {
		db: Db;
		authenticate: any;
	}

	export interface FastifyRequest<
		HttpRequest,
		Query = fastify.DefaultQuery,
		Params = fastify.DefaultParams,
		Headers = fastify.DefaultHeaders,
		Body = any
	> {
		validationError: ValidationError;
	}
}
