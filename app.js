const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- MONGOOSE CONNECTION -------------------- */
mongoose
  .connect(
    "mongodb+srv://Maitreya:killdill12@cluster0.sk6ugig.mongodb.net/triviaappdatabase?retryWrites=true&w=majority"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* -------------------- MCQ SCHEMA -------------------- */
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },

  options: {
    A: { type: String, required: true },
    B: { type: String, required: true },
    C: { type: String, required: true },
    D: { type: String, required: true },
  },

  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true,
  },

  topic: {
    type: String,
    default: "General",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model("Question", questionSchema);

/* -------------------- ROUTES -------------------- */

/* ✅ CREATE MCQ */
app.post("/post-question", async (req, res) => {
  try {
    const { question, options, correctAnswer, topic } = req.body;

    if (
      !question ||
      !options ||
      !options.A ||
      !options.B ||
      !options.C ||
      !options.D ||
      !correctAnswer
    ) {
      return res.status(400).json({
        success: false,
        message: "Incomplete MCQ data",
      });
    }

    const newQuestion = new Question({
      question,
      options,
      correctAnswer,
      topic,
    });

    await newQuestion.save();

    res.status(201).json({
      success: true,
      message: "MCQ saved successfully",
    });
  } catch (error) {
    console.error("POST error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* ✅ GET QUESTIONS (OPTIONAL TOPIC FILTER) */
app.get("/get-questions", async (req, res) => {
  try {
    const { topic } = req.query;
    const filter = topic && topic !== "All" ? { topic } : {};

    const questions = await Question.find(filter).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      topic: topic || "All",
      questions,
    });
  } catch (error) {
    console.error("GET error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
});

/* ✅ UPDATE QUESTION */
app.put("/update-question/:id", async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({
      success: true,
      message: "Question updated",
    });
  } catch (error) {
    console.error("UPDATE error:", error);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
});

/* ✅ DELETE QUESTION */
app.delete("/delete-question/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Question deleted",
    });
  } catch (error) {
    console.error("DELETE error:", error);
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
});

/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
