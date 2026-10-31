var p2ShapeObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "name",
    correctType: 'circle',
    selectedType: null,
    sides: 3,
    asked: 'ด้าน',
}

// Each polygon comes in a regular and a lopsided outline, so that a child learns
// to count the sides rather than to recognise one familiar picture.
var p2ShapeOutlines = {
    3: ['60,10 110,110 10,110', '20,20 110,60 30,110'],
    4: ['10,25 110,25 110,95 10,95', '30,20 110,30 90,105 15,85'],
    5: ['60,8 112,46 92,110 28,110 8,46', '20,15 100,25 112,80 55,112 10,75'],
    6: ['35,12 85,12 112,60 85,108 35,108 8,60', '25,20 80,10 112,50 95,105 40,112 8,70'],
};

var p2ShapeLabels = {
    3: 'รูปสามเหลี่ยม',
    4: 'รูปสี่เหลี่ยม',
    5: 'รูปห้าเหลี่ยม',
    6: 'รูปหกเหลี่ยม',
    circle: 'รูปวงกลม',
};

function renderP2ShapeSVG(type) {
    if (type === 'circle') {
        return '<svg viewBox="0 0 120 120" width="120" height="120"><circle class="shape-fill" cx="60" cy="60" r="50"/></svg>';
    }
    return `<svg viewBox="0 0 120 120" width="120" height="120"><polygon class="shape-fill" points="${pickOne(p2ShapeOutlines[type])}"/></svg>`;
}

$(document).on('click', '#p2ShapeOptionsPicker .shape-option-btn', function () {
    $('#p2ShapeOptionsPicker .shape-option-btn').removeClass('selected');
    $(this).addClass('selected');
    p2ShapeObj.selectedType = String($(this).data('type'));
});

function validateP2ShapeResult() {
    let isCorrect, expr;

    if (p2ShapeObj.mode === 'name') {
        if (!p2ShapeObj.selectedType) {
            flagFieldRequired('p2ShapeOptionsPicker');
            return;
        }

        isCorrect = p2ShapeObj.selectedType === p2ShapeObj.correctType;
        expr = p2ShapeLabels[p2ShapeObj.selectedType];
    } else {
        if (focusFirstEmptyField(['p2ShapeAnswerNumber'])) {
            return;
        }

        let answer = +$('#p2ShapeAnswerNumber').val();

        isCorrect = answer === p2ShapeObj.sides;
        expr = `${p2ShapeLabels[p2ShapeObj.correctType]} มี ${answer} ${p2ShapeObj.asked}`;
    }

    showFeedback('feedbackP2Shape', isCorrect);

    if (isCorrect) {
        addResultP2ShapeToItemList({ expr })
        $('#contentP2ShapeResult').show();
        addSuggestP2ShapeValue();
    }

    $('#contentP2ShapeHistory').show();
    addResultP2ShapeToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2ShapeToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2ShapeObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2ShapeList').append(elementItem)

    p2ShapeObj.numRows++;
}

function addResultP2ShapeToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2ShapeObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2ShapeList').append(elementItem)

    recordHistoryAttempt('p2shape', isCorrect, 'historyP2ShapeList');

    if (isCorrect) {
        p2ShapeObj.numRowsHistory++;
    }
}

function addSuggestP2ShapeValue() {
    let isName = p2ShapeObj.mode === 'name';
    let types = isName ? ['3', '4', '5', '6', 'circle'] : ['3', '4', '5', '6'];
    let correctType = pickOne(types);

    p2ShapeObj.correctType = correctType;
    p2ShapeObj.selectedType = null;
    p2ShapeObj.sides = +correctType;
    p2ShapeObj.asked = pickOne(['ด้าน', 'มุม']);

    $('#p2ShapeDisplay').html(renderP2ShapeSVG(correctType));
    $('#p2ShapeOptionsPicker').toggle(isName);
    $('#p2ShapeCountArea').toggle(!isName);
    $('#p2ShapeQuestion').text(`รูปนี้มีกี่${p2ShapeObj.asked}`);
    $('#p2ShapeAnswerNumber').val('');

    let html = '';
    let shuffled = shuffleList(types);
    for (let i = 0; i < shuffled.length; i++) {
        html += `<button type="button" class="shape-option-btn" data-type="${shuffled[i]}">${p2ShapeLabels[shuffled[i]]}</button>`;
    }
    $('#p2ShapeOptionsPicker').html(html);
}

bindModePicker('p2ShapeModePicker', p2ShapeObj, addSuggestP2ShapeValue);

addSuggestP2ShapeValue();
