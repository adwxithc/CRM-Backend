import mongoose from "mongoose";
import { BadRequestError } from "../errors/bad-request-error.js";

export function toObjectId(id: string | undefined | null): mongoose.Types.ObjectId | undefined {
  if (!id) return undefined;
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    throw new BadRequestError("Invalid ID format");
  }
}
