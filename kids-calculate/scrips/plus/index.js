var plusObj = {
    numRows: 1,
    numRowsHistory: 1,
}

function validatePlusResult() {
    let textColor = "green"
    let symbol = "+"

    let firstNumber = +$('#firstNumber').val();
    let secondNumber = +$('#secondNumber').val();
    let resultNumber = +$('#resultNumber').val();

    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, symbol);

    if(isCorrect.message == "zero") return;

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
    elementItem = `<div class="row mb-3">
            <p>${plusObj.numRows}) ${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</p>
                </div>`
    $('#resultList').append(elementItem)

    clearValue()

    plusObj.numRows++;
}

function addResultToHistoryList(item) {
    elementItem = `<div class="row mb-3">
            <p style="color: ${item.color}">${plusObj.numRowsHistory}) ${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</p>
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