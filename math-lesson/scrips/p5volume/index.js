var p5VolumeObj = {
    numRows: 1,
    numRowsHistory: 1,
    length: 4,
    width: 3,
    height: 2,
    expected: 24,
}

function validateVolumeResult() {
    if (focusFirstEmptyField(['volumeAnswerNumber'])) {
        return;
    }

    let answer = +$('#volumeAnswerNumber').val();
    let isCorrect = answer === p5VolumeObj.expected;
    let textColor = "green";

    showFeedback('feedbackVolume', isCorrect);

    let expr = `${p5VolumeObj.length} × ${p5VolumeObj.width} × ${p5VolumeObj.height} = ${answer}`;

    if (isCorrect) {
        addResultVolumeToItemList({ expr })
        $('#contentVolumeResult').show();
        addSuggestVolumeValue();
    }
    else {
        textColor = "red";
    }

    $('#contentVolumeHistory').show();
    addResultVolumeToHistoryList({ expr, color: textColor })
}

function addResultVolumeToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5VolumeObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultVolumeList').append(elementItem)

    p5VolumeObj.numRows++;
}

function addResultVolumeToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5VolumeObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyVolumeList').append(elementItem)

    recordHistoryAttempt('p5volume', isCorrect, 'historyVolumeList');

    if (isCorrect) {
        p5VolumeObj.numRowsHistory++;
    }
}

function addSuggestVolumeValue() {
    let length = parseInt(Math.random() * 10) + 2;
    let width = parseInt(Math.random() * 10) + 2;
    let height = parseInt(Math.random() * 10) + 2;
    let expected = length * width * height;

    p5VolumeObj.length = length;
    p5VolumeObj.width = width;
    p5VolumeObj.height = height;
    p5VolumeObj.expected = expected;

    $('#volumeQuestion').text(`กล่องสี่เหลี่ยมมุมฉาก กว้าง ${width} ยาว ${length} สูง ${height} หน่วย มีปริมาตรเท่ากับเท่าไร (ลูกบาศก์หน่วย)`);
    $('#volumeAnswerNumber').val('');
}

addSuggestVolumeValue();
