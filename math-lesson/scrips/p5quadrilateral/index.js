var p5QuadrilateralObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "picture",
    correctType: 'square',
    selectedType: null,
}

var quadrilaterals = {
    square: { label: 'สี่เหลี่ยมจัตุรัส', points: '35,10 125,10 125,100 35,100', rule: 'ด้านทั้งสี่ยาวเท่ากัน และทุกมุมเป็นมุมฉาก' },
    rectangle: { label: 'สี่เหลี่ยมผืนผ้า', points: '10,25 150,25 150,90 10,90', rule: 'ด้านตรงข้ามยาวเท่ากัน ด้านสองคู่ยาวไม่เท่ากัน และทุกมุมเป็นมุมฉาก' },
    parallelogram: { label: 'สี่เหลี่ยมด้านขนาน', points: '45,20 150,20 115,90 10,90', rule: 'ด้านตรงข้ามขนานกันและยาวเท่ากัน ด้านสองคู่ยาวไม่เท่ากัน และไม่มีมุมฉาก' },
    rhombus: { label: 'สี่เหลี่ยมขนมเปียกปูน', points: '80,5 145,55 80,105 15,55', rule: 'ด้านทั้งสี่ยาวเท่ากัน แต่ไม่มีมุมฉาก' },
    trapezoid: { label: 'สี่เหลี่ยมคางหมู', points: '50,20 120,20 150,90 10,90', rule: 'มีด้านขนานกันเพียงหนึ่งคู่' },
    kite: { label: 'สี่เหลี่ยมรูปว่าว', points: '80,5 120,40 80,105 40,40', rule: 'ด้านที่อยู่ติดกันยาวเท่ากันสองคู่ และไม่มีด้านขนานกัน' },
};

function renderQuadrilateralSVG(type) {
    return `<svg viewBox="0 0 160 110" width="160" height="110" role="img" aria-label="รูปสี่เหลี่ยม"><polygon class="shape-fill" points="${quadrilaterals[type].points}"/></svg>`;
}

$(document).on('click', '#quadrilateralOptions .shape-option-btn', function () {
    $('#quadrilateralOptions .shape-option-btn').removeClass('selected');
    $(this).addClass('selected');
    p5QuadrilateralObj.selectedType = $(this).data('type');
});

function validateQuadrilateralResult() {
    if (!p5QuadrilateralObj.selectedType) {
        flagFieldRequired('quadrilateralOptions');
        return;
    }

    let isCorrect = p5QuadrilateralObj.selectedType === p5QuadrilateralObj.correctType;
    let expr = quadrilaterals[p5QuadrilateralObj.selectedType].label;

    showFeedback('feedbackQuadrilateral', isCorrect);

    if (isCorrect) {
        addResultQuadrilateralToItemList({ expr })
        $('#contentQuadrilateralResult').show();
        addSuggestQuadrilateralValue();
    }

    $('#contentQuadrilateralHistory').show();
    addResultQuadrilateralToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultQuadrilateralToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5QuadrilateralObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultQuadrilateralList').append(elementItem)

    p5QuadrilateralObj.numRows++;
}

function addResultQuadrilateralToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5QuadrilateralObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyQuadrilateralList').append(elementItem)

    recordHistoryAttempt('p5quadrilateral', isCorrect, 'historyQuadrilateralList');

    if (isCorrect) {
        p5QuadrilateralObj.numRowsHistory++;
    }
}

function addSuggestQuadrilateralValue() {
    let isPicture = p5QuadrilateralObj.mode === 'picture';
    let types = Object.keys(quadrilaterals);
    let correctType = pickOne(types);
    let shuffled = shuffleList(types);

    p5QuadrilateralObj.correctType = correctType;
    p5QuadrilateralObj.selectedType = null;

    $('#quadrilateralDisplay').html(renderQuadrilateralSVG(correctType)).toggle(isPicture);
    $('#quadrilateralRule').text(quadrilaterals[correctType].rule).toggle(!isPicture);

    let html = '';
    for (let i = 0; i < shuffled.length; i++) {
        html += `<button type="button" class="shape-option-btn" data-type="${shuffled[i]}">${quadrilaterals[shuffled[i]].label}</button>`;
    }
    $('#quadrilateralOptions').html(html);
}

bindModePicker('quadrilateralModePicker', p5QuadrilateralObj, addSuggestQuadrilateralValue);

addSuggestQuadrilateralValue();
