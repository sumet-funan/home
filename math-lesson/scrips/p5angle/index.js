var p5AngleObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: 'complementary',
    firstAngle: 35,
    expected: 55,
}

function validateAngleResult() {
    if (focusFirstEmptyField(['angleAnswerNumber'])) {
        return;
    }

    let answer = +$('#angleAnswerNumber').val();
    let isCorrect = answer === p5AngleObj.expected;
    let textColor = "green";

    showFeedback('feedbackAngle', isCorrect);

    let expr = `A = ${p5AngleObj.firstAngle}° , B = ${answer}°`;

    if (isCorrect) {
        addResultAngleToItemList({ expr })
        $('#contentAngleResult').show();
        addSuggestAngleValue();
    }
    else {
        textColor = "red";
    }

    $('#contentAngleHistory').show();
    addResultAngleToHistoryList({ expr, color: textColor })
}

function addResultAngleToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5AngleObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultAngleList').append(elementItem)

    p5AngleObj.numRows++;
}

function addResultAngleToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5AngleObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyAngleList').append(elementItem)

    recordHistoryAttempt('p5angle', isCorrect, 'historyAngleList');

    if (isCorrect) {
        p5AngleObj.numRowsHistory++;
    }
}

function addSuggestAngleValue() {
    let mode = Math.random() < 0.5 ? 'complementary' : 'supplementary';
    let total = mode === 'complementary' ? 90 : 180;
    let firstAngle = parseInt(Math.random() * (total - 1)) + 1;
    let expected = total - firstAngle;

    p5AngleObj.mode = mode;
    p5AngleObj.firstAngle = firstAngle;
    p5AngleObj.expected = expected;

    let modeLabel = mode === 'complementary'
        ? 'มุมประกอบมุมฉาก (รวมกันได้ 90 องศา)'
        : 'มุมประกอบมุมตรง (รวมกันได้ 180 องศา)';
    $('#angleQuestion').html(`มุม A มีขนาด ${firstAngle} องศา เป็น${modeLabel} กับมุม B<br>มุม B มีขนาดกี่องศา`);
    $('#angleAnswerNumber').val('');
}

addSuggestAngleValue();
