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

    $('#finalQuizInfo').text(`${indicators} ตัวชี้วัด · ${count} ข้อ · เวลาแนะนำ ${count * FINAL_QUIZ_SUGGESTED_MINUTES} นาที · ผ่านที่ร้อยละ ${FINAL_QUIZ_PASS_PERCENT}`);
    $('#finalQuizLast').text(last ? `ครั้งล่าสุด ได้ ${last.correct} จาก ${last.total} ข้อ` : '');
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
    $('#finalQuizCode').text(question.indicator.code);
    $('#finalQuizFigure').html(question.figure).toggle(!!question.figure);
    $('#finalQuizQuestion').text(question.text);
    $('#finalQuizOptions').html(options.join(''));
    $('#finalQuizMap').html(map.join(''));
    $('#finalQuizBackBtn').prop('disabled', index === 0);
    $('#finalQuizNextBtn').prop('disabled', index === total - 1);
}

function startFinalQuiz() {
    finalQuizObj.questions = buildFinalQuiz(finalQuizObj.grade, finalQuizPerIndicator());
    finalQuizObj.answers = finalQuizObj.questions.map(function () { return null; });
    finalQuizObj.index = 0;
    finalQuizObj.running = true;
    finalQuizObj.startedAt = Date.now();
    finalQuizObj.timer = setInterval(renderFinalQuizClock, 1000);

    renderFinalQuizClock();
    renderFinalQuizQuestion();
    showFinalQuizStage('running');
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
                <strong>${code}</strong>
                <span>${score.indicator.text}</span>
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

function resetFinalQuiz() {
    stopFinalQuizClock();
    renderFinalQuizSetup();
    showFinalQuizStage('setup');
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

$('#finalQuizStartBtn, #finalQuizAgainBtn').on('click', startFinalQuiz);

$('#finalQuizOptions').on('click', '.fq-option', function () {
    finalQuizObj.answers[finalQuizObj.index] = +$(this).data('option');
    renderFinalQuizQuestion();
});

$('#finalQuizBackBtn').on('click', function () {
    finalQuizObj.index--;
    renderFinalQuizQuestion();
});

$('#finalQuizNextBtn').on('click', function () {
    finalQuizObj.index++;
    renderFinalQuizQuestion();
});

$('#finalQuizMap').on('click', '.fq-map-btn', function () {
    finalQuizObj.index = +$(this).data('question');
    renderFinalQuizQuestion();
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

// switching to another lesson while the quiz is open
$(document).on('show.bs.tab', '[data-bs-toggle="list"]', function (e) {
    let leavingQuiz = e.relatedTarget && e.relatedTarget.id === 'menu_finalquiz';
    if (!leavingQuiz || !finalQuizObj.running) {
        return;
    }

    e.preventDefault();
    let targetTab = e.target;

    confirmFinalQuiz('กำลังทำแบบทดสอบอยู่ ถ้าออกตอนนี้คำตอบจะหายไป ต้องการออกจากหน้านี้หรือไม่?', 'ออกจากหน้านี้', function () {
        resetFinalQuiz();
        bootstrap.Tab.getOrCreateInstance(targetTab).show();
    });
});

window.addEventListener('beforeunload', function (e) {
    if (finalQuizObj.running) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// The grade set in the profile picks the test, until the child picks another.
supabaseClient.auth.onAuthStateChange(function (event, session) {
    let grade = session && session.user.user_metadata && session.user.user_metadata.grade;

    if (!grade || !finalQuizIndicators[grade] || finalQuizObj.gradeChosen || finalQuizObj.running) {
        return;
    }

    finalQuizObj.grade = grade;
    $('#finalQuizGradePicker .mode-btn').removeClass('active');
    $('#finalQuizGradePicker [data-grade="' + grade + '"]').addClass('active');
    renderFinalQuizSetup();
});

renderFinalQuizSetup();
