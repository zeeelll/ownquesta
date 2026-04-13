const mongoose = require("mongoose");

const mlopsDeploymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    paymentOrderId: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, default: "", index: true },
    modelName: { type: String, default: "Trained Model" },
    status: {
      type: String,
      enum: ["provisioning", "running", "failed", "paused"],
      default: "provisioning",
      index: true,
    },
    endpointUrl: { type: String, default: "" },
    namespace: { type: String, default: "ownquesta-prod" },
    replicas: { type: Number, default: 2, min: 1 },
    minReplicas: { type: Number, default: 2, min: 1 },
    maxReplicas: { type: Number, default: 10, min: 1 },
    monitoringEnabled: { type: Boolean, default: true },
    autoscalingEnabled: { type: Boolean, default: true },
    ciCdWorkflow: { type: String, default: ".github/workflows/deploy.yml" },
    deploymentFiles: { type: [String], default: [] },
    lastDeployedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MlopsDeployment", mlopsDeploymentSchema);
