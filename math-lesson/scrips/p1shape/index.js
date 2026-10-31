var p1ShapeObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "flat",
    correctType: 'circle',
    selectedType: null,
}

var shapeLabels = {
    circle: 'วงกลม',
    ellipse: 'วงรี',
    square: 'สี่เหลี่ยมจัตุรัส',
    triangle: 'สามเหลี่ยม',
    rectangle: 'สี่เหลี่ยมผืนผ้า',
    box: 'ทรงสี่เหลี่ยมมุมฉาก',
    sphere: 'ทรงกลม',
    cylinder: 'ทรงกระบอก',
    cone: 'กรวย',
}

var shapeGroups = {
    flat: ['circle', 'ellipse', 'triangle', 'square', 'rectangle'],
    solid: ['box', 'sphere', 'cylinder', 'cone'],
}

function renderShapeSVG(type) {
    if (type === 'circle') {
        return '<svg viewBox="0 0 120 120" width="120" height="120"><circle class="shape-fill" cx="60" cy="60" r="50"/></svg>';
    } else if (type === 'ellipse') {
        return '<svg viewBox="0 0 140 100" width="140" height="100"><ellipse class="shape-fill" cx="70" cy="50" rx="62" ry="38"/></svg>';
    } else if (type === 'square') {
        return '<svg viewBox="0 0 120 120" width="120" height="120"><rect class="shape-fill" x="10" y="10" width="100" height="100"/></svg>';
    } else if (type === 'rectangle') {
        return '<svg viewBox="0 0 140 100" width="140" height="100"><rect class="shape-fill" x="10" y="10" width="120" height="80"/></svg>';
    } else if (type === 'box') {
        return '<svg viewBox="0 0 140 120" width="140" height="120"><polygon class="shape-fill" points="10,40 100,40 100,110 10,110"/><polygon class="shape-soft" points="10,40 40,12 130,12 100,40"/><polygon class="shape-dim" points="100,40 130,12 130,82 100,110"/></svg>';
    } else if (type === 'sphere') {
        return '<svg viewBox="0 0 120 120" width="120" height="120"><circle class="shape-fill" cx="60" cy="60" r="50"/><ellipse class="shape-line" cx="60" cy="60" rx="50" ry="16"/></svg>';
    } else if (type === 'cylinder') {
        return '<svg viewBox="0 0 120 130" width="120" height="130"><rect class="shape-fill" x="20" y="22" width="80" height="86"/><ellipse class="shape-fill" cx="60" cy="108" rx="40" ry="14"/><ellipse class="shape-soft" cx="60" cy="22" rx="40" ry="14"/></svg>';
    } else if (type === 'cone') {
        return '<svg viewBox="0 0 120 130" width="120" height="130"><polygon class="shape-fill" points="60,8 104,104 16,104"/><ellipse class="shape-fill" cx="60" cy="104" rx="44" ry="14"/></svg>';
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
    let expr = shapeLabels[p1ShapeObj.selectedType];

    showFeedback('feedbackShape', isCorrect);

    if (isCorrect) {
        addResultShapeToItemList({ expr })
        $('#contentShapeResult').show();
        addSuggestShapeValue();
    }

    $('#contentShapeHistory').show();
    addResultShapeToHistoryList({ expr, color: isCorrect ? "green" : "red" })
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
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1ShapeObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyShapeList').append(elementItem)

    recordHistoryAttempt('p1shape', isCorrect, 'historyShapeList');

    if (isCorrect) {
        p1ShapeObj.numRowsHistory++;
    }
}

function addSuggestShapeValue() {
    let types = shapeGroups[p1ShapeObj.mode];
    let correctType = pickOne(types);
    let shuffled = shuffleList(types);

    p1ShapeObj.correctType = correctType;
    p1ShapeObj.selectedType = null;

    $('#shapeDisplay').html(renderShapeSVG(correctType));

    let html = '';
    for (let i = 0; i < shuffled.length; i++) {
        html += `<button type="button" class="shape-option-btn" data-type="${shuffled[i]}">${shapeLabels[shuffled[i]]}</button>`;
    }
    $('#shapeOptionsPicker').html(html);
}

bindModePicker('shapeModePicker', p1ShapeObj, addSuggestShapeValue);

addSuggestShapeValue();
