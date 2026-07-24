var p1PatternObj = {
    numRows: 1,
    numRowsHistory: 1,
    terms: [],
    step: 0,
}

function validatePatternResult() {
    let answerRaw = $('#patternAnswerNumber').val();

    if (answerRaw === '') {
        Swal.fire({
            title: 'แจ้งเตือน!',
            text: 'กรุณาใส่ตัวเลขให้ครบ',
            icon: 'info',
            confirmButtonText: 'ตกลง'
        })
        return;
    }

    let answer = +answerRaw;
    let expected = p1PatternObj.terms[3] + p1PatternObj.step;
    let isCorrect = answer === expected;
    let textColor = "green";

    if (isCorrect) {
        Swal.fire({
            icon: "success",
            title: "ถูกต้อง!",
            showConfirmButton: false,
            timer: 1500
        });
    }
    else {
        Swal.fire({
            title: 'ยังไม่ถูก!',
            text: 'ลองดูอีกครั้งนะ',
            icon: 'error',
            confirmButtonText: 'ตกลง'
        })
        textColor = "red";
    }

    let sequenceText = p1PatternObj.terms.join(', ') + ', ' + answer;

    if (isCorrect) {
        addResultPatternToItemList({ sequenceText })
        $('#contentPatternResult').show();
        addSuggestPatternValue();
    }

    $('#contentPatternHistory').show();
    addResultPatternToHistoryList({ sequenceText, color: textColor })
}

function addResultPatternToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1PatternObj.numRows}</span>
            <span class="answer-expr">${item.sequenceText}</span>
        </div>`
    $('#resultPatternList').append(elementItem)

    p1PatternObj.numRows++;
}

function addResultPatternToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1PatternObj.numRowsHistory}</span>
            <span class="answer-expr">${item.sequenceText}</span>
        </div>`
    $('#historyPatternList').append(elementItem)

    if (isCorrect) {
        p1PatternObj.numRowsHistory++;
    }
}

function addSuggestPatternValue() {
    let steps = [1, 2, 5, 10, -1, -2];
    let step = steps[parseInt(Math.random() * steps.length)];

    let start;
    if (step > 0) {
        start = parseInt(Math.random() * (101 - step * 4));
    } else {
        let minStart = -step * 4;
        start = minStart + parseInt(Math.random() * (101 - minStart));
    }

    let terms = [];
    for (let i = 0; i < 4; i++) {
        terms.push(start + step * i);
    }

    p1PatternObj.terms = terms;
    p1PatternObj.step = step;

    $('#patternNum1').text(terms[0]);
    $('#patternNum2').text(terms[1]);
    $('#patternNum3').text(terms[2]);
    $('#patternNum4').text(terms[3]);
    $('#patternAnswerNumber').val('');
}

addSuggestPatternValue();
