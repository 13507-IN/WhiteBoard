const express = require("express");
const Whiteboard = require("../models/Whiteboard");
const ensureAuth = require("../middleware/ensureAuth");

const router = express.Router();

// Get all whiteboards for the user
router.get("/", ensureAuth, async (req, res) => {
  try {
    const whiteboards = await Whiteboard.find({ user: req.user.id }).sort({
      updatedAt: -1,
    });
    
    const result = whiteboards.map(wb => {
      const obj = wb.toObject();
      if (typeof obj.drawingData === "string") {
        try {
          obj.drawingData = JSON.parse(obj.drawingData);
        } catch (e) {
          obj.drawingData = [];
        }
      }
      return obj;
    });
    
    res.json(result);
  } catch (_error) {
    res.status(500).json({ message: "Failed to load whiteboards" });
  }
});

// Get a specific whiteboard
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    const whiteboard = await Whiteboard.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!whiteboard) {
      return res.status(404).json({ message: "Whiteboard not found" });
    }
    
    const result = whiteboard.toObject();
    if (typeof result.drawingData === "string") {
      try {
        result.drawingData = JSON.parse(result.drawingData);
      } catch (e) {
        result.drawingData = [];
      }
    }
    
    res.json(result);
  } catch (_error) {
    res.status(500).json({ message: "Failed to load whiteboard" });
  }
});

// Create a new whiteboard
router.post("/", ensureAuth, async (req, res) => {
  try {
    const title = String(req.body?.title || "Untitled Whiteboard").trim();

    const whiteboard = await Whiteboard.create({
      user: req.user.id,
      title,
      drawingData: [],
    });

    const result = whiteboard.toObject();
    res.status(201).json(result);
  } catch (_error) {
    res.status(500).json({ message: "Failed to create whiteboard" });
  }
});

// Update whiteboard (save drawing data)
router.patch("/:id", ensureAuth, async (req, res) => {
  try {
    const whiteboard = await Whiteboard.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!whiteboard) {
      return res.status(404).json({ message: "Whiteboard not found" });
    }

    if (typeof req.body?.title === "string") {
      whiteboard.title = req.body.title.trim() || "Untitled Whiteboard";
    }

    if (req.body?.drawingData) {
      // Handle both string and array formats
      if (typeof req.body.drawingData === "string") {
        try {
          whiteboard.drawingData = JSON.parse(req.body.drawingData);
        } catch (e) {
          whiteboard.drawingData = req.body.drawingData;
        }
      } else if (Array.isArray(req.body.drawingData)) {
        whiteboard.drawingData = req.body.drawingData;
      }
    }

    await whiteboard.save();
    
    // Return with drawingData as array
    const result = whiteboard.toObject();
    if (typeof result.drawingData === "string") {
      try {
        result.drawingData = JSON.parse(result.drawingData);
      } catch (e) {
        result.drawingData = [];
      }
    }
    
    res.json(result);
  } catch (_error) {
    res.status(500).json({ message: "Failed to update whiteboard" });
  }
});

// Delete a whiteboard
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    const deleted = await Whiteboard.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Whiteboard not found" });
    }

    res.json({ message: "Whiteboard deleted" });
  } catch (_error) {
    res.status(500).json({ message: "Failed to delete whiteboard" });
  }
});

module.exports = router;
