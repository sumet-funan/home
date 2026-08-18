var p1PlusObj = {
    numRows: 1,
    numRowsHistory: 1,
    format: "number",
}

var wordProblemP1PlusNames = ['แม่', 'พ่อ', 'น้อง', 'พี่', 'ฉัน', 'เพื่อน', 'ครู'];
var wordProblemP1PlusItems = [
    { item: 'ส้ม', classifier: 'ผล' },
    { item: 'แอปเปิ้ล', classifier: 'ผล' },
    { item: 'ดินสอ', classifier: 'แท่ง' },
    { item: 'ลูกอม', classifier: 'เม็ด' },
    { item: 'หนังสือ', classifier: 'เล่ม' },
    { item: 'ดอกไม้', classifier: 'ดอก' },
    { item: 'ลูกโป่ง', classifier: 'ลูก' },
];

function buildP1PlusWordText(firstNumber, secondNumber) {
    let name = wordProblemP1PlusNames[parseInt(Math.random() * wordProblemP1PlusNames.length)];
    let itemObj = wordProblemP1PlusItems[parseInt(Math.random() * wordProblemP1PlusItems.length)];
    let templates = [
        `${name}มี${itemObj.item} ${firstNumber} ${itemObj.classifier} ซื้อเพิ่มอีก ${secondNumber} ${itemObj.classifier} ${name}มี${itemObj.item}ทั้งหมดกี่${itemObj.classifier}`,
        `${name}เก็บ${itemObj.item}ได้ ${firstNumber} ${itemObj.classifier} เพื่อนให้อีก ${secondNumber} ${itemObj.classifier} ${name}มี${itemObj.item}รวมกี่${itemObj.classifier}`,
    ];
    return templates[parseInt(Math.random() * templates.length)];
}

function validateP1PlusResult() {
    let textColor = "green"
    let symbol = "+"

    if (focusFirstEmptyField(['firstP1PlusNumber', 'secondP1PlusNumber', 'resultP1PlusNumber'])) {
        return;
    }

    let firstNumber = +$('#firstP1PlusNumber').val();
    let secondNumber = +$('#secondP1PlusNumber').val();
    let resultNumber = +$('#resultP1PlusNumber').val();

    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, symbol);
    showFeedback('feedbackP1Plus', isCorrect.status);

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

    if (p1PlusObj.format === 'word') {
        $('#p1PlusWordText').text(buildP1PlusWordText(firstNumber, secondNumber));
    }
}

bindFormatPicker('p1PlusFormatPicker', 'p1PlusNumberDisplay', 'p1PlusWordText', p1PlusObj, addSuggestP1PlusValue);

addSuggestP1PlusValue();
