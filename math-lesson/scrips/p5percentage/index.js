var p5PercentageObj = {
    numRows: 1,
    numRowsHistory: 1,
    expected: 0,
    format: "number",
}

function buildPercentageWordText(percent, base) {
    return `ในโรงเรียนมีนักเรียน ${base} คน เป็นนักเรียนหญิงร้อยละ ${percent} มีนักเรียนหญิงกี่คน`;
}

function validatePercentageResult() {
    if (focusFirstEmptyField(['percentageAnswerNumber'])) {
        return;
    }

    let answer = +$('#percentageAnswerNumber').val();
    let isCorrect = answer === p5PercentageObj.expected;
    let textColor = "green";

    showFeedback('feedbackPercentage', isCorrect);

    let expr = `ร้อยละ ${$('#percentageValue').text()} ของ ${$('#percentageBase').text()} = ${answer}`;

    if (isCorrect) {
        addResultPercentageToItemList({ expr })
        $('#contentPercentageResult').show();
        addSuggestPercentageValue();
    }
    else {
        textColor = "red";
    }

    $('#contentPercentageHistory').show();
    addResultPercentageToHistoryList({ expr, color: textColor })
}

function addResultPercentageToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5PercentageObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultPercentageList').append(elementItem)

    p5PercentageObj.numRows++;
}

function addResultPercentageToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5PercentageObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyPercentageList').append(elementItem)

    recordHistoryAttempt('p5percentage', isCorrect, 'historyPercentageList');

    if (isCorrect) {
        p5PercentageObj.numRowsHistory++;
    }
}

function addSuggestPercentageValue() {
    let percentOptions = [5, 10, 20, 25, 50];
    let percent = percentOptions[parseInt(Math.random() * percentOptions.length)];
    let divisor = 100 / percent;
    let multiplier = parseInt(Math.random() * 20) + 1;
    let base = divisor * multiplier;

    p5PercentageObj.expected = multiplier;

    $('#percentageValue').text(percent);
    $('#percentageBase').text(base);
    $('#percentageAnswerNumber').val('');

    if (p5PercentageObj.format === 'word') {
        $('#percentageWordText').text(buildPercentageWordText(percent, base));
    }
}

bindFormatPicker('percentageFormatPicker', 'percentageNumberDisplay', 'percentageWordText', p5PercentageObj, addSuggestPercentageValue);

addSuggestPercentageValue();
