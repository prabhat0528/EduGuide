const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  content: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;