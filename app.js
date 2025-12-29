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
     process.env.mongourl
  )
  .then(() => console.log("✅ MongoDB connected (triviaappdatabase)"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* -------------------- QUESTION SCHEMA -------------------- */
const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
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

// ✅ POST QUESTION
app.post("/post-question", async (req, res) => {
  try {
    const { question, answer, topic } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required",
      });
    }

    const newQuestion = new Question({
      question,
      answer,
      topic,
    });

    await newQuestion.save();

    res.status(201).json({
      success: true,
      message: "Question saved successfully",
    });
  } catch (error) {
    console.error("Error saving question:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ✅ GET QUESTIONS (FOR QUIZ)
// ✅ GET QUESTIONS (FILTERED BY TOPIC)
app.get("/get-questions", async (req, res) => {
  try {
    const { topic } = req.query;

    // If topic is provided, filter by it
    const filter = topic ? { topic } : {};

    const questions = await Question.find(filter)
      .sort({ createdAt: 1 }); // oldest → newest

    res.status(200).json({
      success: true,
      count: questions.length,
      topic: topic||"All",
      questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
});

/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

