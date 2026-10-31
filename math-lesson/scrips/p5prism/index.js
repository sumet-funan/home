var p5PrismObj = {
    numRows: 1,
    numRowsHistory: 1,
    sides: 3,
    text: '',
    expected: 0,
}

var prismBaseNames = { 3: 'สามเหลี่ยม', 4: 'สี่เหลี่ยม', 5: 'ห้าเหลี่ยม', 6: 'หกเหลี่ยม' };

// the two bases are rings of points; edges round the back are drawn dashed
function renderPrismSVG(sides) {
    let top = [], bottom = [], depth = [];

    for (let i = 0; i < sides; i++) {
        let angle = (90 + 360 * (i + 0.5) / sides) * Math.PI / 180;
        let x = 90 + 66 * Math.cos(angle);
        let y = 22 * Math.sin(angle);
        top.push([x.toFixed(1), (34 + y).toFixed(1)]);
        bottom.push([x.toFixed(1), (112 + y).toFixed(1)]);
        depth.push(Math.sin(angle));
    }

    let faces = '', lines = '';

    for (let i = 0; i < sides; i++) {
        let next = (i + 1) % sides;
        let isFront = depth[i] + depth[next] > 0;
        if (isFront) {
            faces += `<polygon class="shape-soft" points="${top[i]} ${top[next]} ${bottom[next]} ${bottom[i]}"/>`;
        }
        lines += `<line class="prism-edge" x1="${top[i][0]}" y1="${top[i][1]}" x2="${top[next][0]}" y2="${top[next][1]}"/>`;
        lines += `<line class="prism-edge${isFront ? '' : ' is-hidden'}" x1="${bottom[i][0]}" y1="${bottom[i][1]}" x2="${bottom[next][0]}" y2="${bottom[next][1]}"/>`;
        lines += `<line class="prism-edge${depth[i] < -0.01 ? ' is-hidden' : ''}" x1="${top[i][0]}" y1="${top[i][1]}" x2="${bottom[i][0]}" y2="${bottom[i][1]}"/>`;
    }

    return `<svg viewBox="0 0 180 146" width="180" height="146" role="img" aria-label="ปริซึม">
        ${faces}<polygon class="shape-fill" points="${top.join(' ')}"/>${lines}
    </svg>`;
}

function validatePrismResult() {
    if (focusFirstEmptyField(['prismAnswerNumber'])) {
        return;
    }

    let answer = +$('#prismAnswerNumber').val();
    let isCorrect = answer === p5PrismObj.expected;
    let expr = `${p5PrismObj.text} = ${answer}`;

    showFeedback('feedbackPrism', isCorrect);

    if (isCorrect) {
        addResultPrismToItemList({ expr })
        $('#contentPrismResult').show();
        addSuggestPrismValue();
    }

    $('#contentPrismHistory').show();
    addResultPrismToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultPrismToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5PrismObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultPrismList').append(elementItem)

    p5PrismObj.numRows++;
}

function addResultPrismToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5PrismObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyPrismList').append(elementItem)

    recordHistoryAttempt('p5prism', isCorrect, 'historyPrismList');

    if (isCorrect) {
        p5PrismObj.numRowsHistory++;
    }
}

function addSuggestPrismValue() {
    let sides = randomInt(3, 6);
    let name = `ปริซึมฐาน${prismBaseNames[sides]}`;
    let question = pickOne([
        { text: `${name} มีทั้งหมดกี่หน้า`, expected: sides + 2 },
        { text: `${name} มีหน้าข้างกี่หน้า`, expected: sides },
        { text: `${name} มีกี่ขอบ`, expected: sides * 3 },
        { text: `${name} มีกี่จุดยอด`, expected: sides * 2 },
    ]);

    p5PrismObj.sides = sides;
    p5PrismObj.text = question.text;
    p5PrismObj.expected = question.expected;

    $('#prismDisplay').html(renderPrismSVG(sides));
    $('#prismQuestion').text(question.text);
    $('#prismAnswerNumber').val('');
}

addSuggestPrismValue();
