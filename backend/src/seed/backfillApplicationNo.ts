import { connectDB, disconnectDB } from '../config/db';
import { Loan } from '../models/Loan';
import { generateApplicationNo } from '../utils/applicationNo';

/**
 * One-off migration: assigns an applicationNo to legacy loans created before the
 * field existed. Uses a raw collection update so it does not trigger full-document
 * Mongoose validation. Safe to run multiple times.
 */
async function run(): Promise<void> {
  await connectDB();

  const legacy = await Loan.find({
    $or: [{ applicationNo: { $exists: false } }, { applicationNo: null }, { applicationNo: '' }],
  }).select('_id');

  // eslint-disable-next-line no-console
  console.log(`[backfill] Found ${legacy.length} loan(s) without an applicationNo.`);

  for (const loan of legacy) {
    await Loan.collection.updateOne(
      { _id: loan._id },
      { $set: { applicationNo: generateApplicationNo() } },
    );
  }

  // eslint-disable-next-line no-console
  console.log(`[backfill] Done. Updated ${legacy.length} loan(s).`);
  await disconnectDB();
}

run().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('[backfill] Failed:', err);
  await disconnectDB();
  process.exit(1);
});
