import Quiz from "./quiz.js";
import Question from "./question.js";

/**
 * ============================================
 * MAIN ENTRY POINT (index.js)
 * ============================================
 *
 * This file is the starting point of your application.
 * It handles:
 * - Getting DOM elements
 * - Form validation
 * - Starting the quiz
 * - Loading/error states
 *
 * DOM ELEMENTS TO GET:
 * - quizOptionsForm: #quizOptions
 * - playerNameInput: #playerName
 * - categoryInput: #categoryMenu
 * - difficultyOptions: #difficultyOptions
 * - questionsNumber: #questionsNumber
 * - startQuizBtn: #startQuiz
 * - questionsContainer: .questions-container
 *
 * FUNCTIONS TO IMPLEMENT:
 * - showLoading() - Display loading spinner
 * - hideLoading() - Remove loading spinner
 * - showError(message) - Display error card
 * - validateForm() - Check if form is valid
 * - showFormError(message) - Show error on form
 * - resetToStart() - Reset to initial state
 * - startQuiz() - Main function to start quiz
 */

// ============================================
// TODO: Get DOM Element References
// ============================================
// Use document.getElementById() and document.querySelector()
const quizOptionsForm = document.getElementById("quizOptions");
const playerNameInput = document.getElementById("playerName");
const categoryInput = document.getElementById("categoryMenu");
const difficultyOptions = document.getElementById("difficultyOptions");
const questionsNumber = document.getElementById("questionsNumber");
const startQuizBtn = document.getElementById("startQuiz");
const questionsContainer = document.querySelector(".questions-container");

// ============================================
// TODO: Create variable to store current quiz
// ============================================
let currentQuiz = null;

// ============================================
// TODO: Create showLoading() function
// ============================================
// Set questionsContainer.innerHTML to loading HTML
// See index.html for the HTML structure

function showLoading() {
  questionsContainer.innerHTML = ` <div class="loading-overlay"> <div class="loading-spinner"></div> <p class="loading-text">Loading Questions...</p> </div> `;
}

// ============================================
// TODO: Create hideLoading() function
// ============================================
// Find and remove the loading overlay

function hideLoading() {
  const loading = questionsContainer.querySelector(".loading-overlay");
  if (loading) {
    loading.remove();
  }
}

// ============================================
// TODO: Create showError(message) function
// ============================================
// Set questionsContainer.innerHTML to error HTML
// Include the message parameter in the display
// Add click listener to retry button that calls resetToStart()
function showError(message) {
  questionsContainer.innerHTML = `
    <div class="game-card error-card">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>

      <h3 class="error-title">
        Oops! Something went wrong
      </h3>

      <p class="error-message">
        ${message}
      </p>

      <button class="btn-play retry-btn">
        <i class="fa-solid fa-rotate-right"></i>
        Try Again
      </button>
    </div>
  `;

  const retryBtn = questionsContainer.querySelector(".retry-btn");

  retryBtn.addEventListener("click", resetToStart);
}
// ============================================
// TODO: Create validateForm() function
// ============================================
// Return object: { isValid: boolean, error: string | null }
// Check:
// 1. questionsNumber has a value
// 2. Value is >= 1 (minimum questions)
// 3. Value is <= 50 (maximum questions)
function validateForm() {
  const number = Number(questionsNumber.value);
  if (!questionsNumber.value) {
    return { isValid: false, error: "Please enter the number of questions." };
  }
  if (number < 1) {
    return { isValid: false, error: "Number of questions must be at least 1." };
  }
  if (number > 50) {
    return { isValid: false, error: "Number of questions cannot exceed 50." };
  }
  return { isValid: true, error: null };
}

// ============================================
// TODO: Create showFormError(message) function
// ============================================
// Create error div with class 'form-error'
// Insert before the start button
// Remove after 3 seconds with fade effect
function showFormError(message) {
  const oldError = quizOptionsForm.querySelector(".form-error");
  if (oldError) {
    oldError.remove();
  }
  const errorDiv = document.createElement("div");
  errorDiv.className = "form-error";
  errorDiv.innerHTML = ` <i class="fa-solid fa-circle-exclamation"></i> ${message} `;
  startQuizBtn.before(errorDiv);
  setTimeout(() => {
    errorDiv.classList.add("fade-out");
    setTimeout(() => {
      errorDiv.remove();
    }, 300);
  }, 3000);
}

// ============================================
// TODO: Create resetToStart() function
// ============================================
// 1. Clear questionsContainer
// 2. Reset form values
// 3. Show the form (remove 'hidden' class)
// 4. Set currentQuiz = null
function resetToStart() {
  questionsContainer.innerHTML = "";
  quizOptionsForm.reset();
  quizOptionsForm.classList.remove("hidden");
  currentQuiz = null;
}

// ============================================
// TODO: Create async startQuiz() function
// ============================================
// This is the main function, called when Start button is clicked
//
// Steps:
// 1. Validate the form
// 2. If not valid, show error and return
// 3. Get form values:
//    - playerName (use 'Player' if empty)
//    - category
//    - difficulty
//    - numberOfQuestions
// 4. Create new Quiz instance
// 5. Hide the form (add 'hidden' class)
// 6. Show loading spinner
// 7. Try to fetch questions:
//    - await currentQuiz.getQuestions()
//    - Hide loading
//    - Check if questions exist
//    - Create first Question and display it
// 8. Catch any errors:
//    - Hide loading
//    - Show error message

async function startQuiz() {
  const validation = validateForm();

  if (!validation.isValid) {
    showFormError(validation.error);
    return;
  }

  const playerName = playerNameInput.value.trim() || "Player";
  const category = categoryInput.value;
  const difficulty = difficultyOptions.value;
  const numberOfQuestions = Number(questionsNumber.value);

  currentQuiz = new Quiz(category, difficulty, numberOfQuestions, playerName);

  quizOptionsForm.classList.add("hidden");

  showLoading();

  try {
    await currentQuiz.getQuestions();

    hideLoading();

    if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
      throw new Error("No questions found.");
    }

    const question = new Question(
      currentQuiz,
      questionsContainer,
      resetToStart,
    );

    question.displayQuestion();
  } catch (error) {
    hideLoading();

    showError(error.message || "Failed to load questions.");
  }
}

// ============================================
// TODO: Add Event Listeners
// ============================================
// 1. startQuizBtn click -> call startQuiz()
// 2. questionsNumber keydown -> if Enter, call startQuiz()
startQuizBtn.addEventListener("click", startQuiz);
questionsNumber.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    startQuiz();
  }
});

// async function ss() {
//   let res = await fetch(
//     "https://opentdb.com/api.php?amount=10&category=25&difficulty=easy",
//   );
//   console.log(await res.json());
// }
// ss();
