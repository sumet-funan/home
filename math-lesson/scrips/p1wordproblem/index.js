var p1WordProblemObj = {
    numRows: 1,
    numRowsHistory: 1,
    expected: 0,
    text: '',
}

var wordProblemP1Names = ['แม่', 'พ่อ', 'น้อง', 'พี่', 'ฉัน', 'เพื่อน', 'ครู'];
var wordProblemP1Items = [
    { item: 'ส้ม', classifier: 'ผล' },
    { item: 'แอปเปิ้ล', classifier: 'ผล' },
    { item: 'ดินสอ', classifier: 'แท่ง' },
    { item: 'ลูกอม', classifier: 'เม็ด' },
    { item: 'หนังสือ', classifier: 'เล่ม' },
    { item: 'ดอกไม้', classifier: 'ดอก' },
    { item: 'ลูกโป่ง', classifier: 'ลูก' },
];

function validateWordProblemP1Result() {
    if (focusFirstEmptyField(['wordProblemP1AnswerNumber'])) {
        return;
    }

    let answer = +$('#wordProblemP1AnswerNumber').val();
    let isCorrect = answer === p1WordProblemObj.expected;
    let textColor = "green";

    showFeedback('feedbackWordProblemP1', isCorrect);

    let expr = `${p1WordProblemObj.text} = ${answer}`;

    if (isCorrect) {
        addResultWordProblemP1ToItemList({ expr })
        $('#contentWordProblemP1Result').show();
        addSuggestWordProblemP1Value();
    }
    else {
        textColor = "red";
    }

    $('#contentWordProblemP1History').show();
    addResultWordProblemP1ToHistoryList({ expr, color: textColor })
}

function addResultWordProblemP1ToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1WordProblemObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultWordProblemP1List').append(elementItem)

    p1WordProblemObj.numRows++;
}

function addResultWordProblemP1ToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1WordProblemObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyWordProblemP1List').append(elementItem)

    recordHistoryAttempt('p1wordproblem', isCorrect, 'historyWordProblemP1List');

    if (isCorrect) {
        p1WordProblemObj.numRowsHistory++;
    }
}

function addSuggestWordProblemP1Value() {
    let name = wordProblemP1Names[parseInt(Math.random() * wordProblemP1Names.length)];
    let itemObj = wordProblemP1Items[parseInt(Math.random() * wordProblemP1Items.length)];
    let isAddition = Math.random() < 0.5;
    let num1, num2, expected, text;

    if (isAddition) {
        num1 = parseInt(Math.random() * 50) + 5;
        num2 = parseInt(Math.random() * (100 - num1)) + 1;
        expected = num1 + num2;

        let templates = [
            `${name}มี${itemObj.item} ${num1} ${itemObj.classifier} ซื้อเพิ่มอีก ${num2} ${itemObj.classifier} ${name}มี${itemObj.item}ทั้งหมดกี่${itemObj.classifier}`,
            `${name}เก็บ${itemObj.item}ได้ ${num1} ${itemObj.classifier} เพื่อนให้อีก ${num2} ${itemObj.classifier} ${name}มี${itemObj.item}รวมกี่${itemObj.classifier}`,
        ];
        text = templates[parseInt(Math.random() * templates.length)];
    } else {
        num1 = parseInt(Math.random() * 91) + 10;
        num2 = parseInt(Math.random() * num1) + 1;
        expected = num1 - num2;

        let templates = [
            `${name}มี${itemObj.item} ${num1} ${itemObj.classifier} ให้เพื่อนไป ${num2} ${itemObj.classifier} ${name}เหลือ${itemObj.item}กี่${itemObj.classifier}`,
            `${name}มี${itemObj.item} ${num1} ${itemObj.classifier} ใช้ไป ${num2} ${itemObj.classifier} เหลือ${itemObj.item}กี่${itemObj.classifier}`,
        ];
        text = templates[parseInt(Math.random() * templates.length)];
    }

    p1WordProblemObj.expected = expected;
    p1WordProblemObj.text = text;

    $('#wordProblemP1Text').text(text);
    $('#wordProblemP1AnswerNumber').val('');
}

addSuggestWordProblemP1Value();
