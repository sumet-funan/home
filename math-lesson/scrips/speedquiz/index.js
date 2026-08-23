var speedQuizObj = {
    mode: "+",
    size: 100,
    questions: [],
    running: false,
    startTime: 0,
    timerInterval: null,
}

// Shows the "leave running quiz?" modal only if a round is in progress;
// otherwise runs the action immediately. On confirm, hides the modal then
// runs the action.
function confirmSpeedQuizLeave(onConfirm) {
    if (!speedQuizObj.running) {
        onConfirm();
        return;
    }

    let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('speedQuizLeaveModal'));

    $('#speedQuizLeaveConfirmBtn').off('click.speedQuizLeave').on('click.speedQuizLeave', function () {
        modal.hide();
        onConfirm();
    });

    modal.show();
}

function shuffleSpeedQuizArray(arr) {
    let a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        let j = parseInt(Math.random() * (i + 1));
        let temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
    return a;
}

// Every pairing of the two digit sets is built and then shuffled, rather than
// drawing random pairs. That keeps the point of the drill: across a full round
// each combination appears exactly once, so no fact is practised twice while
// another is missed.
function generateSpeedQuizQuestions() {
    let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let firsts = speedQuizObj.mode === '-'
        ? [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]   // keeps every answer >= 0
        : digits;

    let pairs = [];
    firsts.forEach(function (a) {
        digits.forEach(function (b) {
            pairs.push({ a: a, b: b });
        });
    });

    speedQuizObj.questions = shuffleSpeedQuizArray(pairs)
        .slice(0, speedQuizObj.size)
        .map(function (p) {
            let expected = speedQuizObj.mode === '+' ? p.a + p.b
                : speedQuizObj.mode === '-' ? p.a - p.b
                : p.a * p.b;
            return { a: p.a, b: p.b, expected: expected };
        });
}

function renderSpeedQuizGrid() {
    let symbol = speedQuizObj.mode === '*' ? '×' : speedQuizObj.mode;

    let html = speedQuizObj.questions.map(function (q, i) {
        return '<div class="speed-quiz-item">' +
            '<span class="sq-index">' + (i + 1) + '</span>' +
            '<span class="sq-first">' + q.a + '</span>' +
            '<span class="sq-second"><span class="sq-op">' + symbol + '</span>' + q.b + '</span>' +
            '<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" ' +
                'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
                'class="speed-quiz-input" data-index="' + i + '">' +
        '</div>';
    }).join('');

    $('#speedQuizGrid').html(html);
}

function formatSpeedQuizTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return pad(minutes) + ':' + pad(seconds);
}

function updateSpeedQuizTimerDisplay() {
    let elapsed = Date.now() - speedQuizObj.startTime;
    $('#speedQuizTimer').text(formatSpeedQuizTime(elapsed));
}

function getSpeedQuizStorageKey() {
    return 'speedQuizBestTime_' + speedQuizObj.mode + '_' + speedQuizObj.size;
}

function getLocalSpeedQuizBestTime() {
    let stored = localStorage.getItem(getSpeedQuizStorageKey());
    return stored ? +stored : null;
}

// Signed in: the account's best time follows the child across devices.
// Guest: the local best time still works exactly as before.
function loadSpeedQuizBestTime() {
    let mode = speedQuizObj.mode;
    let size = speedQuizObj.size;
    let localBest = getLocalSpeedQuizBestTime();

    $('#speedQuizBestTime').text(localBest ? formatSpeedQuizTime(localBest) : '--:--');

    if (typeof fetchBestQuizTime !== 'function') {
        return;
    }

    fetchBestQuizTime(mode, size).then(function (remoteBest) {
        // the mode/size may have changed while the request was in flight
        if (speedQuizObj.mode !== mode || speedQuizObj.size !== size) {
            return;
        }
        let best = remoteBest === null ? localBest : (localBest === null ? remoteBest : Math.min(remoteBest, localBest));
        $('#speedQuizBestTime').text(best ? formatSpeedQuizTime(best) : '--:--');
    });
}

function saveSpeedQuizBestTime(elapsedMs) {
    let key = getSpeedQuizStorageKey();
    let stored = localStorage.getItem(key);
    let isNewRecord = !stored || elapsedMs < +stored;
    if (isNewRecord) {
        localStorage.setItem(key, String(elapsedMs));
        loadSpeedQuizBestTime();
    }
    return isNewRecord;
}

function showSpeedQuizFeedback(correctCount, elapsedMs, isNewRecord) {
    let $feedback = $('#feedbackSpeedQuiz');
    let isPerfect = correctCount === speedQuizObj.size;

    $feedback.removeClass('show is-correct is-incorrect');
    void $feedback[0].offsetWidth;

    let message = isPerfect
        ? '<i class="bi bi-check-circle-fill"></i> ถูกทั้งหมด ' + speedQuizObj.size + ' ข้อ! เวลา ' + formatSpeedQuizTime(elapsedMs) + (isNewRecord ? ' (สถิติใหม่!)' : '')
        : '<i class="bi bi-x-circle-fill"></i> ถูก ' + correctCount + ' จาก ' + speedQuizObj.size + ' ข้อ ลองใหม่อีกครั้งนะ';

    $feedback
        .addClass(isPerfect ? 'is-correct' : 'is-incorrect')
        .html(message)
        .addClass('show');
}

function finishSpeedQuiz() {
    speedQuizObj.running = false;
    clearInterval(speedQuizObj.timerInterval);
    updateSpeedQuizTimerDisplay();
    $('#speedQuizSubmitBtn').hide();

    let elapsed = Date.now() - speedQuizObj.startTime;
    let correctCount = 0;

    $('.speed-quiz-input').each(function () {
        let question = speedQuizObj.questions[+$(this).data('index')];
        let raw = $(this).val().trim();
        let $item = $(this).closest('.speed-quiz-item');

        // blank counts as wrong, but must not be read as 0
        if (raw !== '' && +raw === question.expected) {
            $item.removeClass('incorrect').addClass('correct');
            correctCount++;
        } else {
            $item.removeClass('correct').addClass('incorrect');
        }
    });

    if (typeof recordQuizResult === 'function') {
        recordQuizResult(speedQuizObj.mode, speedQuizObj.size, correctCount, elapsed);
    }

    // Lock the grid once it is marked: editing a graded cell would change the
    // number while its correct/incorrect colour stayed from grading, so a cell
    // could show the right answer while still marked wrong. readonly (not
    // disabled) keeps the answers readable and selectable for reviewing.
    $('.speed-quiz-input').prop('readonly', true);

    let isNewRecord = correctCount === speedQuizObj.size && saveSpeedQuizBestTime(elapsed);
    showSpeedQuizFeedback(correctCount, elapsed, isNewRecord);
}

function startSpeedQuiz() {
    confirmSpeedQuizLeave(beginSpeedQuizRound);
}

function beginSpeedQuizRound() {
    clearInterval(speedQuizObj.timerInterval);

    generateSpeedQuizQuestions();
    renderSpeedQuizGrid();

    $('#feedbackSpeedQuiz').removeClass('show is-correct is-incorrect').text('');
    $('#speedQuizTimer').text('00:00');

    speedQuizObj.running = true;
    speedQuizObj.startTime = Date.now();
    speedQuizObj.timerInterval = setInterval(updateSpeedQuizTimerDisplay, 250);

    $('#speedQuizSubmitBtn').show();
    $('.speed-quiz-input[data-index="0"]').trigger('focus');
}

function resetSpeedQuizForNewSelection() {
    clearInterval(speedQuizObj.timerInterval);
    speedQuizObj.running = false;
    $('#speedQuizSubmitBtn').hide();
    $('#speedQuizTimer').text('00:00');
    $('#speedQuizGrid').empty();
    $('#feedbackSpeedQuiz').removeClass('show is-correct is-incorrect').text('');

    loadSpeedQuizBestTime();
}

$('#speedQuizModePicker').on('click', '.mode-btn', function () {
    let $btn = $(this);
    confirmSpeedQuizLeave(function () {
        $('#speedQuizModePicker .mode-btn').removeClass('active');
        $btn.addClass('active');
        speedQuizObj.mode = $btn.data('mode');

        resetSpeedQuizForNewSelection();
    });
});

$('#speedQuizSizePicker').on('click', '.mode-btn', function () {
    let $btn = $(this);
    confirmSpeedQuizLeave(function () {
        $('#speedQuizSizePicker .mode-btn').removeClass('active');
        $btn.addClass('active');
        speedQuizObj.size = +$btn.data('size');

        resetSpeedQuizForNewSelection();
    });
});

function advanceSpeedQuizFocus(index) {
    $('.speed-quiz-input[data-index="' + (index + 1) + '"]').trigger('focus');
}

$(document).on('keydown', '.speed-quiz-input', function (e) {
    if (e.key !== 'Enter') {
        return;
    }
    e.preventDefault();
    advanceSpeedQuizFocus(+$(this).data('index'));
});

function countEmptySpeedQuizCells() {
    return $('.speed-quiz-input').filter(function () { return $(this).val().trim() === ''; }).length;
}

// The grid is graded only when the child says they are done, so they get a
// chance to look back over their answers first. Submitting with blanks asks
// first, since those count as wrong and the round cannot be reopened.
$('#speedQuizSubmitBtn').on('click', function () {
    if (!speedQuizObj.running) {
        return;
    }

    let empty = countEmptySpeedQuizCells();
    if (!empty) {
        finishSpeedQuiz();
        return;
    }

    $('#speedQuizSubmitEmptyCount').text(empty);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('speedQuizSubmitModal')).show();
});

// Grade only once the modal has fully closed. Doing it inline with hide()
// leaves the dialog stuck open: finishSpeedQuiz hides the submit button, which
// is the element Bootstrap returns focus to, and that interrupts its close.
$('#speedQuizSubmitConfirmBtn').on('click', function () {
    let el = document.getElementById('speedQuizSubmitModal');

    $(el).one('hidden.bs.modal', function () {
        if (speedQuizObj.running) {
            finishSpeedQuiz();
        }
    });

    bootstrap.Modal.getInstance(el).hide();
});

$(document).on('focus', '.speed-quiz-input', function () {
    $(this).trigger('select');
});

// switching to another lesson tab while a round is in progress
$(document).on('show.bs.tab', '[data-bs-toggle="list"]', function (e) {
    let leavingSpeedQuiz = e.relatedTarget && e.relatedTarget.id === 'menu_speedquiz';
    if (!leavingSpeedQuiz || !speedQuizObj.running) {
        return;
    }

    e.preventDefault();
    let targetTab = e.target;

    confirmSpeedQuizLeave(function () {
        speedQuizObj.running = false;
        clearInterval(speedQuizObj.timerInterval);
        bootstrap.Tab.getOrCreateInstance(targetTab).show();
    });
});

// closing the tab / refreshing / navigating away entirely
window.addEventListener('beforeunload', function (e) {
    if (speedQuizObj.running) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// signing in or out changes whose best time applies
supabaseClient.auth.onAuthStateChange(function () {
    loadSpeedQuizBestTime();
});

loadSpeedQuizBestTime();
