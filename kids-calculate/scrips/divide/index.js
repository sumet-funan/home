var multiplyObj = {
    numRows: 1,
    numRowsHistory: 1,
}

function validateDivideResult() {
    let textColor = "green"
    let symbol = "/"

    let firstNumber = +$('#firstDivideNumber').val();
    let secondNumber = +$('#secondDivideNumber').val();
    let resultNumber = +$('#resultDivideNumber').val();

    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, symbol);

    if(isCorrect.message == "zero") return;

    if (isCorrect.status) {
        addResultDivideToItemList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber })
        $('#contentDivideResult').show();
        addSuggestDivideValue();
    }
    else {
        textColor = "red"
    }

    $('#contentDivideHistory').show();
    addResultDivideToHistoryList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber, "color": textColor })
}

function addResultDivideToItemList(item) {
    elementItem = `<div class="row mb-3">
            <p>${multiplyObj.numRows}) ${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</p>
                </div>`
    $('#resultDivideList').append(elementItem)

    clearDivideValue()

    multiplyObj.numRows++;
}

function addResultDivideToHistoryList(item) {
    elementItem = `<div class="row mb-3">
            <p style="color: ${item.color}">${multiplyObj.numRowsHistory}) ${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</p>
                </div>`
    $('#historyDivideList').append(elementItem)

    if (item.color == "green") {
        multiplyObj.numRowsHistory++;
    }
}

function clearDivideValue() {
    $('#firstDivideNumber').val('');
    $('#secondDivideNumber').val('');
    $('#resultDivideNumber').val('');
}

function addSuggestDivideValue() {
    // $('#firstDivideNumber').val(parseInt((Math.random() * 500) + 500));
    $('#firstDivideNumber').val(parseInt((Math.random() * 99)));
    $('#secondDivideNumber').val(parseInt((Math.random() * 9)));
}

addSuggestDivideValue()
