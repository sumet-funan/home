var multiplyObj = {
    numRows: 1,
    numRowsHistory: 1,
}

function validateMultiplyResult() {
    let textColor = "green"
    let symbol = "*"

    let firstNumber = +$('#firstMultiplyNumber').val();
    let secondNumber = +$('#secondMultiplyNumber').val();
    let resultNumber = +$('#resultMultiplyNumber').val();

    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, symbol);

    if(isCorrect.message == "zero") return;

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
    elementItem = `<div class="row mb-3">
            <p>${multiplyObj.numRows}) ${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</p>
                </div>`
    $('#resultMultiplyList').append(elementItem)

    clearMultiplyValue()

    multiplyObj.numRows++;
}

function addResultMultiplyToHistoryList(item) {
    elementItem = `<div class="row mb-3">
            <p style="color: ${item.color}">${multiplyObj.numRowsHistory}) ${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</p>
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
