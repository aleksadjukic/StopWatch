import { Question } from "../interfaces/Question";

export class Quiz {
	quizCategory: string;
	shuffledQuestions: Question[] = this.questionsList.sort(() => 0.5 - Math.random());
	quizQuestions: Question[] = [];
	questionsIterator: number = 0;
	questionsCount: number = 6;
	currQuestion: Question;
	score: number = 0;
	answerClickCount: number = 0;
	timeLeft: number = 20;
	helpLeft: number = 1;
	disabledHelpOnClick = false;
	userResults: number[] = [];

	// Intervals
	countdownInterval;

	// HTML Elements
	quizEl = document.querySelector(".quiz") as HTMLDivElement;
	quizScoreEl = document.querySelector(".quiz-score") as HTMLDivElement;

	// Question text element
	questionTextEl = document.createElement("p") as HTMLParagraphElement;
	questionsCountEl = document.createElement("span") as HTMLSpanElement;
	questionsStopWatchEl = document.createElement("span") as HTMLSpanElement;

	// Help Elements
	helpRemoveQuestionsEl = document.createElement("div") as HTMLDivElement;

	// Audio Elements
	audioCorrect = document.querySelector("#audio-correct") as HTMLAudioElement;
	audioWrong = document.querySelector("#audio-wrong") as HTMLAudioElement;
	audioCountdown = document.querySelector("#audio-countdown") as HTMLAudioElement;

	constructor(private questionsList: Question[]) {
		this.renderStartScreen();
	}

	private getQuestionsByCategory = (questions: Question[], category: string): Question[] => {
		if (category.toLowerCase() !== "all") {
			let filtered = questions.filter(question => question.category === category.toLowerCase());
			return filtered;
		}
		return questions;
	};

	private renderStartScreen = (): void => {
		let startScreenInstructions = document.createElement("div");
		startScreenInstructions.classList.add("setup-instructions");
		startScreenInstructions.innerHTML = `
      <h2>Instructions</h2>
      <p>
      You have <strong>20 seconds</strong> to answer each question. If you don't, you will get forwarded to the next question without getting a point.
      </p>
    `;

		let startScreenForm = document.createElement("form");
		startScreenForm.classList.add("setup-form");
		startScreenForm.innerHTML = "<h2>Quiz Setup</h2>";
		startScreenForm.removeAttribute("action");
		startScreenForm.removeAttribute("method");
		startScreenForm.addEventListener("submit", e => {
			e.preventDefault();
			let countSelect = document.querySelector(".setup-form__count-select") as HTMLSelectElement;
			let categorySelect = document.querySelector(".setup-form__category-select") as HTMLSelectElement;
			let count = countSelect.options[countSelect.options.selectedIndex].value;
			this.questionsCount = parseInt(count);
			let category = categorySelect.options[categorySelect.options.selectedIndex].value;
			this.quizQuestions = this.getQuestionsByCategory(this.shuffledQuestions, category).slice(0, this.questionsCount);

			this.questionGenerator();
		});

		let questionsCountSelect = this.createSelect("setup-form__count-select", "Questions count", ["5", "10"]);
		let questionsCategorySelect = this.createSelect("setup-form__category-select", "Questions category", ["All", "Entertainment", "Geography"]);

		let playBtn = document.createElement("button");
		playBtn.classList.add("setup-form__button");
		playBtn.setAttribute("type", "submit");
		playBtn.innerText = "Play";

		startScreenForm.appendChild(questionsCountSelect);
		startScreenForm.appendChild(questionsCategorySelect);

		startScreenForm.appendChild(playBtn);

		this.quizEl.appendChild(startScreenInstructions);
		this.quizEl.appendChild(startScreenForm);
	};
	countdown = () => {
		this.countdownInterval = setInterval(() => {
			if (this.timeLeft == 1) {
				this.audioWrong.play();
				clearInterval(this.countdownInterval);
				this.timeLeft = 21;
				this.questionGenerator();
			}
			if (this.timeLeft <= 11) {
				this.questionsStopWatchEl.classList.add("question__stopwatch--danger");
			}
			let countdownSoundInterval = setInterval(() => {
				if (this.timeLeft == 1) {
					clearInterval(countdownSoundInterval);
				}
				if (this.timeLeft <= 10) {
					this.audioCountdown.play();
				}
			}, 1000);
			this.timeLeft--;
			this.questionsStopWatchEl.innerText = `${this.timeLeft}`;
		}, 1000);
	};
	questionGenerator = (): Question => {
		this.disabledHelpOnClick = false;
		this.questionsStopWatchEl.classList.remove("question__stopwatch--danger");
		this.answerClickCount = 0;
		this.currQuestion = this.quizQuestions[this.questionsIterator];
		this.questionsIterator++;
		if (this.currQuestion !== undefined) {
			this.renderQuestion();
			this.countdown();
			return this.currQuestion;
		}
		this.renderFinalScreen();
	};

	private renderQuestion = (): void => {
		this.questionTextEl.classList.add("question");
		this.questionTextEl.innerText = this.currQuestion.content;
		this.questionsCountEl.classList.add("question__count");
		this.questionsCountEl.innerText = `${this.questionsIterator} of ${this.questionsCount}`;
		this.questionsStopWatchEl.classList.add("question__stopwatch");
		this.questionsStopWatchEl.innerText = `${this.timeLeft}`;

		this.questionTextEl.appendChild(this.questionsCountEl);
		this.questionTextEl.appendChild(this.questionsStopWatchEl);

		// Answers container element
		let answersEl = document.createElement("ul");
		answersEl.classList.add("answers");

		// Add the answer options to the answers element
		let answerOptions: string[] = [this.currQuestion.a, this.currQuestion.b, this.currQuestion.c, this.currQuestion.d];

		answerOptions.forEach(option => {
			// Create and modify answer li element
			let answerEl = document.createElement("li");
			answerEl.classList.add("answer");
			answerEl.innerText = option;
			answerEl.setAttribute("answer", option);

			answerEl.addEventListener("click", () => {
				this.answer(answerEl, answerEl.innerText);
			});

			answersEl.appendChild(answerEl);
		});

		this.quizEl.innerHTML = "";
		this.quizEl.appendChild(this.questionTextEl);
		// Help
		this.helpRemoveQuestionsEl.innerText = "50/50";
		this.helpRemoveQuestionsEl.classList.add("help__button");
		this.helpRemoveQuestionsEl.addEventListener("click", () => {
			this.useHelpRemoveQuestions();
			if (this.disabledHelpOnClick === false) {
				this.helpRemoveQuestionsEl.classList.add("help__button--disabled");
			}
		});
		this.quizEl.appendChild(this.helpRemoveQuestionsEl);
		this.quizEl.appendChild(answersEl);
	};

	private answer = (answerEl: HTMLElement, answer: string): void => {
		this.disabledHelpOnClick = true;
		if (this.answerClickCount === 0) {
			clearInterval(this.countdownInterval);
			this.timeLeft = 20;
			// If answer is correct, increment score by 1, then generate next question
			if (answer === this.currQuestion.correct) {
				this.audioCorrect.play();
				answerEl.classList.add("success");
				this.score++;
			} else {
				this.audioWrong.play();
				let correctAnswer = document.querySelector(`[answer="${this.currQuestion.correct}"]`);
				answerEl.classList.add("fail");
				correctAnswer.classList.add("success");
			}

			setTimeout(() => {
				this.questionGenerator();
			}, 2000);
			this.answerClickCount++;
		} else {
			this.answerClickCount++;
			return;
		}
	};
	private useHelpRemoveQuestions() {
		if (this.helpLeft == 0 || this.disabledHelpOnClick == true) {
			return;
		} else {
			let answerOptions: string[] = [this.currQuestion.a, this.currQuestion.b, this.currQuestion.c, this.currQuestion.d];
			let randomAnswer1: string = answerOptions[Math.floor(Math.random() * answerOptions.length)];
			let randomAnswer2: string = answerOptions[Math.floor(Math.random() * answerOptions.length)];

			if (randomAnswer1 === this.currQuestion.correct) {
				return this.useHelpRemoveQuestions();
			}

			let removeAnswer1 = document.querySelector(`[answer="${randomAnswer1}"]`);

			if (randomAnswer2 === this.currQuestion.correct || randomAnswer1 === randomAnswer2) {
				return this.useHelpRemoveQuestions();
			}
			let removeAnswer2 = document.querySelector(`[answer="${randomAnswer2}"]`);

			removeAnswer1.classList.add("help__answer-removed");
			removeAnswer2.classList.add("help__answer-removed");
			this.helpLeft--;
		}
	}
	private renderFinalScreen = (): void => {
		let finalScreen = document.createElement("div");
		let userLeaderboard = document.createElement("div");

		finalScreen.classList.add("final-screen");

		if (this.score === this.questionsCount) {
			finalScreen.innerHTML = `
      <h2>You are awesome!</h2>
      <p>You got all the questions right!</p>
      <p> You can be proud of yourself.</p>
      <p>Score: ${this.score} out of ${this.questionsCount}</p>
    `;
		} else if (this.score > this.questionsCount / 2) {
			finalScreen.innerHTML = `
       <h2>Not Bad!</h2>
       <p>Score: ${this.score} out of ${this.questionsCount}</p>
      `;
		} else {
			finalScreen.innerHTML = `
       <h2>Gotta do better!</h2>
       <p>Score: ${this.score} out of ${this.questionsCount}</p>
      `;
		}

		// Add the result to the local storage
		this.userResults.push(this.score);
		localStorage.setItem("userResults", JSON.stringify(this.userResults));

		let userResultsFromLocalStorage = JSON.parse(localStorage.getItem("userResults"));
		userResultsFromLocalStorage.forEach(res => {
			let result = document.createElement("p");
			result.innerHTML = `
        <p></p>
      `;
			userLeaderboard.appendChild(result);
		});

		finalScreen.appendChild(userLeaderboard);

		this.quizEl.innerHTML = "";
		this.quizEl.appendChild(finalScreen);
	};

	private createSelect = (className: string, label: string, countOptions: string[]): HTMLDivElement => {
		let selectContainerEl = document.createElement("div");
		selectContainerEl.classList.add("setup-form__group");
		let selectLabelEl = document.createElement("label");
		selectLabelEl.innerText = label;
		let selectEl = document.createElement("select");
		selectEl.setAttribute("class", className);

		countOptions.forEach(count => {
			let countOptionEl = document.createElement("option");
			countOptionEl.innerText = count;
			countOptionEl.setAttribute("name", count);
			selectEl.appendChild(countOptionEl);
		});

		selectContainerEl.appendChild(selectLabelEl);
		selectContainerEl.appendChild(selectEl);

		return selectContainerEl;
	};
}
