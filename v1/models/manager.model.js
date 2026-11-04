import mongoose from 'mongoose';

// Multiple managers share an advisor account,
// they are employees of the advisor company and one can manage multiple clients

const managerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  // Virtuals go out in the JSON so a populated `advisor` reaches the client; id: false skips the extra `id` copy
  { timestamps: true, toJSON: { virtuals: true }, id: false },
);

// The advisor's account, filled only when a query populates it. Kept apart from advisorId so
// advisorId always stays a plain id
managerSchema.virtual('advisor', {
  // The advisor discriminator (see user.model.js), whose schema defines `details`
  ref: 'advisor',
  localField: 'advisorId',
  foreignField: '_id',
  justOne: true,
});

const Manager = mongoose.model('Manager', managerSchema, 'managers');

export default Manager;
