var plusObj = {
    numRows: 1,
    numRowsHistory: 1,
}

function validatePlusResult() {
    let textColor = "green"
    let symbol = "+"

    if (focusFirstEmptyField(['firstNumber', 'secondNumber', 'resultNumber'])) {
        return;
    }

    let firstNumber = +$('#firstNumber').val();
    let secondNumber = +$('#secondNumber').val();
    let resultNumber = +$('#resultNumber').val();

    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, symbol);
    showFeedback('feedbackPlus', isCorrect.status);

    if (isCorrect.status) {
        addResultToItemList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber })
        $('#contentResult').show();
        addSuggestValue(secondNumber, resultNumber);
    }
    else {
        textColor = "red"
    }

    $('#contentHistory').show();
    addResultToHistoryList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber, "color": textColor })
}

function addResultToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${plusObj.numRows}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#resultList').append(elementItem)

    clearValue()

    plusObj.numRows++;
}

function addResultToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="material-symbols-rounded">${isCorrect ? 'check_circle' : 'cancel'}</i>
            <span class="answer-index">${plusObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#historyList').append(elementItem)

    if (item.color == "green") {
        plusObj.numRowsHistory++;
    }
}

function clearValue() {
    $('#firstNumber').val('');
    $('#secondNumber').val('');
    $('#resultNumber').val('');
}

function addSuggestValue(firstNumberm, secondNumber) {
    $('#firstNumber').val(firstNumberm);
    $('#secondNumber').val(secondNumber);
}