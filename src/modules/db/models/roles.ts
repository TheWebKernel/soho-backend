import { Document, Schema, Model, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface RoleDocument extends Document {
	uuid: string;
	name: string;
	createdAt: Date;
}

export type RoleModel = RoleDocument;

export const RoleSchema: Schema = new Schema(
	{
		uuid: String,
		name: String,
	},
	{
		collection: 'roles',
		timestamps: true,
	},
);

RoleSchema.pre<RoleDocument>('save', async function (next) {
	this.uuid = uuidv4();
	next();
});

export const Role: Model<RoleModel> = model<RoleModel>('Role', RoleSchema);
