var minusObj = {
    numRows: 1,
    numRowsHistory: 1,
}

function validateMinusResult() {
    let textColor = "green"
    let symbol = "-"

    if (focusFirstEmptyField(['firstMinusNumber', 'secondMinusNumber', 'resultMinusNumber'])) {
        return;
    }

    let firstNumber = +$('#firstMinusNumber').val();
    let secondNumber = +$('#secondMinusNumber').val();
    let resultNumber = +$('#resultMinusNumber').val();

    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, symbol);
    showFeedback('feedbackMinus', isCorrect.status);

    if (isCorrect.status) {
        addResultMinusToItemList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber })
        $('#contentMinusResult').show();
        addSuggestMinusValue(secondNumber, resultNumber);
    }
    else {
        textColor = "red"
    }

    $('#contentMinusHistory').show();
    addResultMinusToHistoryList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber, "color": textColor })
}

function addResultMinusToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${minusObj.numRows}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#resultMinusList').append(elementItem)

    clearMinusValue()

    minusObj.numRows++;
}

function addResultMinusToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${minusObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#historyMinusList').append(elementItem)

    recordHistoryAttempt('minus', isCorrect, 'historyMinusList');

    if (item.color == "green") {
        minusObj.numRowsHistory++;
    }
}

function clearMinusValue() {
    $('#firstMinusNumber').val('');
    $('#secondMinusNumber').val('');
    $('#resultMinusNumber').val('');
}

function addSuggestMinusValue() {
    $('#firstMinusNumber').val(parseInt((Math.random() * 500) + 500));
    $('#secondMinusNumber').val(parseInt(Math.random() * 500));
}

addSuggestMinusValue();