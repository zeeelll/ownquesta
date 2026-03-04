// Project routes — CRUD for ML projects with stage-based progress tracking.

const router = require("express").Router();
const requireAuth = require("../middleware/auth.middleware");
const Project = require("../models/Project");

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
      { upsert: true, new: true }
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
    await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
