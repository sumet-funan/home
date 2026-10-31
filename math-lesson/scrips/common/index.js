// Shared by the lessons, which all load after this file.
function randomInt(min, max) {
    return min + parseInt(Math.random() * (max - min + 1));
}

function pickOne(list) {
    return list[randomInt(0, list.length - 1)];
}

function shuffleList(list) {
    let shuffled = list.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = randomInt(0, i);
        let temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

// Answers with decimals are compared by value, close enough only to absorb
// binary rounding: 11.74 must not pass for 11.7.
function isSameNumber(first, second) {
    return Math.abs(first - second) < 0.000001;
}

var wordNames = ['แม่', 'พ่อ', 'น้อง', 'พี่', 'ฉัน', 'ครู'];
var wordItems = [
    { item: 'ส้ม', classifier: 'ผล' },
    { item: 'แอปเปิ้ล', classifier: 'ผล' },
    { item: 'ดินสอ', classifier: 'แท่ง' },
    { item: 'ลูกอม', classifier: 'เม็ด' },
    { item: 'หนังสือ', classifier: 'เล่ม' },
    { item: 'ดอกไม้', classifier: 'ดอก' },
    { item: 'ลูกโป่ง', classifier: 'ลูก' },
];

var compareSymbolText = { gt: '>', lt: '<', eq: '=', ne: '≠' };

function compareSymbolOf(first, second) {
    return first > second ? 'gt' : (first < second ? 'lt' : 'eq');
}

function bindSymbolPicker(pickerId, stateObj) {
    $(document).on('click', '#' + pickerId + ' .symbol-btn', function () {
        $('#' + pickerId + ' .symbol-btn').removeClass('selected');
        $(this).addClass('selected');
        stateObj.selectedSymbol = $(this).data('symbol');
    });
}

// = and ≠ are asked on their own: with the other symbols on offer, two different
// numbers would have two right answers.
function showCompareSymbols(pickerId, equalityOnly) {
    $('#' + pickerId + ' [data-symbol="gt"], #' + pickerId + ' [data-symbol="lt"]').toggle(!equalityOnly);
    $('#' + pickerId + ' [data-symbol="ne"]').toggle(equalityOnly);
}

var thaiDigits = '๐๑๒๓๔๕๖๗๘๙';
var thaiDigitWords = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];

function toThaiDigits(number) {
    return String(number).replace(/\d/g, function (digit) {
        return thaiDigits[digit];
    });
}

function numberToThaiWords(number) {
    if (number === 0) {
        return thaiDigitWords[0];
    }
    if (number === 1000) {
        return 'หนึ่งพัน';
    }

    let hundreds = Math.floor(number / 100);
    let tens = Math.floor(number / 10) % 10;
    let units = number % 10;
    let words = hundreds ? thaiDigitWords[hundreds] + 'ร้อย' : '';

    if (tens === 1) {
        words += 'สิบ';
    } else if (tens === 2) {
        words += 'ยี่สิบ';
    } else if (tens) {
        words += thaiDigitWords[tens] + 'สิบ';
    }

    if (units === 1 && number > 1) {
        words += 'เอ็ด';
    } else if (units) {
        words += thaiDigitWords[units];
    }

    return words;
}

var pictographTopics = [
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

function buildPictographQuestion(perPicture) {
    let topic = pickOne(pictographTopics);
    let labels = shuffleList(topic.categories).slice(0, 4);
    let counts = shuffleList([1, 2, 3, 4, 5, 6, 7]).slice(0, 4);
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
    let question = pickOne(questions);

    return { html: renderPictograph(topic, rows, perPicture), text: question.text, expected: question.expected };
}
