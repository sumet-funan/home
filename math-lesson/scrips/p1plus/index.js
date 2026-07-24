var p1PlusObj = {
    numRows: 1,
    numRowsHistory: 1,
}

function validateP1PlusResult() {
    let textColor = "green"
    let symbol = "+"

    let firstNumberRaw = $('#firstP1PlusNumber').val();
    let secondNumberRaw = $('#secondP1PlusNumber').val();
    let resultNumberRaw = $('#resultP1PlusNumber').val();

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
        addResultP1PlusToItemList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber })
        $('#contentP1PlusResult').show();
        addSuggestP1PlusValue();
    }
    else {
        textColor = "red"
    }

    $('#contentP1PlusHistory').show();
    addResultP1PlusToHistoryList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber, "color": textColor })
}

function addResultP1PlusToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1PlusObj.numRows}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#resultP1PlusList').append(elementItem)

    clearP1PlusValue()

    p1PlusObj.numRows++;
}

function addResultP1PlusToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1PlusObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#historyP1PlusList').append(elementItem)

    if (item.color == "green") {
        p1PlusObj.numRowsHistory++;
    }
}

function clearP1PlusValue() {
    $('#firstP1PlusNumber').val('');
    $('#secondP1PlusNumber').val('');
    $('#resultP1PlusNumber').val('');
}

function addSuggestP1PlusValue() {
    let firstNumber = parseInt(Math.random() * 91) + 10;
    let secondNumber = parseInt(Math.random() * (100 - firstNumber + 1));
    $('#firstP1PlusNumber').val(firstNumber);
    $('#secondP1PlusNumber').val(secondNumber);
}

addSuggestP1PlusValue();
