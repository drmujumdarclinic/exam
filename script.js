document.getElementById("examForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const examName = document.getElementById("exam-name").value.trim();
  const questionCount = parseInt(document.getElementById("question-count").value);
  const timePerQuestion = parseInt(document.getElementById("time-per-question").value);

  if (!examName || isNaN(questionCount) || isNaN(timePerQuestion)) {
    alert("Please fill all fields properly.");
    return;
  }

  // ✅ Redirect to new page with query params
  const url = `examstart.html?exam=${encodeURIComponent(examName)}&count=${questionCount}&time=${timePerQuestion}`;
  window.location.href = url;
});
