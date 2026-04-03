import express from "express";
import cors from "cors";

const app = express();
const tasks = [];

app.use(cors());
app.use(express.json());

app.get("/api/tasks", (req, res) => {
  try {
    const { status, priority, search } = req.query;
    let result = [...tasks];

    if (status && status !== "All") {
      result = result.filter(t => t.status === status);
    }
    if (priority && priority !== "All") {
      result = result.filter(t => t.priority === priority);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(s) || 
        (t.description && t.description.toLowerCase().includes(s))
      );
    }

    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/tasks", (req, res) => {
  try {
    const { title, description, priority, category, dueDate } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newTask = {
      id: Date.now(),
      title,
      description: description || "",
      priority: priority || "Low",
      status: "Pending",
      category: category || "General",
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/tasks/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = tasks.findIndex(t => t.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    const { title, description, priority, status, category, dueDate } = req.body;
    tasks[index] = {
      ...tasks[index],
      title: title ?? tasks[index].title,
      description: description ?? tasks[index].description,
      priority: priority ?? tasks[index].priority,
      status: status ?? tasks[index].status,
      category: category ?? tasks[index].category,
      dueDate: dueDate ?? tasks[index].dueDate,
      updatedAt: new Date().toISOString()
    };

    res.json(tasks[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/tasks/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = tasks.findIndex(t => t.id === parseInt(id));

    if (index === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    tasks.splice(index, 1);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});