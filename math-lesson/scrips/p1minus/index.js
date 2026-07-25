var p1MinusObj = {
    numRows: 1,
    numRowsHistory: 1,
    format: "number",
}

var wordProblemP1MinusNames = ['แม่', 'พ่อ', 'น้อง', 'พี่', 'ฉัน', 'เพื่อน', 'ครู'];
var wordProblemP1MinusItems = [
    { item: 'ส้ม', classifier: 'ผล' },
    { item: 'แอปเปิ้ล', classifier: 'ผล' },
    { item: 'ดินสอ', classifier: 'แท่ง' },
    { item: 'ลูกอม', classifier: 'เม็ด' },
    { item: 'หนังสือ', classifier: 'เล่ม' },
    { item: 'ดอกไม้', classifier: 'ดอก' },
    { item: 'ลูกโป่ง', classifier: 'ลูก' },
];

function buildP1MinusWordText(firstNumber, secondNumber) {
    let name = wordProblemP1MinusNames[parseInt(Math.random() * wordProblemP1MinusNames.length)];
    let itemObj = wordProblemP1MinusItems[parseInt(Math.random() * wordProblemP1MinusItems.length)];
    let templates = [
        `${name}มี${itemObj.item} ${firstNumber} ${itemObj.classifier} ให้เพื่อนไป ${secondNumber} ${itemObj.classifier} ${name}เหลือ${itemObj.item}กี่${itemObj.classifier}`,
        `${name}มี${itemObj.item} ${firstNumber} ${itemObj.classifier} ใช้ไป ${secondNumber} ${itemObj.classifier} เหลือ${itemObj.item}กี่${itemObj.classifier}`,
    ];
    return templates[parseInt(Math.random() * templates.length)];
}

function validateP1MinusResult() {
    let textColor = "green"
    let symbol = "-"

    if (focusFirstEmptyField(['firstP1MinusNumber', 'secondP1MinusNumber', 'resultP1MinusNumber'])) {
        return;
    }

    let firstNumber = +$('#firstP1MinusNumber').val();
    let secondNumber = +$('#secondP1MinusNumber').val();
    let resultNumber = +$('#resultP1MinusNumber').val();

    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, symbol);
    showFeedback('feedbackP1Minus', isCorrect.status);

    if (isCorrect.status) {
        addResultP1MinusToItemList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber })
        $('#contentP1MinusResult').show();
        addSuggestP1MinusValue();
    }
    else {
        textColor = "red"
    }

    $('#contentP1MinusHistory').show();
    addResultP1MinusToHistoryList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber, "color": textColor })
}

function addResultP1MinusToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1MinusObj.numRows}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#resultP1MinusList').append(elementItem)

    clearP1MinusValue()

    p1MinusObj.numRows++;
}

function addResultP1MinusToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1MinusObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#historyP1MinusList').append(elementItem)

    if (item.color == "green") {
        p1MinusObj.numRowsHistory++;
    }
}

function clearP1MinusValue() {
    $('#firstP1MinusNumber').val('');
    $('#secondP1MinusNumber').val('');
    $('#resultP1MinusNumber').val('');
}

function addSuggestP1MinusValue() {
    let firstNumber = parseInt(Math.random() * 91) + 10;
    let secondNumber = parseInt(Math.random() * (firstNumber + 1));
    $('#firstP1MinusNumber').val(firstNumber);
    $('#secondP1MinusNumber').val(secondNumber);

    if (p1MinusObj.format === 'word') {
        $('#p1MinusWordText').text(buildP1MinusWordText(firstNumber, secondNumber));
    }
}

bindFormatPicker('p1MinusFormatPicker', 'p1MinusNumberDisplay', 'p1MinusWordText', p1MinusObj, addSuggestP1MinusValue);

addSuggestP1MinusValue();
