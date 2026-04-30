// Project routes — CRUD for ML projects with stage-based progress tracking.

const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const Project = require("../models/Project");
const ActivityService = require("../services/activity.service");

const STAGE_ACTION_MAP = {
  initialized: "project_created",
  dataset_uploaded: "project_dataset_uploaded",
  eda_completed: "project_eda_completed",
  model_selected: "project_model_selected",
  training: "project_training_started",
  trained: "project_trained",
  evaluated: "project_evaluated",
  completed: "project_completed",
};

const STAGE_LABEL_MAP = {
  initialized: "initialized",
  dataset_uploaded: "dataset upload",
  eda_completed: "EDA analysis",
  model_selected: "model selection",
  training: "training",
  trained: "model training",
  evaluated: "evaluation",
  completed: "completion",
};

// ── GET /api/user/projects ─────────────────────────────────────────────────
// List all projects for the authenticated user (most recently updated first).
router.get("/", requireAuth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/user/projects/stats ───────────────────────────────────────────
// Aggregated statistics for the dashboard overview cards.
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).lean();
    const completedStages = ["trained", "evaluated", "completed"];
    const activeStages    = ["dataset_uploaded", "eda_completed", "model_selected", "training"];

    res.json({
      total:     projects.length,
      active:    projects.filter(p => activeStages.includes(p.stage)).length,
      completed: projects.filter(p => completedStages.includes(p.stage)).length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/user/projects ────────────────────────────────────────────────
// Create or update a project record (upsert by sessionId).
// Called by the lab page each time the user completes a workflow stage.
router.post("/", requireAuth, async (req, res) => {
  try {
    const { sessionId, name, dataset, stage, problemType, targetColumn, selectedModel, metrics } = req.body;

    if (!sessionId) return res.status(400).json({ error: "sessionId is required" });

    const existingProject = await Project.findOne({ userId: req.user._id, sessionId }).lean();

    // Build the $set payload from whatever fields were sent.
    const update = {};
    if (name)          update.name          = name;
    if (dataset)       update.dataset       = dataset;
    if (stage)         update.stage         = stage;
    if (problemType)   update.problemType   = problemType;
    if (targetColumn)  update.targetColumn  = targetColumn;
    if (selectedModel) update.selectedModel = selectedModel;
    if (metrics)       update.metrics       = metrics;

    const project = await Project.findOneAndUpdate(
      { userId: req.user._id, sessionId },
      {
        $set:         update,
        $setOnInsert: { userId: req.user._id, sessionId },
      },
      { upsert: true, new: true, runValidators: true }
    );

    const previousStage = existingProject?.stage;
    const nextStage = project.stage || stage || previousStage || "initialized";
    const stageChanged = !!stage && stage !== previousStage;
    const createdNow = !existingProject;

    let action = createdNow ? "project_created" : "project_updated";
    let description = createdNow
      ? `Created project "${project.name || "Untitled Project"}"`
      : `Updated project "${project.name || "Untitled Project"}"`;

    if (stageChanged) {
      action = STAGE_ACTION_MAP[nextStage] || "project_updated";
      description = createdNow
        ? `Created project "${project.name || "Untitled Project"}" (${STAGE_LABEL_MAP[nextStage] || nextStage})`
        : `Project "${project.name || "Untitled Project"}" moved to ${STAGE_LABEL_MAP[nextStage] || nextStage}`;
    }

    await ActivityService.logActivity(
      req.user._id,
      req.user.email,
      req.user.name,
      action,
      description,
      req,
      {
        projectId: project._id.toString(),
        sessionId: project.sessionId,
        projectName: project.name,
        currentStage: nextStage,
        previousStage: previousStage || null,
        datasetFilename: project.dataset?.filename || null,
        selectedModel: project.selectedModel || null,
        targetColumn: project.targetColumn || null,
        problemType: project.problemType || null,
      }
    );

    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/user/projects/:id ─────────────────────────────────────────
// Delete a project by its MongoDB _id (must belong to the current user).
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id }).lean();

    if (project) {
      await ActivityService.logActivity(
        req.user._id,
        req.user.email,
        req.user.name,
        "project_deleted",
        `Deleted project "${project.name || "Untitled Project"}"`,
        req,
        {
          projectId: project._id.toString(),
          sessionId: project.sessionId,
          projectName: project.name,
          previousStage: project.stage || null,
          datasetFilename: project.dataset?.filename || null,
        }
      );
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const { uploadDataset } = require("../config/multer");

router.post("/upload/dataset/:sessionId", requireAuth, uploadDataset.single("file"), async (req, res) => {

  try {

    const s3Url = req.file.location;

    const project = await Project.findOneAndUpdate(

      { userId: req.user._id, sessionId: req.params.sessionId },

      {

        $set: {

          "dataset.filename": req.file.originalname,

          "dataset.filePath": s3Url,

          "dataset.sizeKb": Math.round(req.file.size / 1024),

          "dataset.fileType": req.file.mimetype,

          stage: "dataset_uploaded",

        }

      },

      { new: true }

    );

    res.json({ success: true, url: s3Url, project });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

