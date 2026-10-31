var p5ProportionObj = {
    numRows: 1,
    numRowsHistory: 1,
    text: '',
    expected: 0,
}

var proportionItems = [
    { item: 'ส้ม', unit: 'ผล' },
    { item: 'สมุด', unit: 'เล่ม' },
    { item: 'ดินสอ', unit: 'แท่ง' },
    { item: 'ขนมปัง', unit: 'ชิ้น' },
];

var proportionBuilders = [
    function () {
        let itemObj = pickOne(proportionItems);
        let known = randomInt(2, 9), asked = randomInt(2, 15), price = randomInt(2, 25);
        return { text: `${itemObj.item} ${known} ${itemObj.unit} ราคา ${known * price} บาท ถ้าซื้อ ${asked} ${itemObj.unit} ต้องจ่ายกี่บาท`, expected: asked * price };
    },
    function () {
        let itemObj = pickOne(proportionItems);
        let known = randomInt(2, 9), asked = randomInt(2, 15), price = randomInt(2, 25);
        return { text: `${itemObj.item} ${known} ${itemObj.unit} ราคา ${known * price} บาท มีเงิน ${asked * price} บาท ซื้อได้กี่${itemObj.unit}`, expected: asked };
    },
    function () {
        let hours = randomInt(2, 6), asked = randomInt(2, 9), speed = randomInt(4, 12) * 10;
        return { text: `รถคันหนึ่งแล่น ${hours} ชั่วโมง ได้ระยะทาง ${hours * speed} กิโลเมตร ถ้าแล่นด้วยอัตราเร็วเท่าเดิม ${asked} ชั่วโมง จะได้ระยะทางกี่กิโลเมตร`, expected: asked * speed };
    },
];

function validateProportionResult() {
    if (focusFirstEmptyField(['proportionAnswerNumber'])) {
        return;
    }

    let answer = +$('#proportionAnswerNumber').val();
    let isCorrect = answer === p5ProportionObj.expected;
    let expr = `${p5ProportionObj.text} = ${answer}`;

    showFeedback('feedbackProportion', isCorrect);

    if (isCorrect) {
        addResultProportionToItemList({ expr })
        $('#contentProportionResult').show();
        addSuggestProportionValue();
    }

    $('#contentProportionHistory').show();
    addResultProportionToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultProportionToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5ProportionObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultProportionList').append(elementItem)

    p5ProportionObj.numRows++;
}

function addResultProportionToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5ProportionObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyProportionList').append(elementItem)

    recordHistoryAttempt('p5proportion', isCorrect, 'historyProportionList');

    if (isCorrect) {
        p5ProportionObj.numRowsHistory++;
    }
}

function addSuggestProportionValue() {
    let question = pickOne(proportionBuilders)();

    p5ProportionObj.text = question.text;
    p5ProportionObj.expected = question.expected;

    $('#proportionQuestion').text(question.text);
    $('#proportionAnswerNumber').val('');
}

addSuggestProportionValue();
