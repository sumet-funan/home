var p1CompareObj = {
    numRows: 1,
    numRowsHistory: 1,
    firstNumber: 0,
    secondNumber: 0,
    selectedSymbol: null,
}

$(document).on('click', '#compareSymbolPicker .symbol-btn', function () {
    $('#compareSymbolPicker .symbol-btn').removeClass('selected');
    $(this).addClass('selected');
    p1CompareObj.selectedSymbol = $(this).data('symbol');
});

function validateCompareResult() {
    if (!p1CompareObj.selectedSymbol) {
        Swal.fire({
            title: 'แจ้งเตือน!',
            text: 'กรุณาเลือกเครื่องหมาย',
            icon: 'info',
            confirmButtonText: 'ตกลง'
        })
        return;
    }

    let firstNumber = p1CompareObj.firstNumber;
    let secondNumber = p1CompareObj.secondNumber;
    let actual = firstNumber > secondNumber ? 'gt' : (firstNumber < secondNumber ? 'lt' : 'eq');
    let symbolText = { gt: '>', lt: '<', eq: '=' }[actual];
    let isCorrect = p1CompareObj.selectedSymbol === actual;
    let textColor = "green";

    if (isCorrect) {
        Swal.fire({
            icon: "success",
            title: "ถูกต้อง!",
            showConfirmButton: false,
            timer: 1500
        });
        addResultCompareToItemList({ firstNumber, secondNumber, symbol: symbolText })
        $('#contentCompareResult').show();
    }
    else {
        Swal.fire({
            title: 'ยังไม่ถูก!',
            text: 'ลองดูอีกครั้งนะ',
            icon: 'error',
            confirmButtonText: 'ตกลง'
        })
        textColor = "red";
    }

    $('#contentCompareHistory').show();
    addResultCompareToHistoryList({ firstNumber, secondNumber, symbol: symbolText, color: textColor })

    if (isCorrect) {
        addSuggestCompareValue();
    }
}

function addResultCompareToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1CompareObj.numRows}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber}</span>
        </div>`
    $('#resultCompareList').append(elementItem)

    p1CompareObj.numRows++;
}

function addResultCompareToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1CompareObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber}</span>
        </div>`
    $('#historyCompareList').append(elementItem)

    if (isCorrect) {
        p1CompareObj.numRowsHistory++;
    }
}

function addSuggestCompareValue() {
    let firstNumber = parseInt(Math.random() * 101);
    let secondNumber = Math.random() < 0.2 ? firstNumber : parseInt(Math.random() * 101);

    p1CompareObj.firstNumber = firstNumber;
    p1CompareObj.secondNumber = secondNumber;
    p1CompareObj.selectedSymbol = null;

    $('#compareSymbolPicker .symbol-btn').removeClass('selected');
    $('#firstCompareNumber').text(firstNumber);
    $('#secondCompareNumber').text(secondNumber);
}

addSuggestCompareValue();
