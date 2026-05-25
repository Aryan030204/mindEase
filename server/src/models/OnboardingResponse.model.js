import mongoose from "mongoose";

const selectedOptionSchema = new mongoose.Schema(
  {
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    traitEffects: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    weight: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const onboardingResponseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OnboardingQuestion",
      required: true,
      index: true,
    },
    onboardingVersion: {
      type: Number,
      required: true,
      index: true,
    },
    selectedOption: {
      type: selectedOptionSchema,
      required: true,
    },
    derivedTraits: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

onboardingResponseSchema.index(
  { userId: 1, questionId: 1, onboardingVersion: 1 },
  { unique: true }
);
onboardingResponseSchema.index({ userId: 1, onboardingVersion: 1, createdAt: -1 });

export default mongoose.model("OnboardingResponse", onboardingResponseSchema);
