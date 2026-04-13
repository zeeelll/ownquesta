const Payment = require("../models/Payment");
const MlopsDeployment = require("../models/MlopsDeployment");
const DownloadAccess = require("../models/DownloadAccess");

function buildUserScope(req) {
  return {
    $or: [{ userId: req.user._id }, { customerEmail: String(req.user.email || "").toLowerCase() }],
  };
}

exports.getMyDownloads = async (req, res) => {
  try {
    const paidRows = await Payment.find({
      ...buildUserScope(req),
      status: "paid",
      productType: { $in: ["model", "py", "ipynb"] },
    })
      .sort({ paidAt: -1, createdAt: -1 })
      .lean();

    const freeRows = await DownloadAccess.find({
      userId: req.user._id,
      accessType: "free",
      productType: { $in: ["model", "py", "ipynb"] },
    })
      .sort({ downloadedAt: -1, createdAt: -1 })
      .lean();

    const paidDownloads = paidRows.map((p) => ({
      orderId: p.orderId,
      product: p.product,
      modelName: p.modelName,
      productType: p.productType,
      amountInr: p.amountInr,
      paidAt: p.paidAt,
      accessType: "paid",
      status: "unlocked",
      formats:
        p.productType === "py"
          ? [".py", "python script"]
          : p.productType === "ipynb"
            ? [".ipynb"]
            : [".pkl", ".py", ".ipynb"],
    }));

    const freeDownloads = freeRows.map((d) => ({
      orderId: d.orderId || `FREE-${d._id.toString().slice(-8).toUpperCase()}`,
      product: d.productType === "py" ? "python-script" : d.productType === "ipynb" ? "jupyter-notebook" : "trained-model",
      modelName: d.modelName || "Trained Model",
      productType: d.productType,
      amountInr: 0,
      paidAt: d.downloadedAt || d.createdAt,
      accessType: "free",
      status: "free_unlocked",
      formats:
        d.productType === "py"
          ? [".py", "python script"]
          : d.productType === "ipynb"
            ? [".ipynb"]
            : [".pkl"],
    }));

    const downloads = [...paidDownloads, ...freeDownloads].sort((a, b) => {
      const tA = new Date(a.paidAt || 0).getTime();
      const tB = new Date(b.paidAt || 0).getTime();
      return tB - tA;
    });

    return res.json({ downloads });
  } catch (error) {
    console.error("Error fetching user downloads:", error);
    return res.status(500).json({ message: "Unable to fetch downloads" });
  }
};

exports.trackDownloadAccess = async (req, res) => {
  try {
    const sessionId = String(req.body?.sessionId || "").trim();
    const orderId = String(req.body?.orderId || "").trim();
    const modelName = String(req.body?.modelName || "Trained Model").trim();
    const productType = String(req.body?.productType || "model").trim().toLowerCase();
    const fileName = String(req.body?.fileName || "").trim();
    const source = String(req.body?.source || "automl").trim().toLowerCase();
    const accessType = String(req.body?.accessType || "free").trim().toLowerCase();
    const amountInr = Number(req.body?.amountInr || 0);
    const metadata = req.body?.metadata && typeof req.body.metadata === "object" && !Array.isArray(req.body.metadata)
      ? req.body.metadata
      : {};

    const allowedType = ["model", "py", "ipynb", "other"].includes(productType) ? productType : "other";
    const allowedAccess = accessType === "paid" ? "paid" : "free";

    const doc = await DownloadAccess.create({
      userId: req.user._id,
      customerName: req.user.name || "User",
      customerEmail: String(req.user.email || "").toLowerCase(),
      sessionId,
      orderId,
      modelName,
      productType: allowedType,
      fileName,
      source,
      accessType: allowedAccess,
      amountInr: Number.isFinite(amountInr) ? Math.max(0, amountInr) : 0,
      metadata,
      downloadedAt: new Date(),
    });

    return res.status(201).json({ tracked: true, download: doc });
  } catch (error) {
    console.error("Error tracking download access:", error);
    return res.status(500).json({ message: "Unable to track download access" });
  }
};

exports.getMyDeployments = async (req, res) => {
  try {
    const deployments = await MlopsDeployment.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({ deployments });
  } catch (error) {
    console.error("Error fetching user deployments:", error);
    return res.status(500).json({ message: "Unable to fetch deployments" });
  }
};

exports.provisionDeployment = async (req, res) => {
  try {
    const paymentOrderId = String(req.body?.paymentOrderId || "").trim();
    const sessionId = String(req.body?.sessionId || "").trim();
    const modelName = String(req.body?.modelName || "Trained Model").trim();

    if (!paymentOrderId) {
      return res.status(400).json({ message: "paymentOrderId is required" });
    }

    const payment = await Payment.findOne({
      orderId: paymentOrderId,
      status: "paid",
      productType: "deploy",
      ...buildUserScope(req),
    }).lean();

    if (!payment) {
      return res.status(404).json({ message: "Valid deploy payment not found" });
    }

    const existing = await MlopsDeployment.findOne({ paymentOrderId }).lean();
    if (existing) {
      return res.json({ deployment: existing, reused: true });
    }

    const deploymentIdSuffix = paymentOrderId.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const endpointUrl = `https://${deploymentIdSuffix}.ownquesta.ai/predict`;
    const deploymentFiles = [
      "mlops-template/api/main.py",
      "mlops-template/Dockerfile",
      "mlops-template/deployment.yaml",
      "mlops-template/mlflow_track.py",
      "mlops-template/monitoring.py",
      ".github/workflows/deploy.yml",
    ];

    const deployment = await MlopsDeployment.create({
      userId: req.user._id,
      paymentOrderId,
      sessionId: sessionId || payment.sessionId || "",
      modelName: modelName || payment.modelName || "Trained Model",
      status: "running",
      endpointUrl,
      namespace: "ownquesta-prod",
      replicas: 2,
      minReplicas: 2,
      maxReplicas: 10,
      monitoringEnabled: true,
      autoscalingEnabled: true,
      ciCdWorkflow: ".github/workflows/deploy.yml",
      deploymentFiles,
      lastDeployedAt: new Date(),
    });

    return res.status(201).json({
      deployment,
      provisioned: true,
      message: "MLOps infrastructure provisioned with monitoring and autoscaling.",
    });
  } catch (error) {
    console.error("Error provisioning deployment:", error);
    return res.status(500).json({ message: "Unable to provision deployment" });
  }
};

exports.scaleDeployment = async (req, res) => {
  try {
    const deploymentId = String(req.params.id || "").trim();
    const requestedReplicas = Number(req.body?.replicas);

    if (!deploymentId) {
      return res.status(400).json({ message: "Deployment id is required" });
    }
    if (!Number.isFinite(requestedReplicas)) {
      return res.status(400).json({ message: "replicas must be a number" });
    }

    const deployment = await MlopsDeployment.findOne({ _id: deploymentId, userId: req.user._id });
    if (!deployment) {
      return res.status(404).json({ message: "Deployment not found" });
    }

    const boundedReplicas = Math.max(
      deployment.minReplicas,
      Math.min(deployment.maxReplicas, Math.round(requestedReplicas))
    );

    deployment.replicas = boundedReplicas;
    deployment.status = "running";
    deployment.lastDeployedAt = new Date();
    await deployment.save();

    return res.json({ deployment, scaled: true });
  } catch (error) {
    console.error("Error scaling deployment:", error);
    return res.status(500).json({ message: "Unable to scale deployment" });
  }
};
