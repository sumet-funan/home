var p5AverageObj = {
    numRows: 1,
    numRowsHistory: 1,
    numbers: [10, 20, 30, 40],
    expected: 25,
    format: "number",
}

var wordProblemAverageNames = ['สมชาย', 'สมหญิง', 'มานี', 'มานะ', 'ครูใหญ่'];

function buildAverageWordText(numbers) {
    let name = wordProblemAverageNames[parseInt(Math.random() * wordProblemAverageNames.length)];
    return `${name}สอบ ${numbers.length} วิชา ได้คะแนน ${numbers.join(', ')} คะแนน เฉลี่ยแล้วได้กี่คะแนน`;
}

function validateAverageResult() {
    if (focusFirstEmptyField(['averageAnswerNumber'])) {
        return;
    }

    let answer = +$('#averageAnswerNumber').val();
    let isCorrect = answer === p5AverageObj.expected;
    let textColor = "green";

    showFeedback('feedbackAverage', isCorrect);

    let expr = `[${p5AverageObj.numbers.join(', ')}] เฉลี่ย = ${answer}`;

    if (isCorrect) {
        addResultAverageToItemList({ expr })
        $('#contentAverageResult').show();
        addSuggestAverageValue();
    }
    else {
        textColor = "red";
    }

    $('#contentAverageHistory').show();
    addResultAverageToHistoryList({ expr, color: textColor })
}

function addResultAverageToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5AverageObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultAverageList').append(elementItem)

    p5AverageObj.numRows++;
}

function addResultAverageToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5AverageObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyAverageList').append(elementItem)

    recordHistoryAttempt('p5average', isCorrect, 'historyAverageList');

    if (isCorrect) {
        p5AverageObj.numRowsHistory++;
    }
}

function addSuggestAverageValue() {
    let n = Math.random() < 0.5 ? 4 : 5;
    let avg = parseInt(Math.random() * 41) + 10;
    let numbers, last;

    do {
        numbers = [];
        let sum = 0;
        for (let i = 0; i < n - 1; i++) {
            let offset = parseInt(Math.random() * 21) - 10;
            let value = avg + offset;
            if (value < 1) value = 1;
            numbers.push(value);
            sum += value;
        }
        last = avg * n - sum;
    } while (last < 1);

    numbers.push(last);

    for (let i = numbers.length - 1; i > 0; i--) {
        let j = parseInt(Math.random() * (i + 1));
        let temp = numbers[i];
        numbers[i] = numbers[j];
        numbers[j] = temp;
    }

    p5AverageObj.numbers = numbers;
    p5AverageObj.expected = avg;

    $('#averageNumbersDisplay').text(numbers.join(', '));
    $('#averageAnswerNumber').val('');

    if (p5AverageObj.format === 'word') {
        $('#averageWordText').text(buildAverageWordText(numbers));
    }
}

bindFormatPicker('averageFormatPicker', 'averageNumbersDisplay', 'averageWordText', p5AverageObj, addSuggestAverageValue);

addSuggestAverageValue();
