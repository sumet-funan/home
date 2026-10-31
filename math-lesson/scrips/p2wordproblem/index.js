var p2WordProblemObj = {
    numRows: 1,
    numRowsHistory: 1,
    expected: 0,
    text: '',
}

// Two steps each: the answer to the first sentence feeds the second.
var p2WordProblemBuilders = [
    function (name, item, unit) {
        let a = p2RandomInt(100, 500), b = p2RandomInt(10, 300), c = p2RandomInt(10, a + b);
        return { text: `${name}มี${item} ${a} ${unit} ซื้อเพิ่มอีก ${b} ${unit} แล้วแบ่งให้เพื่อน ${c} ${unit} ${name}เหลือ${item}กี่${unit}`, expected: a + b - c };
    },
    function (name, item, unit) {
        let a = p2RandomInt(200, 1000), b = p2RandomInt(10, parseInt(a / 2)), c = p2RandomInt(10, parseInt(a / 2));
        return { text: `${name}มี${item} ${a} ${unit} แบ่งให้เพื่อนคนแรก ${b} ${unit} และเพื่อนคนที่สอง ${c} ${unit} ${name}เหลือ${item}กี่${unit}`, expected: a - b - c };
    },
    function (name, item, unit) {
        let a = p2RandomInt(100, 400), b = p2RandomInt(50, 300), c = p2RandomInt(50, 300);
        return { text: `${name}เก็บ${item}วันแรกได้ ${a} ${unit} วันที่สอง ${b} ${unit} วันที่สาม ${c} ${unit} ${name}เก็บ${item}ได้ทั้งหมดกี่${unit}`, expected: a + b + c };
    },
    function (name, item, unit) {
        let boxes = p2RandomInt(2, 9), each = p2RandomInt(10, 50), extra = p2RandomInt(5, 50);
        return { text: `${name}มี${item} ${boxes} กล่อง กล่องละ ${each} ${unit} และมีอีก ${extra} ${unit} ${name}มี${item}ทั้งหมดกี่${unit}`, expected: boxes * each + extra };
    },
    function (name, item, unit) {
        let boxes = p2RandomInt(2, 9), each = p2RandomInt(10, 50), used = p2RandomInt(5, boxes * each);
        return { text: `${name}ซื้อ${item} ${boxes} กล่อง กล่องละ ${each} ${unit} แบ่งให้เพื่อนไป ${used} ${unit} ${name}เหลือ${item}กี่${unit}`, expected: boxes * each - used };
    },
    function (name, item, unit) {
        let boxes = p2RandomInt(2, 9), each = p2RandomInt(2, 9), taken = p2RandomInt(1, each);
        return { text: `${name}มี${item} ${boxes * each} ${unit} แบ่งใส่ ${boxes} กล่อง กล่องละเท่าๆ กัน แล้วหยิบออกจากกล่องหนึ่ง ${taken} ${unit} กล่องนั้นเหลือ${item}กี่${unit}`, expected: each - taken };
    },
];

function validateP2WordProblemResult() {
    if (focusFirstEmptyField(['p2WordProblemAnswerNumber'])) {
        return;
    }

    let answer = +$('#p2WordProblemAnswerNumber').val();
    let isCorrect = answer === p2WordProblemObj.expected;
    let expr = `${p2WordProblemObj.text} = ${answer}`;

    showFeedback('feedbackP2WordProblem', isCorrect);

    if (isCorrect) {
        addResultP2WordProblemToItemList({ expr })
        $('#contentP2WordProblemResult').show();
        addSuggestP2WordProblemValue();
    }

    $('#contentP2WordProblemHistory').show();
    addResultP2WordProblemToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2WordProblemToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2WordProblemObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2WordProblemList').append(elementItem)

    p2WordProblemObj.numRows++;
}

function addResultP2WordProblemToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2WordProblemObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2WordProblemList').append(elementItem)

    recordHistoryAttempt('p2wordproblem', isCorrect, 'historyP2WordProblemList');

    if (isCorrect) {
        p2WordProblemObj.numRowsHistory++;
    }
}

function addSuggestP2WordProblemValue() {
    let itemObj = p2Pick(p2WordItems);
    let question = p2Pick(p2WordProblemBuilders)(p2Pick(p2WordNames), itemObj.item, itemObj.classifier);

    p2WordProblemObj.expected = question.expected;
    p2WordProblemObj.text = question.text;

    $('#p2WordProblemText').text(question.text);
    $('#p2WordProblemAnswerNumber').val('');
}

addSuggestP2WordProblemValue();
