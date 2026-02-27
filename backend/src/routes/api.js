const express = require("express");
const Todo = require("../models/Todo");
const ensureAuth = require("../middleware/ensureAuth");

const router = express.Router();

router.get("/me", (req, res) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }

  return res.json({
    authenticated: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
    },
  });
});

router.get("/todos", ensureAuth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (_error) {
    res.status(500).json({ message: "Failed to load todos" });
  }
});

router.post("/todos", ensureAuth, async (req, res) => {
  try {
    const text = String(req.body?.text || "").trim();
    if (!text) {
      return res.status(400).json({ message: "Todo text is required" });
    }

    const todo = await Todo.create({
      user: req.user.id,
      text,
    });

    res.status(201).json(todo);
  } catch (_error) {
    res.status(500).json({ message: "Failed to create todo" });
  }
});

router.patch("/todos/:id", ensureAuth, async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    if (typeof req.body?.text === "string") {
      const text = req.body.text.trim();
      if (!text) {
        return res.status(400).json({ message: "Todo text cannot be empty" });
      }
      todo.text = text;
    }

    if (typeof req.body?.completed === "boolean") {
      todo.completed = req.body.completed;
    }

    await todo.save();
    res.json(todo);
  } catch (_error) {
    res.status(500).json({ message: "Failed to update todo" });
  }
});

router.delete("/todos/:id", ensureAuth, async (req, res) => {
  try {
    const deleted = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted" });
  } catch (_error) {
    res.status(500).json({ message: "Failed to delete todo" });
  }
});

module.exports = router;
