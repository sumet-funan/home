var p1TimeObj = {
    numRows: 1,
    numRowsHistory: 1,
    hour: 3,
}

function renderClockSVG(hour) {
    let angle = (hour % 12) * 30;
    let ticks = '';

    for (let i = 0; i < 12; i++) {
        let a = i * 30;
        let rad = a * Math.PI / 180;
        let x1 = 100 + 80 * Math.sin(rad);
        let y1 = 100 - 80 * Math.cos(rad);
        let x2 = 100 + 68 * Math.sin(rad);
        let y2 = 100 - 68 * Math.cos(rad);
        ticks += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="clock-tick"/>';
    }

    return '<svg viewBox="0 0 200 200" width="200" height="200">' +
        '<circle cx="100" cy="100" r="92" class="clock-face"/>' +
        ticks +
        '<line x1="100" y1="100" x2="100" y2="45" class="clock-hand" transform="rotate(' + angle + ' 100 100)"/>' +
        '<circle cx="100" cy="100" r="7" class="clock-center"/>' +
        '</svg>';
}

function validateTimeResult() {
    if (focusFirstEmptyField(['timeAnswerNumber'])) {
        return;
    }

    let answer = +$('#timeAnswerNumber').val();
    let isCorrect = answer === p1TimeObj.hour;
    let textColor = "green";

    showFeedback('feedbackTime', isCorrect);

    let expr = `${p1TimeObj.hour} นาฬิกา`;

    if (isCorrect) {
        addResultTimeToItemList({ expr })
        $('#contentTimeResult').show();
        addSuggestTimeValue();
    }
    else {
        textColor = "red";
    }

    $('#contentTimeHistory').show();
    addResultTimeToHistoryList({ expr, color: textColor })
}

function addResultTimeToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1TimeObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultTimeList').append(elementItem)

    p1TimeObj.numRows++;
}

function addResultTimeToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1TimeObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyTimeList').append(elementItem)

    if (isCorrect) {
        p1TimeObj.numRowsHistory++;
    }
}

function addSuggestTimeValue() {
    let hour = parseInt(Math.random() * 12) + 1;

    p1TimeObj.hour = hour;

    $('#clockDisplay').html(renderClockSVG(hour));
    $('#timeAnswerNumber').val('');
}

addSuggestTimeValue();
