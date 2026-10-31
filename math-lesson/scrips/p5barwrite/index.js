var p5BarWriteObj = {
    numRows: 1,
    numRowsHistory: 1,
    categories: [],
    values: [],
    scale: 5,
    heights: [],
}

var barWriteLevels = 8;
var barWriteCategories = ['ส้ม', 'กล้วย', 'มะม่วง', 'แตงโม', 'องุ่น', 'ฝรั่ง'];

function renderBarWriteGrid() {
    let html = '';

    for (let level = barWriteLevels; level >= 1; level--) {
        html += `<span class="barwrite-scale">${level * p5BarWriteObj.scale}</span>`;
        for (let col = 0; col < p5BarWriteObj.categories.length; col++) {
            let isFilled = p5BarWriteObj.heights[col] >= level;
            html += `<button type="button" class="barwrite-cell${isFilled ? ' is-filled' : ''}" data-col="${col}" data-level="${level}"
                aria-label="${p5BarWriteObj.categories[col]} ${level * p5BarWriteObj.scale}"></button>`;
        }
    }

    html += '<span class="barwrite-scale"></span>';
    for (let col = 0; col < p5BarWriteObj.categories.length; col++) {
        html += `<span class="barwrite-label">${p5BarWriteObj.categories[col]}</span>`;
    }

    $('#barWriteGrid').html(html);
}

// Tapping the top of a bar a second time takes one level off it, so a tap too
// high can be undone without having to find the right level first.
$(document).on('click', '#barWriteGrid .barwrite-cell', function () {
    let col = +$(this).data('col');
    let level = +$(this).data('level');

    p5BarWriteObj.heights[col] = p5BarWriteObj.heights[col] === level ? level - 1 : level;
    renderBarWriteGrid();
});

function validateBarWriteResult() {
    if (p5BarWriteObj.heights.indexOf(0) !== -1) {
        flagFieldRequired('barWriteGrid');
        return;
    }

    let isCorrect = p5BarWriteObj.heights.every(function (height, col) {
        return height * p5BarWriteObj.scale === p5BarWriteObj.values[col];
    });
    let expr = p5BarWriteObj.categories.map(function (category, col) {
        return `${category} ${p5BarWriteObj.heights[col] * p5BarWriteObj.scale}`;
    }).join(', ');

    showFeedback('feedbackBarWrite', isCorrect);

    if (isCorrect) {
        addResultBarWriteToItemList({ expr })
        $('#contentBarWriteResult').show();
        addSuggestBarWriteValue();
    }

    $('#contentBarWriteHistory').show();
    addResultBarWriteToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultBarWriteToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5BarWriteObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultBarWriteList').append(elementItem)

    p5BarWriteObj.numRows++;
}

function addResultBarWriteToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5BarWriteObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyBarWriteList').append(elementItem)

    recordHistoryAttempt('p5barwrite', isCorrect, 'historyBarWriteList');

    if (isCorrect) {
        p5BarWriteObj.numRowsHistory++;
    }
}

function addSuggestBarWriteValue() {
    let categories = shuffleList(barWriteCategories).slice(0, 4);
    let scale = pickOne([2, 5, 10]);
    let values = categories.map(function () {
        return randomInt(1, barWriteLevels) * scale;
    });

    p5BarWriteObj.categories = categories;
    p5BarWriteObj.values = values;
    p5BarWriteObj.scale = scale;
    p5BarWriteObj.heights = categories.map(function () { return 0; });

    $('#barWriteData').html(categories.map(function (category, col) {
        return `<div class="barwrite-datum"><span>${category}</span><strong>${values[col]}</strong></div>`;
    }).join(''));
    renderBarWriteGrid();
}

addSuggestBarWriteValue();
