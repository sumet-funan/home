var p5GeometryObj = {
    numRows: 1,
    numRowsHistory: 1,
    shape: 'rectangle',
    metric: 'area',
    expected: 0,
}

function validateGeometryResult() {
    if (focusFirstEmptyField(['geometryAnswerNumber'])) {
        return;
    }

    let answer = +$('#geometryAnswerNumber').val();
    let isCorrect = answer === p5GeometryObj.expected;
    let textColor = "green";

    showFeedback('feedbackGeometry', isCorrect);

    let metricLabel = p5GeometryObj.metric === 'area' ? 'พื้นที่' : 'ความยาวรอบรูป';
    let expr = `${metricLabel} = ${answer}`;

    if (isCorrect) {
        addResultGeometryToItemList({ expr })
        $('#contentGeometryResult').show();
        addSuggestGeometryValue();
    }
    else {
        textColor = "red";
    }

    $('#contentGeometryHistory').show();
    addResultGeometryToHistoryList({ expr, color: textColor })
}

function addResultGeometryToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5GeometryObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultGeometryList').append(elementItem)

    p5GeometryObj.numRows++;
}

function addResultGeometryToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="material-symbols-rounded">${isCorrect ? 'check_circle' : 'cancel'}</i>
            <span class="answer-index">${p5GeometryObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyGeometryList').append(elementItem)

    if (isCorrect) {
        p5GeometryObj.numRowsHistory++;
    }
}

function addSuggestGeometryValue() {
    let shapes = ['rectangle', 'square', 'triangle'];
    let shape = shapes[parseInt(Math.random() * shapes.length)];
    let metric = shape === 'triangle' ? 'area' : (Math.random() < 0.5 ? 'area' : 'perimeter');

    let expected, shapeLabel, dimsText;

    if (shape === 'rectangle') {
        let width = parseInt(Math.random() * 15) + 3;
        let height = parseInt(Math.random() * 15) + 3;
        expected = metric === 'area' ? width * height : 2 * (width + height);
        shapeLabel = 'สี่เหลี่ยมผืนผ้า';
        dimsText = `กว้าง ${width} หน่วย ยาว ${height} หน่วย`;
    } else if (shape === 'square') {
        let side = parseInt(Math.random() * 15) + 3;
        expected = metric === 'area' ? side * side : 4 * side;
        shapeLabel = 'สี่เหลี่ยมจัตุรัส';
        dimsText = `ด้านยาว ${side} หน่วย`;
    } else {
        let base = (parseInt(Math.random() * 8) + 2) * 2;
        let height = parseInt(Math.random() * 15) + 3;
        expected = (base * height) / 2;
        shapeLabel = 'สามเหลี่ยม';
        dimsText = `ฐานยาว ${base} หน่วย สูง ${height} หน่วย`;
    }

    p5GeometryObj.shape = shape;
    p5GeometryObj.metric = metric;
    p5GeometryObj.expected = expected;

    let questionText = metric === 'area'
        ? `${shapeLabel} ${dimsText} มีพื้นที่เท่ากับเท่าไร (ตารางหน่วย)`
        : `${shapeLabel} ${dimsText} มีความยาวรอบรูปเท่ากับเท่าไร (หน่วย)`;

    $('#geometryQuestion').text(questionText);
    $('#geometryAnswerNumber').val('');
}

addSuggestGeometryValue();
