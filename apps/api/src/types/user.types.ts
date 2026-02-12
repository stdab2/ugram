/**
 * User-related GraphQL input types and interfaces
 */

import type { FileUpload } from "graphql-upload";

export interface CreateUserInput {
	userName: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	picture?: Promise<FileUpload>;
}

export interface UpdateUserInput {
	id: number;
	userName?: string;
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	picture?: Promise<FileUpload>;
}

export interface QueryUsersInput {
	limit?: number;
	offset?: number;
}
