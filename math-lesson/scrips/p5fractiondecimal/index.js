var p5FractionDecimalObj = {
    numRows: 1,
    numRowsHistory: 1,
    numerator: 1,
    denominator: 2,
}

// every one of these divides 10, 100 or 1,000
var fractionDecimalDenominators = [2, 4, 5, 8, 10, 20, 25, 40, 50, 100, 125, 200, 250, 500, 1000];

function validateFractionDecimalResult() {
    if (focusFirstEmptyField(['fractionDecimalAnswerNumber'])) {
        return;
    }

    let answer = +$('#fractionDecimalAnswerNumber').val();
    let isCorrect = isSameNumber(answer, p5FractionDecimalObj.numerator / p5FractionDecimalObj.denominator);
    let expr = `${p5FractionDecimalObj.numerator}/${p5FractionDecimalObj.denominator} = ${answer}`;

    showFeedback('feedbackFractionDecimal', isCorrect);

    if (isCorrect) {
        addResultFractionDecimalToItemList({ expr })
        $('#contentFractionDecimalResult').show();
        addSuggestFractionDecimalValue();
    }

    $('#contentFractionDecimalHistory').show();
    addResultFractionDecimalToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultFractionDecimalToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5FractionDecimalObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultFractionDecimalList').append(elementItem)

    p5FractionDecimalObj.numRows++;
}

function addResultFractionDecimalToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5FractionDecimalObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyFractionDecimalList').append(elementItem)

    recordHistoryAttempt('p5fractiondecimal', isCorrect, 'historyFractionDecimalList');

    if (isCorrect) {
        p5FractionDecimalObj.numRowsHistory++;
    }
}

function addSuggestFractionDecimalValue() {
    let denominator = pickOne(fractionDecimalDenominators);
    let numerator = randomInt(1, denominator - 1);

    p5FractionDecimalObj.numerator = numerator;
    p5FractionDecimalObj.denominator = denominator;

    $('#fractionDecimalNumerator').text(numerator);
    $('#fractionDecimalDenominator').text(denominator);
    $('#fractionDecimalAnswerNumber').val('');
}

addSuggestFractionDecimalValue();
