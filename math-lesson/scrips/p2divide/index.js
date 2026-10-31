var p2DivideObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "exact",
    dividend: 0,
    divisor: 0,
    quotient: 0,
    remainder: 0,
}

function validateP2DivideResult() {
    let hasRemainder = p2DivideObj.mode === 'remainder';
    let fields = hasRemainder ? ['p2DivideQuotientNumber', 'p2DivideRemainderNumber'] : ['p2DivideQuotientNumber'];

    if (focusFirstEmptyField(fields)) {
        return;
    }

    let quotient = +$('#p2DivideQuotientNumber').val();
    let remainder = hasRemainder ? +$('#p2DivideRemainderNumber').val() : 0;
    let isCorrect = quotient === p2DivideObj.quotient && remainder === p2DivideObj.remainder;
    let expr = `${p2DivideObj.dividend} ÷ ${p2DivideObj.divisor} = ${quotient}${hasRemainder ? ` เศษ ${remainder}` : ''}`;

    showFeedback('feedbackP2Divide', isCorrect);

    if (isCorrect) {
        addResultP2DivideToItemList({ expr })
        $('#contentP2DivideResult').show();
        addSuggestP2DivideValue();
        $('#p2DivideQuotientNumber').filter(':visible').first().trigger('focus');
    }

    $('#contentP2DivideHistory').show();
    addResultP2DivideToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2DivideToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2DivideObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2DivideList').append(elementItem)

    p2DivideObj.numRows++;
}

function addResultP2DivideToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2DivideObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2DivideList').append(elementItem)

    recordHistoryAttempt('p2divide', isCorrect, 'historyP2DivideList');

    if (isCorrect) {
        p2DivideObj.numRowsHistory++;
    }
}

function addSuggestP2DivideValue() {
    let hasRemainder = p2DivideObj.mode === 'remainder';
    let divisor = p2RandomInt(2, 9);
    let quotient = p2RandomInt(1, 9);
    let remainder = hasRemainder ? p2RandomInt(1, divisor - 1) : 0;

    p2DivideObj.divisor = divisor;
    p2DivideObj.quotient = quotient;
    p2DivideObj.remainder = remainder;
    p2DivideObj.dividend = divisor * quotient + remainder;

    $('#p2DivideQuestion').text(`${p2DivideObj.dividend} ÷ ${divisor}`);
    $('#p2DivideRemainderField').toggle(hasRemainder);
    $('#p2DivideQuotientNumber').val('');
    $('#p2DivideRemainderNumber').val('');
}

bindModePicker('p2DivideModePicker', p2DivideObj, addSuggestP2DivideValue);

addSuggestP2DivideValue();
