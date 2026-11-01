// A test across a whole grade: every indicator gets the same number of questions,
// nothing is marked until the end, and the result is read by indicator so that a
// child sees which lesson to go back to rather than only a score.
var finalQuizObj = {
    grade: "p1",
    length: "short",
    gradeChosen: false,
    running: false,
    questions: [],
    answers: [],
    index: 0,
    startedAt: 0,
    timer: null,
}

const FINAL_QUIZ_LETTERS = ['ก', 'ข', 'ค', 'ง'];
const FINAL_QUIZ_SUGGESTED_MINUTES = 2;
const FINAL_QUIZ_PASS_PERCENT = 50;
const FINAL_QUIZ_RESULT_KEY = 'mathLessonFinalQuizLast';
const FINAL_QUIZ_SAVE_KEY = 'mathLessonFinalQuizSaved';
const FINAL_QUIZ_LEVELS = [[80, 4], [75, 3.5], [70, 3], [65, 2.5], [60, 2], [55, 1.5], [50, 1], [0, 0]];

function finalQuizPerIndicator() {
    return finalQuizObj.length === 'short' ? 1 : 2;
}

function finalQuizOptionLabel(option) {
    return typeof option === 'string' ? option : option.label;
}

function finalQuizOptionHtml(option) {
    return typeof option === 'string' ? option : option.html;
}

// The result is kept on this device: quiz_results holds speed quiz rounds, and a
// row of another shape there would be misread as one.
function readFinalQuizResults() {
    try {
        return JSON.parse(localStorage.getItem(FINAL_QUIZ_RESULT_KEY)) || {};
    } catch (e) {
        return {};
    }
}

function saveFinalQuizResult(grade, correct, total) {
    let results = readFinalQuizResults();
    results[grade] = { correct: correct, total: total, at: new Date().toISOString() };
    try {
        localStorage.setItem(FINAL_QUIZ_RESULT_KEY, JSON.stringify(results));
    } catch (e) {
        // no storage: the result on screen is all that is lost
    }
}

// A full set takes over an hour, so a quiz has to survive being put down. Every
// answer is saved to this device, and leaving just pauses it. A tablet may be
// shared, so a saved quiz is only offered to whoever started it.
function finalQuizOwner() {
    return currentUserId || 'guest';
}

function saveFinalQuizProgress() {
    if (!finalQuizObj.running) {
        return;
    }

    try {
        localStorage.setItem(FINAL_QUIZ_SAVE_KEY, JSON.stringify({
            owner: finalQuizOwner(),
            grade: finalQuizObj.grade,
            length: finalQuizObj.length,
            index: finalQuizObj.index,
            answers: finalQuizObj.answers,
            elapsedMs: Date.now() - finalQuizObj.startedAt,
            questions: finalQuizObj.questions.map(function (question) {
                return {
                    code: question.indicator.code,
                    text: question.text,
                    figure: question.figure,
                    options: question.options,
                    correctIndex: question.correctIndex,
                };
            }),
        }));
    } catch (e) {
        // no storage: the quiz still runs, it just cannot be picked up later
    }
}

function clearSavedFinalQuiz() {
    try {
        localStorage.removeItem(FINAL_QUIZ_SAVE_KEY);
    } catch (e) {
        // nothing was saved in the first place
    }
}

function readSavedFinalQuiz() {
    let saved;

    try {
        saved = JSON.parse(localStorage.getItem(FINAL_QUIZ_SAVE_KEY));
    } catch (e) {
        return null;
    }

    if (!saved || saved.owner !== finalQuizOwner() || !finalQuizIndicators[saved.grade]) {
        return null;
    }

    // Indicators are looked up again rather than stored, since each holds a
    // function. One that no longer exists means the quiz is out of date.
    let questions = saved.questions.map(function (question) {
        let indicator = finalQuizIndicators[saved.grade].find(function (item) {
            return item.code === question.code;
        });
        return indicator ? Object.assign({}, question, { indicator: indicator }) : null;
    });

    if (questions.indexOf(null) !== -1) {
        return null;
    }

    return Object.assign({}, saved, { questions: questions });
}

function buildFinalQuizQuestion(indicator) {
    let question = indicator.build();
    let options = shuffleList([question.answer].concat(question.wrong));

    return {
        indicator: indicator,
        text: question.text,
        figure: question.figure || '',
        options: options,
        correctIndex: options.indexOf(question.answer),
    };
}

function buildFinalQuiz(grade, perIndicator) {
    let questions = [];

    finalQuizIndicators[grade].forEach(function (indicator) {
        for (let i = 0; i < perIndicator; i++) {
            questions.push(buildFinalQuizQuestion(indicator));
        }
    });

    return shuffleList(questions);
}

function renderFinalQuizSetup() {
    let indicators = finalQuizIndicators[finalQuizObj.grade].length;
    let count = indicators * finalQuizPerIndicator();
    let last = readFinalQuizResults()[finalQuizObj.grade];

    $('#finalQuizInfo').text(`${indicators} เรื่อง · ${count} ข้อ · เวลาแนะนำ ${count * FINAL_QUIZ_SUGGESTED_MINUTES} นาที · ผ่านที่ร้อยละ ${FINAL_QUIZ_PASS_PERCENT}`);
    $('#finalQuizLast').text(last ? `ครั้งล่าสุด ได้ ${last.correct} จาก ${last.total} ข้อ` : '');

    let saved = readSavedFinalQuiz();

    $('#finalQuizResume').toggle(!!saved);
    if (saved) {
        let answered = saved.answers.filter(function (answer) { return answer !== null; }).length;
        let gradeName = $('#finalQuizGradePicker [data-grade="' + saved.grade + '"]').text();
        $('#finalQuizResumeText').text(`${gradeName} ${saved.length === 'short' ? 'ชุดสั้น' : 'ชุดเต็ม'} ตอบแล้ว ${answered} จาก ${saved.questions.length} ข้อ`);
    }
}

function showFinalQuizStage(stage) {
    $('#finalQuizSetup').toggle(stage === 'setup');
    $('#finalQuizRunning').toggle(stage === 'running');
    $('#finalQuizResult').toggle(stage === 'result');
    $('body').toggleClass('fq-running', stage === 'running');
    document.getElementById('appMain').scrollTop = 0;
}

function renderFinalQuizClock() {
    let seconds = Math.floor((Date.now() - finalQuizObj.startedAt) / 1000);
    let pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    $('#finalQuizClock').text(`${Math.floor(seconds / 60)}:${pad(seconds % 60)}`);
}

function renderFinalQuizQuestion() {
    let index = finalQuizObj.index;
    let total = finalQuizObj.questions.length;
    let question = finalQuizObj.questions[index];
    let chosen = finalQuizObj.answers[index];

    let options = question.options.map(function (option, position) {
        return `<button type="button" class="fq-option${chosen === position ? ' selected' : ''}" data-option="${position}" aria-pressed="${chosen === position}">
            <span class="fq-letter">${FINAL_QUIZ_LETTERS[position]}</span>
            <span class="fq-option-text">${finalQuizOptionHtml(option)}</span>
        </button>`;
    });

    let map = finalQuizObj.questions.map(function (item, position) {
        let classes = 'fq-map-btn';
        if (finalQuizObj.answers[position] !== null) { classes += ' is-answered'; }
        if (position === index) { classes += ' is-current'; }
        return `<button type="button" class="${classes}" data-question="${position}" aria-label="ไปข้อ ${position + 1}">${position + 1}</button>`;
    });

    $('#finalQuizCount').text(`ข้อ ${index + 1} จาก ${total}`);
    $('#finalQuizProgress').css('width', (index + 1) / total * 100 + '%');
    $('#finalQuizFigure').html(question.figure).toggle(!!question.figure);
    $('#finalQuizQuestion').text(question.text);
    $('#finalQuizOptions').html(options.join(''));
    $('#finalQuizMap').html(map.join(''));
    $('#finalQuizBackBtn').prop('disabled', index === 0);
    $('#finalQuizNextBtn').prop('disabled', index === total - 1);
}

function runFinalQuiz() {
    finalQuizObj.running = true;
    finalQuizObj.timer = setInterval(renderFinalQuizClock, 1000);

    renderFinalQuizClock();
    renderFinalQuizQuestion();
    showFinalQuizStage('running');
    saveFinalQuizProgress();
}

function startFinalQuiz() {
    finalQuizObj.questions = buildFinalQuiz(finalQuizObj.grade, finalQuizPerIndicator());
    finalQuizObj.answers = finalQuizObj.questions.map(function () { return null; });
    finalQuizObj.index = 0;
    finalQuizObj.startedAt = Date.now();
    runFinalQuiz();
}

function resumeFinalQuiz() {
    let saved = readSavedFinalQuiz();

    if (!saved) {
        renderFinalQuizSetup();
        return;
    }

    finalQuizObj.grade = saved.grade;
    finalQuizObj.length = saved.length;
    finalQuizObj.questions = saved.questions;
    finalQuizObj.answers = saved.answers;
    finalQuizObj.index = saved.index;
    finalQuizObj.startedAt = Date.now() - saved.elapsedMs;
    runFinalQuiz();
}

function pauseFinalQuiz() {
    saveFinalQuizProgress();
    stopFinalQuizClock();
    renderFinalQuizSetup();
    showFinalQuizStage('setup');
}

function stopFinalQuizClock() {
    clearInterval(finalQuizObj.timer);
    finalQuizObj.running = false;
}

function finalQuizLevel(percent) {
    return FINAL_QUIZ_LEVELS.find(function (row) { return percent >= row[0]; })[1];
}

function finishFinalQuiz() {
    stopFinalQuizClock();
    clearSavedFinalQuiz();

    let questions = finalQuizObj.questions;
    let answers = finalQuizObj.answers;
    let total = questions.length;
    let correct = 0;
    let scores = {};

    questions.forEach(function (question, index) {
        let isCorrect = answers[index] === question.correctIndex;
        let code = question.indicator.code;

        if (isCorrect) {
            correct++;
        }
        scores[code] = scores[code] || { indicator: question.indicator, correct: 0, total: 0 };
        scores[code].correct += isCorrect ? 1 : 0;
        scores[code].total++;

        // A blank is not an attempt at anything; a real answer counts towards the
        // lesson it came from, the same as one given in the lesson itself.
        if (answers[index] !== null && typeof recordAttempt === 'function') {
            recordAttempt(question.indicator.lesson, isCorrect, `${question.text} → ${finalQuizOptionLabel(question.options[answers[index]])}`, null);
        }
    });

    saveFinalQuizResult(finalQuizObj.grade, correct, total);
    renderFinalQuizResult(correct, total, scores);
    showFinalQuizStage('result');
}

function renderFinalQuizResult(correct, total, scores) {
    let percent = Math.round(correct / total * 100);
    let passed = percent >= FINAL_QUIZ_PASS_PERCENT;
    let seconds = Math.floor((Date.now() - finalQuizObj.startedAt) / 1000);

    $('#finalQuizScore').text(`${correct} / ${total}`);
    $('#finalQuizVerdict')
        .text(passed ? `ผ่าน ร้อยละ ${percent}` : `ยังไม่ผ่าน ร้อยละ ${percent}`)
        .toggleClass('is-passed', passed);
    $('#finalQuizLevel').text(`เทียบระดับผลการเรียน ${finalQuizLevel(percent)} · ใช้เวลา ${Math.ceil(seconds / 60)} นาที`);

    let rows = Object.keys(scores).map(function (code) {
        let score = scores[code];
        let isFull = score.correct === score.total;
        let practice = isFull ? '' : `<button type="button" class="fq-practice" data-lesson="${score.indicator.lesson}">ไปฝึก</button>`;

        return `<div class="fq-row">
            <i class="bi ${isFull ? 'bi-check-circle-fill is-good' : 'bi-exclamation-circle-fill is-weak'}"></i>
            <div class="fq-row-text">
                <strong>${score.indicator.text}</strong>
                <span>${code}</span>
            </div>
            <span class="fq-row-score">${score.correct}/${score.total}</span>
            ${practice}
        </div>`;
    });

    $('#finalQuizIndicators').html(rows.join(''));

    let missed = finalQuizObj.questions.map(function (question, index) {
        if (finalQuizObj.answers[index] === question.correctIndex) {
            return '';
        }
        let given = finalQuizObj.answers[index];
        let answerHtml = finalQuizOptionHtml(question.options[question.correctIndex]);
        let givenHtml = given === null ? 'ไม่ได้ตอบ' : finalQuizOptionHtml(question.options[given]);

        return `<div class="fq-missed">
            ${question.figure ? `<div class="fq-figure">${question.figure}</div>` : ''}
            <p>${question.text}</p>
            <div class="fq-missed-line is-given"><span>คำตอบของเรา</span> ${givenHtml}</div>
            <div class="fq-missed-line"><span>คำตอบที่ถูก</span> ${answerHtml}</div>
        </div>`;
    }).join('');

    $('#finalQuizMissedSection').toggle(!!missed);
    $('#finalQuizMissed').html(missed);
}

function confirmFinalQuiz(message, confirmLabel, onConfirm) {
    let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('finalQuizConfirmModal'));

    $('#finalQuizConfirmMessage').text(message);
    $('#finalQuizConfirmBtn').text(confirmLabel).off('click.finalQuiz').on('click.finalQuiz', function () {
        modal.hide();
        onConfirm();
    });

    modal.show();
}

$('#finalQuizGradePicker').on('click', '.mode-btn', function () {
    $('#finalQuizGradePicker .mode-btn').removeClass('active');
    $(this).addClass('active');
    finalQuizObj.grade = $(this).data('grade');
    finalQuizObj.gradeChosen = true;
    renderFinalQuizSetup();
});

$('#finalQuizLengthPicker').on('click', '.mode-btn', function () {
    $('#finalQuizLengthPicker .mode-btn').removeClass('active');
    $(this).addClass('active');
    finalQuizObj.length = $(this).data('length');
    renderFinalQuizSetup();
});

$('#finalQuizAgainBtn').on('click', startFinalQuiz);

$('#finalQuizStartBtn').on('click', function () {
    if (readSavedFinalQuiz()) {
        confirmFinalQuiz('มีแบบทดสอบที่ยังทำไม่เสร็จ ถ้าเริ่มชุดใหม่ คำตอบเดิมจะหายไป ต้องการเริ่มใหม่หรือไม่?', 'เริ่มชุดใหม่', startFinalQuiz);
    } else {
        startFinalQuiz();
    }
});

$('#finalQuizResumeBtn').on('click', resumeFinalQuiz);

$('#finalQuizDiscardBtn').on('click', function () {
    confirmFinalQuiz('ถ้าลบแบบทดสอบนี้ คำตอบที่ทำไว้จะหายไป ต้องการลบหรือไม่?', 'ลบแบบทดสอบ', function () {
        clearSavedFinalQuiz();
        renderFinalQuizSetup();
    });
});

$('#finalQuizOptions').on('click', '.fq-option', function () {
    finalQuizObj.answers[finalQuizObj.index] = +$(this).data('option');
    renderFinalQuizQuestion();
    saveFinalQuizProgress();
});

$('#finalQuizBackBtn').on('click', function () {
    finalQuizObj.index--;
    renderFinalQuizQuestion();
    saveFinalQuizProgress();
});

$('#finalQuizNextBtn').on('click', function () {
    finalQuizObj.index++;
    renderFinalQuizQuestion();
    saveFinalQuizProgress();
});

$('#finalQuizMap').on('click', '.fq-map-btn', function () {
    finalQuizObj.index = +$(this).data('question');
    renderFinalQuizQuestion();
    saveFinalQuizProgress();
});

$('#finalQuizSubmitBtn').on('click', function () {
    let blanks = finalQuizObj.answers.filter(function (answer) { return answer === null; }).length;

    if (blanks) {
        confirmFinalQuiz(`ยังไม่ได้ตอบอีก ${blanks} ข้อ ข้อที่ไม่ได้ตอบจะถือว่าผิด ต้องการส่งคำตอบหรือไม่?`, 'ส่งคำตอบ', finishFinalQuiz);
    } else {
        finishFinalQuiz();
    }
});

$('#finalQuizIndicators').on('click', '.fq-practice', function () {
    let menu = document.getElementById(lessonMenuId($(this).data('lesson')));
    if (menu) {
        bootstrap.Tab.getOrCreateInstance(menu).show();
    }
});

// Nothing is lost by leaving, so going elsewhere just pauses the quiz.
$(document).on('show.bs.tab', '[data-bs-toggle="list"]', function (e) {
    if (e.relatedTarget && e.relatedTarget.id === 'menu_finalquiz' && finalQuizObj.running) {
        pauseFinalQuiz();
    }
});

// the last chance to save the clock before the tab goes away
window.addEventListener('pagehide', saveFinalQuizProgress);
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        saveFinalQuizProgress();
    }
});

// The grade set in the profile picks the test, until the child picks another.
supabaseClient.auth.onAuthStateChange(function (event, session) {
    let grade = session && session.user.user_metadata && session.user.user_metadata.grade;

    if (finalQuizObj.running) {
        return;
    }

    if (grade && finalQuizIndicators[grade] && !finalQuizObj.gradeChosen) {
        finalQuizObj.grade = grade;
        $('#finalQuizGradePicker .mode-btn').removeClass('active');
        $('#finalQuizGradePicker [data-grade="' + grade + '"]').addClass('active');
    }

    // whose saved quiz to offer depends on who has just signed in
    renderFinalQuizSetup();
});

renderFinalQuizSetup();
