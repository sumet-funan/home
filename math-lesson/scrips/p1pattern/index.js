var p1PatternObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "number",
    terms: [],
    step: 0,
    shapes: [],
    missingAt: 0,
    selectedShape: null,
}

var patternShapeLabels = {
    circle: 'วงกลม',
    square: 'สี่เหลี่ยม',
    triangle: 'สามเหลี่ยม',
    star: 'ดาว',
    diamond: 'ข้าวหลามตัด',
};

function renderPatternShape(type) {
    let shapes = {
        circle: '<circle class="shape-fill" cx="20" cy="20" r="16"/>',
        square: '<rect class="shape-fill" x="5" y="5" width="30" height="30"/>',
        triangle: '<polygon class="shape-fill" points="20,4 37,36 3,36"/>',
        star: '<polygon class="shape-fill" points="20,2 25,15 38,15 28,24 32,38 20,30 8,38 12,24 2,15 15,15"/>',
        diamond: '<polygon class="shape-fill" points="20,2 36,20 20,38 4,20"/>',
    };
    return `<svg viewBox="0 0 40 40" width="40" height="40" role="img" aria-label="${patternShapeLabels[type]}">${shapes[type]}</svg>`;
}

$(document).on('click', '#patternShapeOptions .shape-option-btn', function () {
    $('#patternShapeOptions .shape-option-btn').removeClass('selected');
    $(this).addClass('selected');
    p1PatternObj.selectedShape = $(this).data('type');
});

function validatePatternResult() {
    let isCorrect, expr;

    if (p1PatternObj.mode === 'number') {
        if (focusFirstEmptyField(['patternAnswerNumber'])) {
            return;
        }

        let answer = +$('#patternAnswerNumber').val();

        isCorrect = answer === p1PatternObj.terms[3] + p1PatternObj.step;
        expr = p1PatternObj.terms.join(', ') + ', ' + answer;
    } else {
        if (!p1PatternObj.selectedShape) {
            flagFieldRequired('patternShapeOptions');
            return;
        }

        isCorrect = p1PatternObj.selectedShape === p1PatternObj.shapes[p1PatternObj.missingAt % 2];
        expr = 'รูปที่หายไป: ' + patternShapeLabels[p1PatternObj.selectedShape];
    }

    showFeedback('feedbackPattern', isCorrect);

    if (isCorrect) {
        addResultPatternToItemList({ expr })
        $('#contentPatternResult').show();
        addSuggestPatternValue();
    }

    $('#contentPatternHistory').show();
    addResultPatternToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultPatternToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1PatternObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultPatternList').append(elementItem)

    p1PatternObj.numRows++;
}

function addResultPatternToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1PatternObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyPatternList').append(elementItem)

    recordHistoryAttempt('p1pattern', isCorrect, 'historyPatternList');

    if (isCorrect) {
        p1PatternObj.numRowsHistory++;
    }
}

function suggestPatternNumbers() {
    let step = pickOne([1, 10, -1, -10]);
    let start = step > 0 ? randomInt(0, 100 - step * 4) : randomInt(-step * 4, 100);
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

// a set of two shapes repeating, with one of them taken out
function suggestPatternShapes() {
    let types = shuffleList(Object.keys(patternShapeLabels));
    let shapes = types.slice(0, 2);
    let missingAt = randomInt(2, 5);
    let row = '';

    for (let i = 0; i < 6; i++) {
        row += i === missingAt
            ? '<span class="pattern-shape is-missing">?</span>'
            : `<span class="pattern-shape">${renderPatternShape(shapes[i % 2])}</span>`;
    }

    let options = shuffleList(types.slice(0, 3)).map(function (type) {
        return `<button type="button" class="shape-option-btn" data-type="${type}" aria-label="${patternShapeLabels[type]}">${renderPatternShape(type)}</button>`;
    });

    p1PatternObj.shapes = shapes;
    p1PatternObj.missingAt = missingAt;
    p1PatternObj.selectedShape = null;

    $('#patternShapeRow').html(row);
    $('#patternShapeOptions').html(options.join(''));
}

function addSuggestPatternValue() {
    let isNumber = p1PatternObj.mode === 'number';

    $('#patternNumberArea').toggle(isNumber);
    $('#patternShapeArea').toggle(!isNumber);

    if (isNumber) {
        suggestPatternNumbers();
    } else {
        suggestPatternShapes();
    }
}

bindModePicker('patternModePicker', p1PatternObj, addSuggestPatternValue);

addSuggestPatternValue();
