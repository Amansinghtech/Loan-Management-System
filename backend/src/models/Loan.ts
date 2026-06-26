import { HydratedDocument, Schema, Types, model } from 'mongoose';
import { LoanStatus } from '../types';

export interface ISalarySlip {
  key: string;
  bucket: string;
  mimeType: string;
  originalName: string;
}

export interface ILoan {
  applicationNo: string;
  borrower: Types.ObjectId;
  amount: number;
  tenureDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  amountPaid: number;
  status: LoanStatus;
  salarySlip: ISalarySlip;
  rejectionReason?: string;
  sanctionedBy?: Types.ObjectId;
  disbursedBy?: Types.ObjectId;
  appliedAt: Date;
  sanctionedAt?: Date;
  rejectedAt?: Date;
  disbursedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type LoanDocument = HydratedDocument<ILoan>;

const salarySlipSchema = new Schema<ISalarySlip>(
  {
    key: { type: String, required: true },
    bucket: { type: String, required: true },
    mimeType: { type: String, required: true },
    originalName: { type: String, required: true },
  },
  { _id: false },
);

const loanSchema = new Schema<ILoan>(
  {
    applicationNo: { type: String, required: true, unique: true, index: true },
    borrower: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    tenureDays: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    amountPaid: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: Object.values(LoanStatus),
      required: true,
      default: LoanStatus.APPLIED,
      index: true,
    },
    salarySlip: { type: salarySlipSchema, required: true },
    rejectionReason: { type: String, trim: true },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: () => new Date() },
    sanctionedAt: { type: Date },
    rejectedAt: { type: Date },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

loanSchema.virtual('outstanding').get(function outstanding(this: ILoan) {
  return Math.round((this.totalRepayment - this.amountPaid + Number.EPSILON) * 100) / 100;
});

export const Loan = model<ILoan>('Loan', loanSchema);
