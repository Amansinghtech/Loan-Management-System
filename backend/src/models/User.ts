import bcrypt from 'bcryptjs';
import { HydratedDocument, Model, Schema, Types, model } from 'mongoose';
import { EmploymentMode, Role } from '../types';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  // Borrower profile (collected in step 2 of the application)
  fullName?: string;
  pan?: string;
  dob?: Date;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(Role), required: true, default: Role.BORROWER },
    fullName: { type: String, trim: true },
    pan: { type: String, uppercase: true, trim: true },
    dob: { type: Date },
    monthlySalary: { type: Number, min: 0 },
    employmentMode: { type: String, enum: Object.values(EmploymentMode) },
    profileComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.method('comparePassword', function comparePassword(candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash);
});

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export type UserId = Types.ObjectId;

export const User = model<IUser, UserModel>('User', userSchema);
