// ML Project model — tracks user progress through the ML workflow pipeline.

const mongoose = require("mongoose");

const STAGES = [
  "initialized",       // project record created
  "dataset_uploaded",  // CSV/Excel file uploaded to lab-backend
  "eda_completed",     // AI analysis (EDA + model suggestions) finished
  "model_selected",    // user picked a model
  "training",          // pipeline is currently building
  "trained",           // model trained successfully
  "evaluated",         // prediction / evaluation run
  "completed",         // user marked project done
];

const projectSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId:{ type: String, required: true }, // lab-backend session id (unique per project)
    name:     { type: String, default: "Untitled Project" },
    dataset: {
      filename: String,
      filePath: String, // absolute server-side path (e.g. /tmp/lab_uploads/{sessionId}/file.csv)
      rowCount: Number,
      fileType: String,
      sizeKb:   Number,
    },
    stage:         { type: String, enum: STAGES, default: "initialized" },
    problemType:   String, // "classification" | "regression" | "clustering" | ...
    targetColumn:  String,
    selectedModel: String,
    metrics:       { type: mongoose.Schema.Types.Mixed }, // accuracy, f1, etc.
  },
  { timestamps: true }
);

projectSchema.index({ userId: 1, updatedAt: -1 });
projectSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model("Project", projectSchema);
module.exports.STAGES = STAGES;
