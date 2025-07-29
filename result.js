document.addEventListener("DOMContentLoaded", function () {
  const sessionId = localStorage.getItem("sessionId") || "Unknown Session";
  const totalQuestions = localStorage.getItem("totalQuestions") || 0;
  const totalTime = localStorage.getItem("totalTime") || 0;
  const timePerQuestion = JSON.parse(localStorage.getItem("timePerQuestion")) || [];

  const summaryHTML = `
    <p><strong>Exam Name / Session ID:</strong> ${sessionId}</p>
    <p><strong>Total Questions:</strong> ${totalQuestions}</p>
    <p><strong>Total Time:</strong> ${totalTime} minutes</p>
  `;
  document.getElementById("summary").innerHTML = summaryHTML;

  const labels = timePerQuestion.map((_, i) => `Q${i + 1}`);
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Time per Question (seconds)",
        data: timePerQuestion,
        backgroundColor: "#007bff",
        borderColor: "#0056b3",
        borderWidth: 1,
      },
    ],
  };

  // Bar Chart
  new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Time Spent per Question" },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Seconds" } },
      },
    },
  });

  // Line Chart
  new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: "Performance Trend" },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Seconds" } },
      },
    },
  });

  // ✅ Optional: Send to Google Sheets
  sendToGoogleSheets(sessionId, totalQuestions, totalTime, timePerQuestion);
});

function sendToGoogleSheets(sessionId, totalQuestions, totalTime, timePerQuestion) {
  const sheetURL = "https://script.google.com/macros/s/AKfycbzPye7BT5IeS1Yd0Xa5p7bmEQogBBKKQQD1yIZzqnFkFgi-vGY1oeJtPrqTuCwaxB45/exec"; // ⛳ Replace with your own Apps Script URL

  fetch(sheetURL, {
    method: "POST",
    body: JSON.stringify({
      sessionId,
      totalQuestions,
      totalTime,
      timePerQuestion,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((data) => console.log("Saved to Google Sheets:", data))
    .catch((err) => console.error("Error saving to Google Sheets:", err));
}
