// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/classes/Quiz.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Quiz = void 0;

var Quiz =
/** @class */
function () {
  function Quiz(questionsList) {
    var _this = this;

    this.questionsList = questionsList;
    this.shuffledQuestions = this.questionsList.sort(function () {
      return 0.5 - Math.random();
    });
    this.quizQuestions = [];
    this.questionsIterator = 0;
    this.questionsCount = 6;
    this.score = 0;
    this.answerClickCount = 0;
    this.timeLeft = 20;
    this.helpLeft = 1;
    this.disabledHelpOnClick = false;
    this.userResults = []; // HTML Elements

    this.quizEl = document.querySelector(".quiz");
    this.quizScoreEl = document.querySelector(".quiz-score"); // Question text element

    this.questionTextEl = document.createElement("p");
    this.questionsCountEl = document.createElement("span");
    this.questionsStopWatchEl = document.createElement("span"); // Help Elements

    this.helpRemoveQuestionsEl = document.createElement("div"); // Audio Elements

    this.audioCorrect = document.querySelector("#audio-correct");
    this.audioWrong = document.querySelector("#audio-wrong");
    this.audioCountdown = document.querySelector("#audio-countdown");

    this.getQuestionsByCategory = function (questions, category) {
      if (category.toLowerCase() !== "all") {
        var filtered = questions.filter(function (question) {
          return question.category === category.toLowerCase();
        });
        return filtered;
      }

      return questions;
    };

    this.renderStartScreen = function () {
      var startScreenInstructions = document.createElement("div");
      startScreenInstructions.classList.add("setup-instructions");
      startScreenInstructions.innerHTML = "\n      <h2>Instructions</h2>\n      <p>\n      You have <strong>20 seconds</strong> to answer each question. If you don't, you will get forwarded to the next question without getting a point.\n      </p>\n    ";
      var startScreenForm = document.createElement("form");
      startScreenForm.classList.add("setup-form");
      startScreenForm.innerHTML = "<h2>Quiz Setup</h2>";
      startScreenForm.removeAttribute("action");
      startScreenForm.removeAttribute("method");
      startScreenForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var countSelect = document.querySelector(".setup-form__count-select");
        var categorySelect = document.querySelector(".setup-form__category-select");
        var count = countSelect.options[countSelect.options.selectedIndex].value;
        _this.questionsCount = parseInt(count);
        var category = categorySelect.options[categorySelect.options.selectedIndex].value;
        _this.quizQuestions = _this.getQuestionsByCategory(_this.shuffledQuestions, category).slice(0, _this.questionsCount);

        _this.questionGenerator();
      });

      var questionsCountSelect = _this.createSelect("setup-form__count-select", "Questions count", ["5", "10"]);

      var questionsCategorySelect = _this.createSelect("setup-form__category-select", "Questions category", ["All", "Entertainment", "Geography"]);

      var playBtn = document.createElement("button");
      playBtn.classList.add("setup-form__button");
      playBtn.setAttribute("type", "submit");
      playBtn.innerText = "Play";
      startScreenForm.appendChild(questionsCountSelect);
      startScreenForm.appendChild(questionsCategorySelect);
      startScreenForm.appendChild(playBtn);

      _this.quizEl.appendChild(startScreenInstructions);

      _this.quizEl.appendChild(startScreenForm);
    };

    this.countdown = function () {
      _this.countdownInterval = setInterval(function () {
        if (_this.timeLeft == 1) {
          _this.audioWrong.play();

          clearInterval(_this.countdownInterval);
          _this.timeLeft = 21;

          _this.questionGenerator();
        }

        if (_this.timeLeft <= 11) {
          _this.questionsStopWatchEl.classList.add("question__stopwatch--danger");
        }

        var countdownSoundInterval = setInterval(function () {
          if (_this.timeLeft == 1) {
            clearInterval(countdownSoundInterval);
          }

          if (_this.timeLeft <= 10) {
            _this.audioCountdown.play();
          }
        }, 1000);
        _this.timeLeft--;
        _this.questionsStopWatchEl.innerText = "" + _this.timeLeft;
      }, 1000);
    };

    this.questionGenerator = function () {
      _this.disabledHelpOnClick = false;

      _this.questionsStopWatchEl.classList.remove("question__stopwatch--danger");

      _this.answerClickCount = 0;
      _this.currQuestion = _this.quizQuestions[_this.questionsIterator];
      _this.questionsIterator++;

      if (_this.currQuestion !== undefined) {
        _this.renderQuestion();

        _this.countdown();

        return _this.currQuestion;
      }

      _this.renderFinalScreen();
    };

    this.renderQuestion = function () {
      _this.questionTextEl.classList.add("question");

      _this.questionTextEl.innerText = _this.currQuestion.content;

      _this.questionsCountEl.classList.add("question__count");

      _this.questionsCountEl.innerText = _this.questionsIterator + " of " + _this.questionsCount;

      _this.questionsStopWatchEl.classList.add("question__stopwatch");

      _this.questionsStopWatchEl.innerText = "" + _this.timeLeft;

      _this.questionTextEl.appendChild(_this.questionsCountEl);

      _this.questionTextEl.appendChild(_this.questionsStopWatchEl); // Answers container element


      var answersEl = document.createElement("ul");
      answersEl.classList.add("answers"); // Add the answer options to the answers element

      var answerOptions = [_this.currQuestion.a, _this.currQuestion.b, _this.currQuestion.c, _this.currQuestion.d];
      answerOptions.forEach(function (option) {
        // Create and modify answer li element
        var answerEl = document.createElement("li");
        answerEl.classList.add("answer");
        answerEl.innerText = option;
        answerEl.setAttribute("answer", option);
        answerEl.addEventListener("click", function () {
          _this.answer(answerEl, answerEl.innerText);
        });
        answersEl.appendChild(answerEl);
      });
      _this.quizEl.innerHTML = "";

      _this.quizEl.appendChild(_this.questionTextEl); // Help


      _this.helpRemoveQuestionsEl.innerText = "50/50";

      _this.helpRemoveQuestionsEl.classList.add("help__button");

      _this.helpRemoveQuestionsEl.addEventListener("click", function () {
        _this.useHelpRemoveQuestions();

        if (_this.disabledHelpOnClick === false) {
          _this.helpRemoveQuestionsEl.classList.add("help__button--disabled");
        }
      });

      _this.quizEl.appendChild(_this.helpRemoveQuestionsEl);

      _this.quizEl.appendChild(answersEl);
    };

    this.answer = function (answerEl, answer) {
      _this.disabledHelpOnClick = true;

      if (_this.answerClickCount === 0) {
        clearInterval(_this.countdownInterval);
        _this.timeLeft = 20; // If answer is correct, increment score by 1, then generate next question

        if (answer === _this.currQuestion.correct) {
          _this.audioCorrect.play();

          answerEl.classList.add("success");
          _this.score++;
        } else {
          _this.audioWrong.play();

          var correctAnswer = document.querySelector("[answer=\"" + _this.currQuestion.correct + "\"]");
          answerEl.classList.add("fail");
          correctAnswer.classList.add("success");
        }

        setTimeout(function () {
          _this.questionGenerator();
        }, 2000);
        _this.answerClickCount++;
      } else {
        _this.answerClickCount++;
        return;
      }
    };

    this.renderFinalScreen = function () {
      var finalScreen = document.createElement("div");
      var userLeaderboard = document.createElement("div");
      finalScreen.classList.add("final-screen");

      if (_this.score === _this.questionsCount) {
        finalScreen.innerHTML = "\n      <h2>You are awesome!</h2>\n      <p>You got all the questions right!</p>\n      <p> You can be proud of yourself.</p>\n      <p>Score: " + _this.score + " out of " + _this.questionsCount + "</p>\n    ";
      } else if (_this.score > _this.questionsCount / 2) {
        finalScreen.innerHTML = "\n       <h2>Not Bad!</h2>\n       <p>Score: " + _this.score + " out of " + _this.questionsCount + "</p>\n      ";
      } else {
        finalScreen.innerHTML = "\n       <h2>Gotta do better!</h2>\n       <p>Score: " + _this.score + " out of " + _this.questionsCount + "</p>\n      ";
      } // Add the result to the local storage


      _this.userResults.push(_this.score);

      localStorage.setItem("userResults", JSON.stringify(_this.userResults));
      var userResultsFromLocalStorage = JSON.parse(localStorage.getItem("userResults"));
      userResultsFromLocalStorage.forEach(function (res) {
        var result = document.createElement("p");
        result.innerHTML = "\n        <p></p>\n      ";
        userLeaderboard.appendChild(result);
      });
      finalScreen.appendChild(userLeaderboard);
      _this.quizEl.innerHTML = "";

      _this.quizEl.appendChild(finalScreen);
    };

    this.createSelect = function (className, label, countOptions) {
      var selectContainerEl = document.createElement("div");
      selectContainerEl.classList.add("setup-form__group");
      var selectLabelEl = document.createElement("label");
      selectLabelEl.innerText = label;
      var selectEl = document.createElement("select");
      selectEl.setAttribute("class", className);
      countOptions.forEach(function (count) {
        var countOptionEl = document.createElement("option");
        countOptionEl.innerText = count;
        countOptionEl.setAttribute("name", count);
        selectEl.appendChild(countOptionEl);
      });
      selectContainerEl.appendChild(selectLabelEl);
      selectContainerEl.appendChild(selectEl);
      return selectContainerEl;
    };

    this.renderStartScreen();
  }

  Quiz.prototype.useHelpRemoveQuestions = function () {
    if (this.helpLeft == 0 || this.disabledHelpOnClick == true) {
      return;
    } else {
      var answerOptions = [this.currQuestion.a, this.currQuestion.b, this.currQuestion.c, this.currQuestion.d];
      var randomAnswer1 = answerOptions[Math.floor(Math.random() * answerOptions.length)];
      var randomAnswer2 = answerOptions[Math.floor(Math.random() * answerOptions.length)];

      if (randomAnswer1 === this.currQuestion.correct) {
        return this.useHelpRemoveQuestions();
      }

      var removeAnswer1 = document.querySelector("[answer=\"" + randomAnswer1 + "\"]");

      if (randomAnswer2 === this.currQuestion.correct || randomAnswer1 === randomAnswer2) {
        return this.useHelpRemoveQuestions();
      }

      var removeAnswer2 = document.querySelector("[answer=\"" + randomAnswer2 + "\"]");
      removeAnswer1.classList.add("help__answer-removed");
      removeAnswer2.classList.add("help__answer-removed");
      this.helpLeft--;
    }
  };

  return Quiz;
}();

exports.Quiz = Quiz;
},{}],"js/data/questions.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.questions = void 0;
var questions = [{
  category: "entertainment",
  content: "Who is the main actor in Shutter Island?",
  correct: "Leonardo diCaprio",
  a: "Leonardo diCaprio",
  b: "Antonio Banderas",
  c: "George Clooney",
  d: "Tom Cruise"
}, {
  category: "entertainment",
  content: "What is the name of the movie that has both Seth Rogen and James Franco as leading roles?",
  correct: "The Interview",
  a: "Now You See Me",
  b: "The Interview",
  c: "Good Boys",
  d: "Green Book"
}, {
  category: "entertainment",
  content: "What is Spider-Man's name?",
  correct: "Peter Parker",
  a: "Clark Kent",
  b: "Bruce Wayne",
  c: "John Russel",
  d: "Peter Parker"
}, {
  category: "entertainment",
  content: "What year was The Wolf Of Wall Street released in?",
  correct: "2013",
  a: "2013",
  b: "2010",
  c: "2012",
  d: "2015"
}, {
  category: "entertainment",
  content: "In which of these movies does Justin Timberlake act?",
  correct: "The Social Network",
  a: "Inception",
  b: "No Strings Attached",
  c: "What Happens In Vegas",
  d: "The Social Network"
}, {
  category: "entertainment",
  content: "Who played the Joker in The Dark Night?",
  correct: "Heath Ledger",
  a: "Jared Leto",
  b: "Heath Ledger",
  c: "John Travolta",
  d: "Tom Hardy"
}, {
  category: "entertainment",
  content: "'Crazy in Love' was the first solo No. 1 for which singer?",
  correct: "Beyonce",
  a: "Jennifer Lopez",
  b: "Beyonce",
  c: "Shakira",
  d: "Ariana Grande"
}, {
  category: "entertainment",
  content: "Which band recorded the theme song to Friends?",
  correct: "The Rembrandts",
  a: "Beatles",
  b: "The Rembrandts",
  c: "Green Day",
  d: "R.E.M."
}, {
  category: "entertainment",
  content: "What is Eminem's real name?",
  correct: "Marshall Mathers",
  a: "Mark Foley",
  b: "Marshall Mathers",
  c: "Kyle Clarkson",
  d: "Nick Darwin"
}, {
  category: "entertainment",
  content: "Which prison did Johnny Cash famously sing about in his 1955 song?",
  correct: "Folsom Prison",
  a: "Folsom Prison",
  b: "Guantanamo Bay",
  c: "San Quentin",
  d: "Alcatraz"
}, {
  category: "geography",
  content: "What is the largest country in the world?",
  correct: "Russia",
  a: "China",
  b: "Russia",
  c: "Saudi Arabia",
  d: "India"
}, {
  category: "geography",
  content: "What is the capital of Brazil?",
  correct: "Brasilia",
  a: "Rio de Janeiro",
  b: "Sao Paulo",
  c: "Brasilia",
  d: "Recife"
}, {
  category: "geography",
  content: "What is the smallest country in the world?",
  correct: "Vatican",
  a: "Andorra",
  b: "San Marino",
  c: "Luxembourg",
  d: "Vatican"
}, {
  category: "geography",
  content: "What is the deepest ocean in the world?",
  correct: "Pacific",
  a: "Antarctic",
  b: "Pacific",
  c: "Atlantic",
  d: "Indian"
}, {
  category: "geography",
  content: "What is the largest continent in the world?",
  correct: "Asia",
  a: "North America",
  b: "Asia",
  c: "Europe",
  d: "Australia"
}, {
  category: "geography",
  content: "What river flows through Paris?",
  correct: "Seine",
  a: "Seine",
  b: "Danube",
  c: "Volga",
  d: "Elbe"
}, {
  category: "geography",
  content: "Havana is the capital of what country?",
  correct: "Cuba",
  a: "Honduras",
  b: "Cuba",
  c: "Costa Rica",
  d: "Colombia"
}, {
  category: "geography",
  content: "Riyadh is the capital city of which Arab nation?",
  correct: "Saudi Arabia",
  a: "Saudi Arabia",
  b: "Oman",
  c: "Yemen",
  d: "Qatar"
}, {
  category: "geography",
  content: "What is the official language of the Canadian province Quebec?",
  correct: "French",
  a: "English",
  b: "French",
  c: "Spanish",
  d: "Italian"
}, {
  category: "geography",
  content: "What is the only major city located on two continents?",
  correct: "Istanbul",
  a: "Moscow",
  b: "Paris",
  c: "Istanbul",
  d: "Tokyo"
}, {
  category: "geography",
  content: "What is the capital city of Poland?",
  correct: "Warsaw",
  a: "Warsaw",
  b: "Poznan",
  c: "Krakow",
  d: "Gdansk"
}, {
  category: "geography",
  content: "Which Turkish city shares its name with a famous superhero?",
  correct: "Batman",
  a: "Superman",
  b: "Batman",
  c: "Wolverine",
  d: "Aquaman"
}, {
  category: "geography",
  content: "What is the biggest city in Africa by population?",
  correct: "Lagos",
  a: "Cape Town",
  b: "Freetown",
  c: "Abidjan",
  d: "Lagos"
}, {
  category: "geography",
  content: "Machu Picchu can be found in which country?",
  correct: "Peru",
  a: "Chile",
  b: "Peru",
  c: "Colombia",
  d: "Ecuador"
}, {
  category: "geography",
  content: "The Grand Canyon can be found in which US state?",
  correct: "Arizona",
  a: "Arizona",
  b: "Colorado",
  c: "California",
  d: "Nevada"
}, {
  category: "geography",
  content: "The Grand Canyon can be found in which US state?",
  correct: "Arizona",
  a: "Arizona",
  b: "Colorado",
  c: "California",
  d: "Nevada"
}];
exports.questions = questions;
},{}],"js/main.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Quiz_1 = require("./classes/Quiz");

var questions_1 = require("./data/questions");

new Quiz_1.Quiz(questions_1.questions);
},{"./classes/Quiz":"js/classes/Quiz.ts","./data/questions":"js/data/questions.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "4150" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/main.ts"], null)
//# sourceMappingURL=/main.7ebd0bc5.js.map