import { Document, Schema, Model, model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RoleModel } from './roles';

const SALT_ROUND = 12;

export interface UserDocument extends Document {
	uuid: string;
	username: string;
	firstName: string;
	role: RoleModel;
	lastName: string;
	email: string;
	password: string;
	createdAt: Date;
}

export type UserModel = UserDocument;

export const UserSchema: Schema = new Schema(
	{
		uuid: {
			type: String,
			required: false,
		},
		role: {
			type: Schema.Types.ObjectId,
			ref: 'Role',
			required: 'true',
		},
		username: {
			type: String,
			required: false,
		},
		firstName: {
			type: String,
			required: false,
		},
		lastName: {
			type: String,
			required: false,
		},
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
	},
	{
		collection: 'users',
		timestamps: true,
	},
);

UserSchema.methods.comparePassword = async function (password: string) {
	return await bcrypt.compare(password, this.password);
};

UserSchema.pre<UserDocument>('save', async function (next) {
	this.uuid = uuidv4();
	this.username = this.email;
	this.firstName = null;
	this.lastName = null;
	this.password = await bcrypt.hash(this.password, SALT_ROUND);
	this.createdAt = new Date();
	next();
});

export const User: Model<UserModel> = model<UserModel>('User', UserSchema);
