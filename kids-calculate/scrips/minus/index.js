var minusObj = {
    numRows: 1,
    numRowsHistory: 1,
}

function validateMinusResult() {
    let textColor = "green"
    let symbol = "-"

    let firstNumberRaw = $('#firstMinusNumber').val();
    let secondNumberRaw = $('#secondMinusNumber').val();
    let resultNumberRaw = $('#resultMinusNumber').val();

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