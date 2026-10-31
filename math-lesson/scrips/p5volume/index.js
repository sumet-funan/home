var p5VolumeObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "volume",
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
    let expr = p5VolumeObj.mode === 'volume'
        ? `${p5VolumeObj.length} × ${p5VolumeObj.width} × ${p5VolumeObj.height} = ${answer}`
        : `ถัง ${p5VolumeObj.length} × ${p5VolumeObj.width} × ${p5VolumeObj.height} ซม. จุ ${answer} ลิตร`;

    showFeedback('feedbackVolume', isCorrect);

    if (isCorrect) {
        addResultVolumeToItemList({ expr })
        $('#contentVolumeResult').show();
        addSuggestVolumeValue();
    }

    $('#contentVolumeHistory').show();
    addResultVolumeToHistoryList({ expr, color: isCorrect ? "green" : "red" })
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

// A tank measured in tens of centimetres always holds a whole number of litres.
function addSuggestVolumeValue() {
    let isVolume = p5VolumeObj.mode === 'volume';
    let length = isVolume ? randomInt(2, 11) : randomInt(1, 6) * 10;
    let width = isVolume ? randomInt(2, 11) : randomInt(1, 6) * 10;
    let height = isVolume ? randomInt(2, 11) : randomInt(1, 6) * 10;
    let cubic = length * width * height;

    p5VolumeObj.length = length;
    p5VolumeObj.width = width;
    p5VolumeObj.height = height;
    p5VolumeObj.expected = isVolume ? cubic : cubic / 1000;

    $('#volumeQuestion').text(isVolume
        ? `กล่องสี่เหลี่ยมมุมฉาก กว้าง ${width} ยาว ${length} สูง ${height} หน่วย มีปริมาตรเท่ากับเท่าไร (ลูกบาศก์หน่วย)`
        : `ถังทรงสี่เหลี่ยมมุมฉาก กว้าง ${width} ซม. ยาว ${length} ซม. สูง ${height} ซม. จุน้ำกี่ลิตร`);
    $('#volumeAnswerNumber').val('');
}

bindModePicker('volumeModePicker', p5VolumeObj, addSuggestVolumeValue);

addSuggestVolumeValue();
