var p5QuadAreaObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "perimeter",
    text: '',
    expected: 0,
}

var quadAreaBuilders = {
    perimeter: [
        function () {
            let first = randomInt(5, 20), second = randomInt(5, 20);
            return { type: 'parallelogram', text: `สี่เหลี่ยมด้านขนาน มีด้านยาว ${first} ซม. และ ${second} ซม.`, expected: 2 * (first + second) };
        },
        function () {
            let side = randomInt(4, 25);
            return { type: 'rhombus', text: `สี่เหลี่ยมขนมเปียกปูน มีด้านยาวด้านละ ${side} ซม.`, expected: 4 * side };
        },
        function () {
            let first = randomInt(5, 15), second = randomInt(5, 15);
            return { type: 'kite', text: `สี่เหลี่ยมรูปว่าว มีด้านสั้น 2 ด้าน ยาวด้านละ ${first} ซม. และด้านยาว 2 ด้าน ยาวด้านละ ${first + second} ซม.`, expected: 2 * (first + first + second) };
        },
        function () {
            // the slanted sides have to reach across the difference between the parallel ones
            let top = randomInt(5, 12), bottom = top + randomInt(3, 10), left = randomInt(7, 15), right = left + randomInt(-2, 2);
            return { type: 'trapezoid', text: `สี่เหลี่ยมคางหมู มีด้านยาว ${top} ซม., ${bottom} ซม., ${left} ซม. และ ${right} ซม.`, expected: top + bottom + left + right };
        },
    ],
    area: [
        function () {
            let base = randomInt(4, 20), height = randomInt(3, 15);
            return { type: 'parallelogram', text: `สี่เหลี่ยมด้านขนาน ฐานยาว ${base} ซม. สูง ${height} ซม.`, expected: base * height };
        },
        function () {
            let base = randomInt(4, 20), height = randomInt(3, base - 1);
            return { type: 'rhombus', text: `สี่เหลี่ยมขนมเปียกปูน ฐานยาว ${base} ซม. สูง ${height} ซม.`, expected: base * height };
        },
        function () {
            let first = randomInt(2, 10) * 2, second = randomInt(3, 15);
            return { type: 'rhombus', text: `สี่เหลี่ยมขนมเปียกปูน มีเส้นทแยงมุมยาว ${first} ซม. และ ${second} ซม.`, expected: first * second / 2 };
        },
    ],
};

function validateQuadAreaResult() {
    if (focusFirstEmptyField(['quadAreaAnswerNumber'])) {
        return;
    }

    let answer = +$('#quadAreaAnswerNumber').val();
    let isCorrect = answer === p5QuadAreaObj.expected;
    let expr = `${p5QuadAreaObj.text} = ${answer}`;

    showFeedback('feedbackQuadArea', isCorrect);

    if (isCorrect) {
        addResultQuadAreaToItemList({ expr })
        $('#contentQuadAreaResult').show();
        addSuggestQuadAreaValue();
    }

    $('#contentQuadAreaHistory').show();
    addResultQuadAreaToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultQuadAreaToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5QuadAreaObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultQuadAreaList').append(elementItem)

    p5QuadAreaObj.numRows++;
}

function addResultQuadAreaToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5QuadAreaObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyQuadAreaList').append(elementItem)

    recordHistoryAttempt('p5quadarea', isCorrect, 'historyQuadAreaList');

    if (isCorrect) {
        p5QuadAreaObj.numRowsHistory++;
    }
}

function addSuggestQuadAreaValue() {
    let isArea = p5QuadAreaObj.mode === 'area';
    let question = pickOne(quadAreaBuilders[p5QuadAreaObj.mode])();

    p5QuadAreaObj.text = question.text;
    p5QuadAreaObj.expected = question.expected;

    $('#quadAreaDisplay').html(renderQuadrilateralSVG(question.type));
    $('#quadAreaQuestion').text(`${question.text} ${isArea ? 'มีพื้นที่กี่ตารางเซนติเมตร' : 'มีความยาวรอบรูปกี่เซนติเมตร'}`);
    $('#quadAreaAnswerNumber').val('');
}

bindModePicker('quadAreaModePicker', p5QuadAreaObj, addSuggestQuadAreaValue);

addSuggestQuadAreaValue();
