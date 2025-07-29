// script.js
console.log("✅ Connected script.js");

let currentQuestion = 0;
let totalQuestions = 0;
let questionTime = 0;
let extraTime = 0;
let timer;
let examStarted = false;
let sessionId = Date.now();
let startTime;
let speechRecognition;
const questionsData = [];

document.getElementById("exam-form").addEventListener("submit", function (e) {
  e.preventDefault(); // 🔴 Prevent page reload

  const examName = document.getElementById("exam-name").value;
  const totalQuestions = parseInt(document.getElementById("question-count").value);
  const timePerQuestion = parseInt(document.getElementById("time-per-question").value);

  // 🔁 Redirect to exam page with query parameters
  window.location.href = `exam.html?exam=${encodeURIComponent(examName)}&count=${totalQuestions}&time=${timePerQuestion}`;
});

function startExam() {
  const name = document.getElementById('exam-name').value.trim();
  totalQuestions = parseInt(document.getElementById('total-questions').value);
  const totalTime = parseInt(document.getElementById('total-time').value);
  
  if (!name || !totalQuestions || !totalTime) {
    alert("Please fill all fields correctly.");
    return;
  }

  questionTime = Math.floor((totalTime * 60) / totalQuestions); // in seconds
  document.getElementById('setup-section').style.display = 'none';
  document.getElementById('exam-section').style.display = 'block';
  examStarted = true;
  currentQuestion = 1;
  startQuestion();
  initVoiceRecognition();
}

function startQuestion() {
  if (currentQuestion > totalQuestions) {
    endExam();
    return;
  }
  const allotted = questionTime;
  startTime = new Date();
  document.getElementById('question-no').innerText = `Question ${currentQuestion}`;
  timer = setTimeout(() => {
    playBeep();
  }, allotted * 1000);
}

function nextQuestion() {
  if (!examStarted) return;

  clearTimeout(timer);
  const endTime = new Date();
  const takenTime = Math.floor((endTime - startTime) / 1000);
  const allotted = questionTime;
  const extra = takenTime - allotted > 0 ? takenTime - allotted : 0;

  questionsData.push({
    sessionId,
    questionNo: currentQuestion,
    timeAllotted: allotted,
    timeTaken: takenTime
  });

  currentQuestion++;
  startQuestion();
}

function endExam() {
  examStarted = false;
  document.getElementById('exam-section').style.display = 'none';
  document.getElementById('result-section').style.display = 'block';
  generateCharts();
  sendToGoogleSheets();
}

function playBeep() {
  const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
  audio.play();
}

function initVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition is not supported in this browser.");
    return;
  }

  speechRecognition = new SpeechRecognition();
  speechRecognition.continuous = true;
  speechRecognition.interimResults = false;

  speechRecognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    if (transcript.includes("next")) {
      nextQuestion();
    }
  };
  speechRecognition.start();
}

function generateCharts() {
  const ctx1 = document.getElementById('bar-chart').getContext('2d');
  const ctx2 = document.getElementById('line-chart').getContext('2d');

  const labels = questionsData.map(q => `Q${q.questionNo}`);
  const taken = questionsData.map(q => q.timeTaken);
  const allotted = questionsData.map(q => q.timeAllotted);

  new Chart(ctx1, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Time Taken (s)',
          data: taken,
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
        },
        {
          label: 'Time Allotted (s)',
          data: allotted,
          backgroundColor: 'rgba(192, 75, 192, 0.6)'
        }
      ]
    }
  });

  new Chart(ctx2, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Time Taken per Question',
          data: taken,
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false
        }
      ]
    }
  });
}

function sendToGoogleSheets() {
  const sheetURL = 'https://script.google.com/macros/s/AKfycbzPye7BT5IeS1Yd0Xa5p7bmEQogBBKKQQD1yIZzqnFkFgi-vGY1oeJtPrqTuCwaxB45/exec';
  fetch(sheetURL, {
    method: 'POST',
    body: JSON.stringify(questionsData),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(res => res.text())
    .then(data => {
      console.log('Data sent to Sheets:', data);
    })
    .catch(err => console.error('Error sending to Google Sheets:', err));
}
