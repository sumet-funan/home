var p5BarChartObj = {
    numRows: 1,
    numRowsHistory: 1,
    categories: [],
    values: [],
    questionType: 'value',
    expected: 0,
}

var barChartCategoryPool = ['แอปเปิ้ล', 'กล้วย', 'ส้ม', 'มะม่วง', 'สับปะรด', 'มะละกอ'];

function validateBarChartResult() {
    if (focusFirstEmptyField(['barChartAnswerNumber'])) {
        return;
    }

    let answer = +$('#barChartAnswerNumber').val();
    let isCorrect = answer === p5BarChartObj.expected;
    let textColor = "green";

    showFeedback('feedbackBarChart', isCorrect);

    let expr = `${$('#barChartQuestion').text()} = ${answer}`;

    if (isCorrect) {
        addResultBarChartToItemList({ expr })
        $('#contentBarChartResult').show();
        addSuggestBarChartValue();
    }
    else {
        textColor = "red";
    }

    $('#contentBarChartHistory').show();
    addResultBarChartToHistoryList({ expr, color: textColor })
}

function addResultBarChartToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5BarChartObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultBarChartList').append(elementItem)

    p5BarChartObj.numRows++;
}

function addResultBarChartToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5BarChartObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyBarChartList').append(elementItem)

    if (isCorrect) {
        p5BarChartObj.numRowsHistory++;
    }
}

function renderBarChart() {
    let categories = p5BarChartObj.categories;
    let values = p5BarChartObj.values;
    let maxValue = Math.max.apply(null, values);
    let html = '';

    for (let i = 0; i < categories.length; i++) {
        let heightPercent = Math.round((values[i] / maxValue) * 100);
        html += `<div class="bar-item">
            <span class="bar-value">${values[i]}</span>
            <div class="bar-fill" style="height: ${heightPercent}%;"></div>
            <span class="bar-label">${categories[i]}</span>
        </div>`;
    }

    $('#barChartContainer').html(html);
}

function addSuggestBarChartValue() {
    let n = 4 + parseInt(Math.random() * 2);
    let pool = barChartCategoryPool.slice();
    let categories = [];

    for (let i = 0; i < n; i++) {
        let idx = parseInt(Math.random() * pool.length);
        categories.push(pool[idx]);
        pool.splice(idx, 1);
    }

    let values = [];
    for (let i = 0; i < n; i++) {
        values.push(parseInt(Math.random() * 36) + 5);
    }

    p5BarChartObj.categories = categories;
    p5BarChartObj.values = values;

    let questionTypes = ['value', 'sum', 'max', 'diff'];
    let questionType = questionTypes[parseInt(Math.random() * questionTypes.length)];
    let questionText, expected;

    if (questionType === 'value') {
        let idx = parseInt(Math.random() * n);
        questionText = `นักเรียนชอบ${categories[idx]}กี่คน`;
        expected = values[idx];
    } else if (questionType === 'sum') {
        questionText = `มีนักเรียนทั้งหมดกี่คน`;
        expected = values.reduce(function (a, b) { return a + b; }, 0);
    } else if (questionType === 'max') {
        questionText = `ผลไม้ที่มีคนชอบมากที่สุดมีกี่คน`;
        expected = Math.max.apply(null, values);
    } else {
        questionText = `ผลต่างระหว่างจำนวนมากที่สุดกับน้อยที่สุดเท่ากับเท่าไร`;
        expected = Math.max.apply(null, values) - Math.min.apply(null, values);
    }

    p5BarChartObj.questionType = questionType;
    p5BarChartObj.expected = expected;

    $('#barChartQuestion').text(questionText);
    $('#barChartAnswerNumber').val('');
    renderBarChart();
}

addSuggestBarChartValue();
