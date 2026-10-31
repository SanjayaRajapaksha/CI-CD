const express = require("express");
const app = express();
const PORT = 4000;

app.use(express.json());

// Fake data (in-memory)
let items = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Orange" }
];

// CREATE
app.post("/items", (req, res) => {
  const item = { id: Date.now(), name: req.body.name };
  items.push(item);
  res.status(201).json(item);
});

// READ (all)
app.get("/items", (req, res) => {
  res.json(items);
});



// READ (one)
app.get("/items/:id", (req, res) => {
  const item = items.find(i => i.id == req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json(item);
});

// UPDATE
app.put("/items/:id", (req, res) => {
  const item = items.find(i => i.id == req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.name = req.body.name;
  res.json(item);
});

// DELETE
app.delete("/items/:id", (req, res) => {
  items = items.filter(i => i.id != req.params.id);
  res.json({ message: "Item deleted" });
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
