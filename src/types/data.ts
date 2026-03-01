import type { Types } from "mongoose";

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
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'Lead' | 'Prospect' | 'Customer';
  notes: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
}

export interface IActivityLog {
  action: 'ADD' | 'EDIT' | 'DELETE';
  user: Types.ObjectId;
  contact: Types.ObjectId;
  createdAt?: string;
  updatedAt?: string;
}