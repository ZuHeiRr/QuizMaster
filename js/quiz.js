/**
 * ============================================
 * QUIZ CLASS
 * ============================================
 *
 * This class manages the entire quiz game state.
 *
 * PROPERTIES TO CREATE:
 * - category (string) - The selected category ID
 * - difficulty (string) - easy, medium, or hard
 * - numberOfQuestions (number) - How many questions
 * - playerName (string) - The player's name
 * - score (number) - Current score, starts at 0
 * - questions (array) - Questions from API, starts empty
 * - currentQuestionIndex (number) - Which question we're on, starts at 0
 *
 * METHODS TO IMPLEMENT:
 * - constructor(category, difficulty, numberOfQuestions, playerName)
 * - async getQuestions() - Fetch questions from API
 * - buildApiUrl() - Create the API URL with parameters
 * - incrementScore() - Add 1 to score
 * - getCurrentQuestion() - Get the current question object
 * - nextQuestion() - Move to next question, return true/false
 * - isComplete() - Check if quiz is finished
 * - getScorePercentage() - Calculate percentage (0-100)
 * - saveHighScore() - Save to localStorage
 * - getHighScores() - Load from localStorage
 * - isHighScore() - Check if current score qualifies
 * - endQuiz() - Generate results screen HTML
 *
 */

export default class Quiz {
  // TODO: Create constructor
  // Initialize all properties mentioned above
  constructor(category, difficulty, numberOfQuestions, playerName) {
    this.category = category;
    this.difficulty = difficulty;
    this.numberOfQuestions = numberOfQuestions;
    this.playerName = playerName;
    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
  }
  // TODO: Create async getQuestions() method
  // 1. Build the API URL using buildApiUrl()
  // 2. Use fetch() to get data
  // 3. Check if response.ok, throw error if not
  // 4. Parse JSON: const data = await response.json()
  // 5. Check if data.response_code === 0 (success)
  // 6. Store data.results in this.questions
  // 7. Return this.questions

  async getQuestions() {
    try {
      const response = await fetch(this.buildApiUrl());
      console.log("API URL:", this.buildApiUrl());

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("API DATA:", data);

      if (data.response_code !== 0) {
        throw new Error("Failed to get questions.");
      }

      this.questions = data.results;

      return this.questions;
    } catch (error) {
      console.error("Failed to fetch questions:", error);

      throw error;
    }
    this.completeSound = new Audio(
      "../sound/freesound_community-wronganswer-37702.mp3",
    );
  }

  // TODO: Create buildApiUrl() method
  // Use URLSearchParams to build query string
  // Example result: "https://opentdb.com/api.php?amount=10&difficulty=easy"
  buildApiUrl() {
    const params = new URLSearchParams();

    params.append("amount", this.numberOfQuestions);
    params.append("difficulty", this.difficulty);

    if (this.category) {
      params.append("category", this.category);
    }

    return `https://opentdb.com/api.php?${params.toString()}`;
  }

  // TODO: Create incrementScore() method
  // Simply add 1 to this.score
  incrementScore() {
    this.score++;
  }

  // TODO: Create getCurrentQuestion() method
  // Return this.questions[this.currentQuestionIndex]
  // Return null if index is out of bounds
  getCurrentQuestion() {
    if (
      this.currentQuestionIndex < 0 ||
      this.currentQuestionIndex >= this.questions.length
    ) {
      return null;
    }
    return this.questions[this.currentQuestionIndex];
  }
  // TODO: Create nextQuestion() method
  // Increment currentQuestionIndex
  // Return true if there are more questions
  // Return false if quiz is complete
  nextQuestion() {
    this.currentQuestionIndex++;
    return this.currentQuestionIndex < this.questions.length;
  }
  // TODO: Create isComplete() method
  // Return true if currentQuestionIndex >= questions.length
  isComplete() {
    return this.currentQuestionIndex >= this.questions.length;
  }

  // TODO: Create getScorePercentage() method
  // Calculate: (score / numberOfQuestions) * 100
  // Round to whole number using Math.round()
  getScorePercentage() {
    return Math.round((this.score / this.numberOfQuestions) * 100);
  }

  // TODO: Create saveHighScore() method
  // 1. Get existing high scores using getHighScores()
  // 2. Create new score object: { name, score, total, percentage, difficulty, date }
  // 3. Push to array
  // 4. Sort by percentage (highest first)
  // 5. Keep only top 10
  // 6. Save to localStorage using JSON.stringify()
  saveHighScore() {
    let highScores = this.getHighScores();

    const newScore = {
      name: this.playerName,
      score: this.score,
      total: this.numberOfQuestions,
      percentage: this.getScorePercentage(),
      difficulty: this.difficulty,
      date: new Date().toLocaleDateString(),
    };

    highScores.push(newScore);

    highScores.sort((a, b) => b.percentage - a.percentage);

    highScores = highScores.slice(0, 10);

    localStorage.setItem("quizHighScores", JSON.stringify(highScores));
  }

  // TODO: Create getHighScores() method
  // 1. Get from localStorage using 'quizHighScores' key
  // 2. Parse JSON
  // 3. Return array (or empty array if nothing saved)
  // Wrap in try/catch for safety
  getHighScores() {
    try {
      const savedScores = localStorage.getItem("quizHighScores");
      if (savedScores) {
        return JSON.parse(savedScores);
      }
      return [];
    } catch (error) {
      console.error("Failed to get high scores:", error);
      return [];
    }
  }

  // TODO: Create isHighScore() method
  // Return true if:
  // - Less than 10 saved, OR
  // - Current percentage beats the lowest saved score
  isHighScore() {
    const highScores = this.getHighScores();

    const currentPercentage = this.getScorePercentage();

    if (highScores.length < 10) {
      return true;
    }

    const lowestScore = highScores[highScores.length - 1];

    return currentPercentage > lowestScore.percentage;
  }
  // TODO: Create endQuiz() method
  // 1. Calculate percentage
  // 2. Check if it's a high score
  // 3. If yes, save it (BEFORE getting high scores for display)
  // 4. Get high scores (AFTER saving)
  // 5. Return HTML string for results screen
  //    (See index.html for the HTML structure to use)
  endQuiz() {
    const percentage = this.getScorePercentage();

    const isHighScore = this.isHighScore();

    if (isHighScore) {
      this.saveHighScore();
    }

    const highScores = this.getHighScores();

    const leaderboardHTML = highScores
      .map((score, index) => {
        let rankClass = "";

        if (index === 0) {
          rankClass = "gold";
        } else if (index === 1) {
          rankClass = "silver";
        } else if (index === 2) {
          rankClass = "bronze";
        }

        return `
        <li class="leaderboard-item ${rankClass}">
          <span class="leaderboard-rank">
            #${index + 1}
          </span>

          <span class="leaderboard-name">
            ${score.name}
          </span>

          <span class="leaderboard-score">
            ${score.percentage}%
          </span>
        </li>
      `;
      })
      .join("");

    return `
    <div class="game-card results-card">
      <h2 class="results-title">
        Quiz Complete!
      </h2>

      <p class="results-score-display">
        ${this.score}/${this.numberOfQuestions}
      </p>

      <p class="results-percentage">
        ${percentage}% Accuracy
      </p>

      ${
        isHighScore
          ? `
            <div class="new-record-badge">
              <i class="fa-solid fa-star"></i>
              New High Score!
            </div>
          `
          : ""
      }

      <div class="leaderboard">
        <h4 class="leaderboard-title">
          <i class="fa-solid fa-trophy"></i>
          Leaderboard
        </h4>

        <ul class="leaderboard-list">
          ${leaderboardHTML}
        </ul>
      </div>

      <div class="action-buttons">
        <button class="btn-restart">
          <i class="fa-solid fa-rotate-right"></i>
          Play Again
        </button>
      </div>
    </div>
  `;
  }
}
