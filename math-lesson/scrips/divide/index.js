var divideObj = {
    numRows: 1,
    numRowsHistory: 1,
}

function validateDivideResult() {
    let textColor = "green"
    let symbol = "/"

    let firstNumberRaw = $('#firstDivideNumber').val();
    let secondNumberRaw = $('#secondDivideNumber').val();
    let resultNumberRaw = $('#resultDivideNumber').val();

    if (firstNumberRaw === '' || secondNumberRaw === '' || resultNumberRaw === '') {
        Swal.fire({
            title: 'แจ้งเตือน!',
            text: 'กรุณาใส่ตัวเลขให้ครบ',
            icon: 'info',
            confirmButtonText: 'ตกลง'
        })
        return;
    }

    let firstNumber = +firstNumberRaw;
    let secondNumber = +secondNumberRaw;
    let resultNumber = +resultNumberRaw;

    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, symbol);

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
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${divideObj.numRows}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#resultDivideList').append(elementItem)

    clearDivideValue()

    divideObj.numRows++;
}

function addResultDivideToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${divideObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#historyDivideList').append(elementItem)

    if (item.color == "green") {
        divideObj.numRowsHistory++;
    }
}

function clearDivideValue() {
    $('#firstDivideNumber').val('');
    $('#secondDivideNumber').val('');
    $('#resultDivideNumber').val('');
}

function addSuggestDivideValue() {
    let modToZero = 1;
    while (modToZero != 0) {
        let firstDivideNumber = 0;
        while (firstDivideNumber == 0) {
            firstDivideNumber = parseInt((Math.random() * 99))
        }
        $('#firstDivideNumber').val(firstDivideNumber);

        let secondDivideNumber = 0;
        while (secondDivideNumber < 3) {
            secondDivideNumber = parseInt((Math.random() * 9))
        }
        $('#secondDivideNumber').val(secondDivideNumber);

        modToZero = firstDivideNumber % secondDivideNumber;
    }
}

addSuggestDivideValue()
