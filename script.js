// Form Validation

const form = document.querySelector(".form");
const questionField = form.querySelector(".f-f-question");
const question = questionField.querySelector("input");
const inputs = document.getElementsByClassName("input-fields");
const errors = document.getElementsByClassName("error-txt");
const numberPattern = /^[0-9]+$/;

question.addEventListener("keydown", function (e) {
  if (e.key === "e" || e.key === "-" || e.key === "+") {
    e.preventDefault();
  }
});

// set error message
const setError = function (className, msg) {
  const element = document.querySelector(`.${className}`);
  const error = document.querySelector(".error-txt");
  error.textContent = msg;
  error.classList.remove("hidden");
};

function clearInputError(input, inputField) {
  input.classList.remove("error");
  inputField.querySelector(".error-txt").classList.add("hidden");
}

// validate question input
function validQuestion() {
  if (!question.value.match(numberPattern)) {
    question.classList.add("error");
    setError(
      questionField.classList[1],
      "Please enter only numbers for questions."
    );
    return false;
  } else if (question.value > 30) {
    question.classList.add("error");
    setError(questionField.classList[1], "Maximum 30 questions allowed.");
    return false;
  }
  return true;
}

// keyup event on question input
question.onkeyup = () => {
  if (validQuestion()) clearInputError(question, questionField);
};

// *********** Section Start ***********

/////// main class
// All Screen
const screen = [...document.querySelectorAll(".screen")];
const screen1 = document.querySelector(".screen-1");
const screen2 = document.querySelector(".screen-2");
const screen3 = document.querySelector(".screen-3");

const questionNumber = document.querySelector(".questionNumber");
const totalQuestion = document.querySelector(".totalQuestion");
const totalQuestion2 = document.querySelector(".totalQuestion2");
const currentScoreEl = document.querySelector(".currentScore");
const totalScoreEl = document.querySelector(".totalScore");
const questionContainer = document.querySelector(".question");
const nextQuiz = document.querySelector(".next-quiz");
const quitQuiz = document.querySelector(".quit-quiz");

///// new class
const questionMultiple = document.querySelector(".question-multiple");
const questionBoolean = document.querySelector(".question-boolean");
const options = document.querySelector(".option");
const optionsContainer = document.querySelector(".question-options-main");
let currentQuestion = document.querySelector(".questionNumber");

// Variables to control quiz state
let quizStart = false;
let currentQ = 0;
let quizQuestions = [];
let totalQuestions = 0;
let currentScore = 0;

const makeVisible = (screen) => screen.classList.add("screen-show");

const clearScreen = () => {
  screen.forEach((s) => {
    s.classList.remove("screen-show");
  });
};

// fetch quiz questions from an API
async function getQuizQuestions(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

// form submission to start the quiz
form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (validQuestion()) {
    const amount = question.value;
    const category = document.querySelector(".category").value;
    const difficulty = document.querySelector(".level").value;
    const type = document.querySelector(".type").value;

    // API URL
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${category}&difficulty=${difficulty}&type=${type}`;

    getQuizQuestions(url)
      .then((data) => {
        if (data && data.results && data.results.length > 0) {
          quizStart = true;
          quizQuestions = data.results;
          clearScreen();
          makeVisible(screen2);
          initQuiz();
        } else {
          Toastify({
            text: "No questions found. Please try again with different options.",
            className: "error",
            style: {
              background: "red",
              padding: "1rem",
              color: "white",
              fontSize: "1.4rem",
            },
          }).showToast();
        }
      })
      .catch((error) => {
        console.error("Error fetching quiz questions:", error);
        Toastify({
          text: "Failed to fetch questions. Please try again later.",
          className: "error",
          style: {
            background: "red",
          },
        }).showToast();
      });
  }
});

function generatedNums() {
  let generatedNums = [];
  function generateRandomNum() {
    const availableNums = [0, 1, 2, 3];
    const remainingNums = availableNums.filter(
      (num) => !generatedNums.includes(num)
    );

    if (remainingNums.length === 0) {
      generatedNums = [];
    }

    const randomNum =
      remainingNums[Math.floor(Math.random() * remainingNums.length)];
    generatedNums.push(randomNum);
    return randomNum;
  }

  for (let i = 0; i < 4; i++) {
    const randomNum = generateRandomNum();
  }

  return generatedNums;
}

// create and display a question
function makeQues(index = 0) {
  currentQ = index;
  questionContainer.textContent = "";
  const data = quizQuestions[index];
  const options = [data.correct_answer, ...data.incorrect_answers];
  const numbers = generatedNums();
  currentQuestion.textContent = index + 1;
  const html = `
  <div class="question">
    <h2 class="question-title">
        <p class="questionNumber">${index + 1}</p>
        <p>)</p>&nbsp;
        ${data.question}
    </h2>
    <div class="question-options-main">
      ${
        data.type === "multiple"
          ? `
      <div class="question-multiple">  
        <button class="option">
            <p>A)</p>
            <p class="option-main">${options[numbers[0]]}</p>
        </button>
        
        <button class="option">
            <p>B)</p>
            <p class="option-main">${options[numbers[1]]}</p>
        </button>
        <button class="option">
            <p>C)</p>
            <p class="option-main">${options[numbers[2]]}</p>
        </button>
        <button class="option">
            <p>D)</p>
            <p class="option-main">${options[numbers[3]]}</p>
        </button>
      </div>
      `
          : `<div class="question-boolean">
            <button class="option">
                <p>A)</p>
                <p class="option-main">True</p>
            </button>
            <button class="option">
                <p>B)</p>
                <p class="option-main">False</p>
            </button>
          </div>`
      }
    </div>
  </div>
  `;

  questionContainer.insertAdjacentHTML("afterbegin", html);

  const questionMultiple = document.querySelector(".question-multiple");
  const questionBoolean = document.querySelector(".question-boolean");
  if (questionBoolean)
    questionBoolean.addEventListener("click", selectCurrectOption);
  if (questionMultiple)
    questionMultiple.addEventListener("click", selectCurrectOption);
  nextQuiz.disabled = true;
  nextQuiz.style.opacity = 0.5;
  nextQuiz.style.cursor = "not-allowed";
}

// handle selection of an option
function selectCurrectOption(e) {
  const target = e.target.closest(".option");
  if (!target) return;
  const currentTarget = target.children[1];
  let currentAns = quizQuestions[currentQ].correct_answer;
  currentAns = currentAns.replace("&#039", "");
  currentAns = currentAns.replace("&amp;", "&");

  if (currentTarget.textContent == currentAns) {
    currentScore++;
    currentScoreEl.textContent = currentScore;
    target.classList.add("correct");
  } else {
    target.classList.add("wrong");
    document.querySelectorAll(".option").forEach((item) => {
      if (item.children[1].textContent === currentAns) {
        item.classList.add("correct");
      }
    });
  }
  document.querySelectorAll(".option").forEach((item) => {
    item.disabled = true;
  });
  nextQuiz.disabled = false;
  nextQuiz.style.opacity = 1;
  nextQuiz.style.cursor = "pointer";
}

// initialize the quiz
function initQuiz() {
  if (quizStart) {
    totalQuestion2.textContent =
      totalQuestion.textContent =
      totalQuestions =
        quizQuestions.length;
    makeQues();
  } else {
    resetToDefaults();
  }
}

// next button
nextQuiz.addEventListener("click", function () {
  let q = +this.dataset.question;
  if (q < totalQuestions - 1) {
    this.dataset.question = ++q;
    makeQues(q);
  } else {
    totalScoreEl.textContent = currentScore;
    clearScreen();
    makeVisible(screen3);
  }
});

// quit button
quitQuiz.addEventListener("click", resetToDefaults2);
document.querySelector(".new-quiz").addEventListener("click", resetToDefaults);
function resetToDefaults2() {
  if (confirm("Are you sure you want to quit?")) {
    totalScoreEl.textContent = currentScore;
    clearScreen();
    makeVisible(screen3);
  }
}

function resetToDefaults() {
  quizStart = false;
  currentQ = 0;
  totalQuestions = 0;
  currentScore = 0;
  currentScoreEl.textContent = currentScore;
  nextQuiz.dataset.question = 0;
  question.value = "";
  document.querySelector(".category").value = "any";
  document.querySelector(".level").value = "any";
  document.querySelector(".type").value = "any";
  clearScreen();
  makeVisible(screen1);
}
