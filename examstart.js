// ✅ examstart.js

const urlParams = new URLSearchParams(window.location.search);
const examName = urlParams.get("exam") || "Untitled Exam";
const totalQuestions = parseInt(urlParams.get("questions")) || 5;
const timePerQuestion = parseInt(urlParams.get("time")) || 30;

let currentQuestion = 1;
let timer;
let timeRemaining;
let sessionId = Date.now();
let questionStartTime;
const results = [];

const examTitle = document.getElementById("exam-title");
const questionNumber = document.getElementById("question-number");
const timerDisplay = document.getElementById("timer");
const nextBtn = document.getElementById("next-btn");

examTitle.textContent = `Exam: ${examName}`;
questionNumber.textContent = `Question ${currentQuestion}`;

function startQuestion() {
  timeRemaining = timePerQuestion;
  questionStartTime = new Date();
  updateTimerDisplay();
  timer = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timer);
      playBeep();
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerDisplay.textContent = `${String(timeRemaining).padStart(2, "0")} sec`;
}

function playBeep() {
  const beep = new Audio("https://www.soundjay.com/buttons/sounds/beep-07.mp3");
  beep.play();
}

function nextQuestion() {
  clearInterval(timer);
  const timeTaken = Math.floor((new Date() - questionStartTime) / 1000);
  results.push({
    sessionId,
    questionNo: currentQuestion,
    timeAllotted: timePerQuestion,
    timeTaken
  });
  if (currentQuestion >= totalQuestions) {
    finishExam();
  } else {
    currentQuestion++;
    questionNumber.textContent = `Question ${currentQuestion}`;
    startQuestion();
  }
}

function finishExam() {
  localStorage.setItem("examResults", JSON.stringify(results));
  window.location.href = "result.html";
}

nextBtn.addEventListener("click", nextQuestion);

// Voice control setup
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.interimResults = false;
recognition.lang = "en-US";
recognition.start();

recognition.onresult = (e) => {
  const transcript = e.results[e.results.length - 1][0].transcript.trim().toLowerCase();
  if (transcript === "next") {
    nextQuestion();
  }
};

startQuestion();
