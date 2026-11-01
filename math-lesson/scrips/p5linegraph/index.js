var p5LineGraphObj = {
    numRows: 1,
    numRowsHistory: 1,
    text: '',
    expected: 0,
}

var lineGraphMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'];
var lineGraphTopics = [
    { title: 'ปริมาณน้ำฝนในแต่ละเดือน', unit: 'มิลลิเมตร' },
    { title: 'จำนวนนักเรียนที่เข้าห้องสมุด', unit: 'คน' },
    { title: 'จำนวนน้ำส้มที่ขายได้', unit: 'แก้ว' },
];

function renderLineGraph(title, months, values) {
    let left = 40, right = 312, top = 34, bottom = 180;
    let xOf = function (index) { return left + 16 + index * (right - left - 32) / (months.length - 1); };
    let yOf = function (value) { return bottom - value / 100 * (bottom - top); };
    let grid = '';

    for (let value = 0; value <= 100; value += 10) {
        grid += `<line class="line-graph-grid" x1="${left}" y1="${yOf(value)}" x2="${right}" y2="${yOf(value)}"/>`;
        if (value % 20 === 0) {
            grid += `<text class="line-graph-text" x="${left - 6}" y="${yOf(value) + 4}" text-anchor="end">${value}</text>`;
        }
    }

    let labels = months.map(function (month, index) {
        return `<text class="line-graph-text" x="${xOf(index)}" y="${bottom + 18}" text-anchor="middle">${month}</text>`;
    }).join('');
    let points = values.map(function (value, index) {
        return `${xOf(index)},${yOf(value)}`;
    });
    let dots = values.map(function (value, index) {
        return `<circle class="line-graph-dot" cx="${xOf(index)}" cy="${yOf(value)}" r="4.5"/>`;
    }).join('');

    return `<svg viewBox="0 0 320 206" width="320" height="206" role="img" aria-label="${title}">
        <text class="line-graph-title" x="160" y="16" text-anchor="middle">${title}</text>
        ${grid}${labels}
        <polyline class="line-graph-line" points="${points.join(' ')}"/>
        ${dots}
    </svg>`;
}

function validateLineGraphResult() {
    if (focusFirstEmptyField(['lineGraphAnswerNumber'])) {
        return;
    }

    let answer = +$('#lineGraphAnswerNumber').val();
    let isCorrect = answer === p5LineGraphObj.expected;
    let expr = `${p5LineGraphObj.text} = ${answer}`;

    showFeedback('feedbackLineGraph', isCorrect);

    if (isCorrect) {
        addResultLineGraphToItemList({ expr })
        $('#contentLineGraphResult').show();
        addSuggestLineGraphValue();
    }

    $('#contentLineGraphHistory').show();
    addResultLineGraphToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultLineGraphToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5LineGraphObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultLineGraphList').append(elementItem)

    p5LineGraphObj.numRows++;
}

function addResultLineGraphToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5LineGraphObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyLineGraphList').append(elementItem)

    recordHistoryAttempt('p5linegraph', isCorrect, 'historyLineGraphList');

    if (isCorrect) {
        p5LineGraphObj.numRowsHistory++;
    }
}

function buildLineGraphQuestion() {
    let topic = pickOne(lineGraphTopics);
    let count = randomInt(5, 6);
    let months = lineGraphMonths.slice(0, count);
    let values = months.map(function () {
        return randomInt(1, 10) * 10;
    });
    let pair = shuffleList(months.map(function (month, index) { return index; })).slice(0, 2);
    let first = Math.min(pair[0], pair[1]), second = Math.max(pair[0], pair[1]);
    let question = pickOne([
        { text: `เดือน ${months[first]} มีกี่${topic.unit}`, expected: values[first] },
        { text: `เดือนที่มีมากที่สุด มีกี่${topic.unit}`, expected: Math.max.apply(null, values) },
        { text: `เดือนที่มีน้อยที่สุด มีกี่${topic.unit}`, expected: Math.min.apply(null, values) },
        { text: `เดือน ${months[first]} กับเดือน ${months[second]} ต่างกันกี่${topic.unit}`, expected: Math.abs(values[first] - values[second]) },
        { text: `เดือน ${months[first]} และเดือน ${months[second]} รวมกันกี่${topic.unit}`, expected: values[first] + values[second] },
    ]);

    question.figure = renderLineGraph(topic.title, months, values);
    return question;
}

function addSuggestLineGraphValue() {
    let question = buildLineGraphQuestion();

    p5LineGraphObj.text = question.text;
    p5LineGraphObj.expected = question.expected;

    $('#lineGraphDisplay').html(question.figure);
    $('#lineGraphQuestion').text(question.text);
    $('#lineGraphAnswerNumber').val('');
}

addSuggestLineGraphValue();
