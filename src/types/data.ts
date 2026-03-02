import type { Types } from "mongoose";
import type { ActionEnum, StatusEnum } from "../constants/contact.js";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}


export interface IContact {
  id?: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: typeof StatusEnum[keyof typeof StatusEnum];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy: Types.ObjectId;
  isDeleted?: boolean;
}


export interface IActivityLog {
  action: keyof typeof ActionEnum;
  user: Types.ObjectId;
  contact: Types.ObjectId;
  createdAt?: string;
  updatedAt?: string;
}


export interface PaginateOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, unknown>;
    lean?: boolean;
    populate?: Record<string, unknown> | string;
}

export interface PaginateResult<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    page?: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage?: number | null;
    prevPage?: number | null;
}
