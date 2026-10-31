var p2MultiplyObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "table",
}

function validateP2MultiplyResult() {
    if (focusFirstEmptyField(['firstP2MultiplyNumber', 'secondP2MultiplyNumber', 'resultP2MultiplyNumber'])) {
        return;
    }

    let firstNumber = +$('#firstP2MultiplyNumber').val();
    let secondNumber = +$('#secondP2MultiplyNumber').val();
    let resultNumber = +$('#resultP2MultiplyNumber').val();
    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, "*").status;
    let expr = `${firstNumber} × ${secondNumber} = ${resultNumber}`;

    showFeedback('feedbackP2Multiply', isCorrect);

    if (isCorrect) {
        addResultP2MultiplyToItemList({ expr })
        $('#contentP2MultiplyResult').show();
        addSuggestP2MultiplyValue();
    }

    $('#contentP2MultiplyHistory').show();
    addResultP2MultiplyToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2MultiplyToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2MultiplyObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2MultiplyList').append(elementItem)

    p2MultiplyObj.numRows++;
}

function addResultP2MultiplyToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2MultiplyObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2MultiplyList').append(elementItem)

    recordHistoryAttempt('p2multiply', isCorrect, 'historyP2MultiplyList');

    if (isCorrect) {
        p2MultiplyObj.numRowsHistory++;
    }
}

// one number has a single digit and the other up to two, in either order
function addSuggestP2MultiplyValue() {
    let digit = randomInt(2, 9);
    let other = p2MultiplyObj.mode === 'table' ? randomInt(1, 12) : randomInt(10, 99);
    let digitFirst = Math.random() < 0.5;

    $('#firstP2MultiplyNumber').val(digitFirst ? digit : other);
    $('#secondP2MultiplyNumber').val(digitFirst ? other : digit);
    $('#resultP2MultiplyNumber').val('');
}

bindModePicker('p2MultiplyModePicker', p2MultiplyObj, addSuggestP2MultiplyValue);

addSuggestP2MultiplyValue();
