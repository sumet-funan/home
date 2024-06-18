var minusObj = {
    numRows: 1,
    numRowsHistory: 1,
}

function validateMinusResult() {
    let textColor = "green"
    let symbol = "-"

    let firstNumber = +$('#firstMinusNumber').val();
    let secondNumber = +$('#secondMinusNumber').val();
    let resultNumber = +$('#resultMinusNumber').val();

    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, symbol);

    if(isCorrect.message == "zero") return;

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
    elementItem = `<div class="row mb-3">
            <p>${minusObj.numRows}) ${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</p>
                </div>`
    $('#resultMinusList').append(elementItem)

    clearMinusValue()

    minusObj.numRows++;
}

function addResultMinusToHistoryList(item) {
    elementItem = `<div class="row mb-3">
            <p style="color: ${item.color}">${minusObj.numRowsHistory}) ${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</p>
                </div>`
    $('#historyMinusList').append(elementItem)

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