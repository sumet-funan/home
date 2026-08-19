var speedQuizObj = {
    mode: "+",
    size: 100,
    rowHeaders: [],
    colHeaders: [],
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

function generateSpeedQuizHeaders() {
    let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let numRows = speedQuizObj.size / 10;

    if (speedQuizObj.mode === "-") {
        let bigDigits = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
        speedQuizObj.rowHeaders = shuffleSpeedQuizArray(bigDigits).slice(0, numRows);
        speedQuizObj.colHeaders = shuffleSpeedQuizArray(digits);
    } else {
        speedQuizObj.rowHeaders = shuffleSpeedQuizArray(digits).slice(0, numRows);
        speedQuizObj.colHeaders = shuffleSpeedQuizArray(digits);
    }
}

function renderSpeedQuizGrid() {
    let symbolDisplay = speedQuizObj.mode === '*' ? '×' : speedQuizObj.mode;
    let html = '<thead><tr><th class="corner-cell">' + symbolDisplay + '</th>';

    for (let c = 0; c < 10; c++) {
        html += '<th>' + speedQuizObj.colHeaders[c] + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (let r = 0; r < speedQuizObj.rowHeaders.length; r++) {
        html += '<tr><th>' + speedQuizObj.rowHeaders[r] + '</th>';
        for (let c = 0; c < 10; c++) {
            html += '<td><input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="speed-quiz-input" data-row="' + r + '" data-col="' + c + '"></td>';
        }
        html += '</tr>';
    }
    html += '</tbody>';

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
    $('#speedQuizNextBtn').hide();

    let elapsed = Date.now() - speedQuizObj.startTime;
    let correctCount = 0;

    $('.speed-quiz-input').each(function () {
        let row = +$(this).data('row');
        let col = +$(this).data('col');
        let rowVal = speedQuizObj.rowHeaders[row];
        let colVal = speedQuizObj.colHeaders[col];
        let expected;

        if (speedQuizObj.mode === '+') {
            expected = rowVal + colVal;
        } else if (speedQuizObj.mode === '-') {
            expected = rowVal - colVal;
        } else {
            expected = rowVal * colVal;
        }

        let answer = +$(this).val();
        let $cell = $(this).closest('td');

        if (answer === expected) {
            $cell.removeClass('incorrect').addClass('correct');
            correctCount++;
        } else {
            $cell.removeClass('correct').addClass('incorrect');
        }
    });

    if (typeof recordQuizResult === 'function') {
        recordQuizResult(speedQuizObj.mode, speedQuizObj.size, correctCount, elapsed);
    }

    let isNewRecord = correctCount === speedQuizObj.size && saveSpeedQuizBestTime(elapsed);
    showSpeedQuizFeedback(correctCount, elapsed, isNewRecord);
}

function startSpeedQuiz() {
    confirmSpeedQuizLeave(beginSpeedQuizRound);
}

function beginSpeedQuizRound() {
    clearInterval(speedQuizObj.timerInterval);

    generateSpeedQuizHeaders();
    renderSpeedQuizGrid();

    $('#feedbackSpeedQuiz').removeClass('show is-correct is-incorrect').text('');
    $('#speedQuizTimer').text('00:00');

    speedQuizObj.running = true;
    speedQuizObj.startTime = Date.now();
    speedQuizObj.timerInterval = setInterval(updateSpeedQuizTimerDisplay, 250);

    $('#speedQuizNextBtn').show();
    $('.speed-quiz-input[data-row="0"][data-col="0"]').trigger('focus');
}

function resetSpeedQuizForNewSelection() {
    clearInterval(speedQuizObj.timerInterval);
    speedQuizObj.running = false;
    $('#speedQuizNextBtn').hide();
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

function advanceSpeedQuizFocus(row, col) {
    let nextCol = col + 1;
    let nextRow = row;

    if (nextCol > 9) {
        nextCol = 0;
        nextRow = row + 1;
    }

    if (nextRow <= speedQuizObj.rowHeaders.length - 1) {
        $('.speed-quiz-input[data-row="' + nextRow + '"][data-col="' + nextCol + '"]').trigger('focus');
    }
}

$(document).on('input', '.speed-quiz-input', function () {
    if (!speedQuizObj.running) {
        return;
    }

    let allFilled = true;
    $('.speed-quiz-input').each(function () {
        if ($(this).val() === '') {
            allFilled = false;
        }
    });

    if (allFilled) {
        finishSpeedQuiz();
    }
});

$(document).on('keydown', '.speed-quiz-input', function (e) {
    if (e.key !== 'Enter') {
        return;
    }
    e.preventDefault();
    advanceSpeedQuizFocus(+$(this).data('row'), +$(this).data('col'));
});

// iPad's numeric keypad has no Enter key, so moving on is a button. Tapping it
// must not steal focus from the cell, or the keyboard closes between answers.
$('#speedQuizNextBtn').on('mousedown touchstart', function (e) {
    e.preventDefault();
});

$('#speedQuizNextBtn').on('click', function () {
    if (!speedQuizObj.running) {
        return;
    }

    // document.activeElement rather than jQuery's :focus — that selector also
    // requires document.hasFocus(), so it matches nothing when the window is
    // in the background and the button would jump to the wrong cell.
    let active = document.activeElement;
    let $active = active && $(active).hasClass('speed-quiz-input') ? $(active) : $();

    if (!$active.length) {
        // nothing focused (e.g. the child tapped away): resume at the first gap
        let $firstEmpty = $('.speed-quiz-input').filter(function () { return $(this).val() === ''; }).first();
        ($firstEmpty.length ? $firstEmpty : $('.speed-quiz-input').first()).trigger('focus');
        return;
    }

    advanceSpeedQuizFocus(+$active.data('row'), +$active.data('col'));
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
