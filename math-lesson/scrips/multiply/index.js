var multiplyObj = {
    numRows: 1,
    numRowsHistory: 1,
}

function validateMultiplyResult() {
    let textColor = "green"
    let symbol = "*"

    if (focusFirstEmptyField(['firstMultiplyNumber', 'secondMultiplyNumber', 'resultMultiplyNumber'])) {
        return;
    }

    let firstNumber = +$('#firstMultiplyNumber').val();
    let secondNumber = +$('#secondMultiplyNumber').val();
    let resultNumber = +$('#resultMultiplyNumber').val();

    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, symbol);
    showFeedback('feedbackMultiply', isCorrect.status);

    if (isCorrect.status) {
        addResultMultiplyToItemList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber })
        $('#contentMultiplyResult').show();
        addSuggestMultiplyValue();
    }
    else {
        textColor = "red"
    }

    $('#contentMultiplyHistory').show();
    addResultMultiplyToHistoryList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber, "color": textColor })
}

function addResultMultiplyToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${multiplyObj.numRows}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#resultMultiplyList').append(elementItem)

    clearMultiplyValue()

    multiplyObj.numRows++;
}

function addResultMultiplyToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${multiplyObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#historyMultiplyList').append(elementItem)

    if (item.color == "green") {
        multiplyObj.numRowsHistory++;
    }
}

function clearMultiplyValue() {
    $('#firstMultiplyNumber').val('');
    $('#secondMultiplyNumber').val('');
    $('#resultMultiplyNumber').val('');
}

function addSuggestMultiplyValue() {
    // $('#firstMultiplyNumber').val(parseInt((Math.random() * 500) + 500));
    $('#firstMultiplyNumber').val(parseInt((Math.random() * 99)));
    $('#secondMultiplyNumber').val(parseInt((Math.random() * 99)));
}

addSuggestMultiplyValue()
