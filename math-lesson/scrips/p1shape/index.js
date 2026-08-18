var p1ShapeObj = {
    numRows: 1,
    numRowsHistory: 1,
    correctType: 'circle',
    selectedType: null,
}

var shapeLabels = {
    circle: 'วงกลม',
    square: 'สี่เหลี่ยมจัตุรัส',
    triangle: 'สามเหลี่ยม',
    rectangle: 'สี่เหลี่ยมผืนผ้า',
}

function renderShapeSVG(type) {
    if (type === 'circle') {
        return '<svg viewBox="0 0 120 120" width="120" height="120"><circle class="shape-fill" cx="60" cy="60" r="50"/></svg>';
    } else if (type === 'square') {
        return '<svg viewBox="0 0 120 120" width="120" height="120"><rect class="shape-fill" x="10" y="10" width="100" height="100"/></svg>';
    } else if (type === 'rectangle') {
        return '<svg viewBox="0 0 140 100" width="140" height="100"><rect class="shape-fill" x="10" y="10" width="120" height="80"/></svg>';
    } else {
        return '<svg viewBox="0 0 120 120" width="120" height="120"><polygon class="shape-fill" points="60,10 110,110 10,110"/></svg>';
    }
}

$(document).on('click', '#shapeOptionsPicker .shape-option-btn', function () {
    $('#shapeOptionsPicker .shape-option-btn').removeClass('selected');
    $(this).addClass('selected');
    p1ShapeObj.selectedType = $(this).data('type');
});

function validateShapeResult() {
    if (!p1ShapeObj.selectedType) {
        flagFieldRequired('shapeOptionsPicker');
        return;
    }

    let isCorrect = p1ShapeObj.selectedType === p1ShapeObj.correctType;
    let textColor = "green";

    showFeedback('feedbackShape', isCorrect);

    let expr = shapeLabels[p1ShapeObj.correctType];

    if (isCorrect) {
        addResultShapeToItemList({ expr })
        $('#contentShapeResult').show();
        addSuggestShapeValue();
    }
    else {
        textColor = "red";
    }

    $('#contentShapeHistory').show();
    addResultShapeToHistoryList({ expr, color: textColor })
}

function addResultShapeToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1ShapeObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultShapeList').append(elementItem)

    p1ShapeObj.numRows++;
}

function addResultShapeToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="material-symbols-rounded">${isCorrect ? 'check_circle' : 'cancel'}</i>
            <span class="answer-index">${p1ShapeObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyShapeList').append(elementItem)

    if (isCorrect) {
        p1ShapeObj.numRowsHistory++;
    }
}

function addSuggestShapeValue() {
    let types = ['circle', 'square', 'triangle', 'rectangle'];
    let correctType = types[parseInt(Math.random() * types.length)];

    p1ShapeObj.correctType = correctType;
    p1ShapeObj.selectedType = null;

    $('#shapeDisplay').html(renderShapeSVG(correctType));

    let shuffled = types.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = parseInt(Math.random() * (i + 1));
        let temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }

    let html = '';
    for (let i = 0; i < shuffled.length; i++) {
        html += `<button type="button" class="shape-option-btn" data-type="${shuffled[i]}">${shapeLabels[shuffled[i]]}</button>`;
    }
    $('#shapeOptionsPicker').html(html);
}

addSuggestShapeValue();
