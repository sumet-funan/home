var p2PictographObj = {
    numRows: 1,
    numRowsHistory: 1,
    text: '',
    expected: 0,
}

var p2PictographTopics = [
    { title: 'ผลไม้ที่นักเรียนชอบ', unit: 'คน', ask: 'มีคนชอบ', icon: 'bi-emoji-smile-fill', categories: ['ส้ม', 'กล้วย', 'มะม่วง', 'แตงโม', 'องุ่น'] },
    { title: 'หนังสือในห้องสมุด', unit: 'เล่ม', ask: 'มี', icon: 'bi-book-fill', categories: ['นิทาน', 'การ์ตูน', 'สารคดี', 'ภาษาไทย'] },
    { title: 'สัตว์ในฟาร์ม', unit: 'ตัว', ask: 'มี', icon: 'bi-star-fill', categories: ['ไก่', 'เป็ด', 'หมู', 'วัว', 'แพะ'] },
];

function renderPictograph(topic, rows, perPicture) {
    let body = rows.map(function (row) {
        return `<div class="pictograph-row">
            <span class="pictograph-label">${row.label}</span>
            <span class="pictograph-icons">${`<i class="bi ${topic.icon}"></i>`.repeat(row.count)}</span>
        </div>`;
    }).join('');

    return `<div class="pictograph">
        <div class="pictograph-title">${topic.title}</div>
        ${body}
        <div class="pictograph-key"><i class="bi ${topic.icon}"></i> 1 รูป แทน ${perPicture} ${topic.unit}</div>
    </div>`;
}

function validateP2PictographResult() {
    if (focusFirstEmptyField(['p2PictographAnswerNumber'])) {
        return;
    }

    let answer = +$('#p2PictographAnswerNumber').val();
    let isCorrect = answer === p2PictographObj.expected;
    let expr = `${p2PictographObj.text} = ${answer}`;

    showFeedback('feedbackP2Pictograph', isCorrect);

    if (isCorrect) {
        addResultP2PictographToItemList({ expr })
        $('#contentP2PictographResult').show();
        addSuggestP2PictographValue();
    }

    $('#contentP2PictographHistory').show();
    addResultP2PictographToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2PictographToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2PictographObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2PictographList').append(elementItem)

    p2PictographObj.numRows++;
}

function addResultP2PictographToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2PictographObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2PictographList').append(elementItem)

    recordHistoryAttempt('p2pictograph', isCorrect, 'historyP2PictographList');

    if (isCorrect) {
        p2PictographObj.numRowsHistory++;
    }
}

function addSuggestP2PictographValue() {
    let topic = p2Pick(p2PictographTopics);
    let perPicture = p2Pick([2, 5, 10]);
    let labels = p2Shuffle(topic.categories).slice(0, 4);
    let counts = p2Shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 4);
    let rows = labels.map(function (label, index) {
        return { label: label, count: counts[index] };
    });
    let first = rows[0], second = rows[1];
    let largest = rows.reduce(function (best, row) {
        return row.count > best.count ? row : best;
    });
    let more = first.count > second.count ? first : second;
    let less = more === first ? second : first;
    let questions = [
        { text: `${first.label} ${topic.ask}กี่${topic.unit}`, expected: first.count * perPicture },
        { text: `${first.label}และ${second.label} ${topic.ask}รวมกันกี่${topic.unit}`, expected: (first.count + second.count) * perPicture },
        { text: `${more.label} ${topic.ask}มากกว่า${less.label}กี่${topic.unit}`, expected: (more.count - less.count) * perPicture },
        { text: `รายการที่${topic.ask}มากที่สุด ${topic.ask}กี่${topic.unit}`, expected: largest.count * perPicture },
    ];
    let question = p2Pick(questions);

    p2PictographObj.text = question.text;
    p2PictographObj.expected = question.expected;

    $('#p2PictographDisplay').html(renderPictograph(topic, rows, perPicture));
    $('#p2PictographQuestion').text(question.text);
    $('#p2PictographAnswerNumber').val('');
}

addSuggestP2PictographValue();
