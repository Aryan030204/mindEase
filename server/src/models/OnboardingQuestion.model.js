import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
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
  { _id: true }
);

const triggerSchema = new mongoose.Schema(
  {
    trait: {
      type: String,
      required: true,
      trim: true,
    },
    operator: {
      type: String,
      enum: ["eq", "gte", "lte", "includes", "contains"],
      default: "eq",
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const onboardingQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    type: {
      type: String,
      enum: ["single", "multi", "scale"],
      default: "single",
    },
    category: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    options: {
      type: [optionSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    followUpTriggers: {
      type: [triggerSchema],
      default: [],
    },
    traitMappings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

onboardingQuestionSchema.index({ isActive: 1, category: 1 });

export default mongoose.model("OnboardingQuestion", onboardingQuestionSchema);
