// What each lesson teaches, keyed by its tab pane. A lesson is a list of topics
// (one worked example each, offered in a picker when there is more than one),
// and a topic is a list of steps: what to say, and what to show beside it.
// Every example uses the same kind of numbers the lesson's own questions do.

const LEARN_PLACE_HEAD = ['สิบ', 'หน่วย'];
const LEARN_HUNDRED_HEAD = ['ร้อย', 'สิบ', 'หน่วย'];
const LEARN_PICTOGRAPH_TOPIC = { title: 'ผลไม้ที่นักเรียนชอบ', unit: 'คน', icon: 'bi-emoji-smile-fill' };
const LEARN_PICTOGRAPH_ROWS = [{ label: 'ส้ม', count: 4 }, { label: 'กล้วย', count: 2 }, { label: 'มะม่วง', count: 3 }];

// A written sum. `on` and `strike` count columns from the right, starting at 0;
// `carry` and `head` read left to right, like the digits they sit above.
function learnColumn(first, second, symbol, work) {
    work = work || {};
    let answer = work.answer || '';
    let carry = work.carry || [];
    let strike = work.strike || [];
    let columns = Math.max(first.length, second.length, answer.length, carry.length);

    function cells(values, rowClass, struck) {
        let html = '';
        for (let i = columns - 1; i >= 0; i--) {
            let value = values[values.length - 1 - i];
            let classes = 'lc-cell ' + rowClass;
            if (i === work.on) { classes += ' is-on'; }
            if (struck && strike.indexOf(i) !== -1) { classes += ' is-struck'; }
            if (value === '.') { classes += ' is-point'; }
            html += `<span class="${classes}">${value === undefined || value === '' ? '&nbsp;' : value}</span>`;
        }
        return html;
    }

    let head = work.head ? '<span class="lc-cell"></span>' + cells(work.head, 'lc-head') : '';

    return `<div class="learn-column" style="grid-template-columns: auto repeat(${columns}, auto);">`
        + head
        + '<span class="lc-cell"></span>' + cells(carry, 'lc-carry')
        + '<span class="lc-cell"></span>' + cells(first.split(''), '', true)
        + `<span class="lc-cell lc-symbol">${symbol}</span>` + cells(second.split(''), '')
        + '<span class="lc-cell lc-answer"></span>' + cells(answer.split(''), 'lc-answer')
        + '</div>';
}

function learnLines(lines) {
    return '<div class="learn-lines">' + lines.map(function (line) {
        return `<div>${line}</div>`;
    }).join('') + '</div>';
}

function learnFraction(numerator, denominator) {
    return `<span class="learn-frac"><span>${numerator}</span><span>${denominator}</span></span>`;
}

function learnMixed(whole, numerator, denominator) {
    return `<span class="learn-mixed">${whole}${learnFraction(numerator, denominator)}</span>`;
}

function learnDots(filled, empty) {
    let dots = '<span class="learn-dot is-filled"></span>'.repeat(filled) + '<span class="learn-dot"></span>'.repeat(empty);
    return `<div class="learn-dots">${dots}</div>`;
}

function learnSequence(terms, hop) {
    let items = terms.map(function (term, index) {
        let arrow = index === 0 ? '' : `<span class="learn-hop">${hop}</span>`;
        return `${arrow}<span class="learn-term">${term}</span>`;
    });
    return `<div class="learn-sequence">${items.join('')}</div>`;
}

function learnTensAndUnits(tens, units) {
    return `<div class="learn-blocks">
        <div class="learn-tens">${'<span></span>'.repeat(tens)}</div>
        <div class="learn-units">${'<span class="learn-dot is-filled"></span>'.repeat(units)}</div>
    </div>`;
}

function learnPlaceValue(tens, units, highlighted) {
    return `<div class="learn-places">
        <div class="${highlighted === 'tens' ? 'is-on' : ''}"><strong>${tens}</strong><span>หลักสิบ</span></div>
        <div class="${highlighted === 'units' ? 'is-on' : ''}"><strong>${units}</strong><span>หลักหน่วย</span></div>
    </div>`;
}

function learnHundreds(hundreds, tens, units, highlighted) {
    return `<div class="learn-places">
        <div class="${highlighted === 'hundreds' ? 'is-on' : ''}"><strong>${hundreds}</strong><span>หลักร้อย</span></div>
        <div class="${highlighted === 'tens' ? 'is-on' : ''}"><strong>${tens}</strong><span>หลักสิบ</span></div>
        <div class="${highlighted === 'units' ? 'is-on' : ''}"><strong>${units}</strong><span>หลักหน่วย</span></div>
    </div>`;
}

function learnPolygon(points) {
    return `<svg viewBox="0 0 120 120" width="120" height="120"><polygon class="shape-fill" points="${points}"/></svg>`;
}

function learnCompareBars(rows) {
    let largest = Math.max.apply(null, rows.map(function (row) { return row.value; }));
    return '<div class="learn-bars">' + rows.map(function (row) {
        return `<div class="learn-bar-row">
            <span class="learn-bar-label">${row.label}</span>
            <span class="learn-bar-track"><span style="width: ${row.value / largest * 100}%;"></span></span>
            <span class="learn-bar-value">${row.value} ${row.unit}</span>
        </div>`;
    }).join('') + '</div>';
}

function learnBarChart(categories, values, picked) {
    let largest = Math.max.apply(null, values);
    let bars = categories.map(function (category, index) {
        return `<div class="bar-item${picked.indexOf(index) === -1 ? ' learn-bar-dim' : ''}">
            <span class="bar-value">${values[index]}</span>
            <div class="bar-fill" style="height: ${Math.round(values[index] / largest * 100)}%;"></div>
            <span class="bar-label">${category}</span>
        </div>`;
    });
    return `<div class="bar-chart learn-chart">${bars.join('')}</div>`;
}

function learnGrid(columns, rows) {
    return `<div class="learn-grid" style="grid-template-columns: repeat(${columns}, 1fr);">${'<span></span>'.repeat(columns * rows)}</div>`;
}

function learnRectangle(top, side) {
    return `<svg viewBox="0 0 220 130" width="220" height="130" role="img" aria-label="รูปสี่เหลี่ยม">
        <rect class="shape-fill" x="50" y="25" width="130" height="80" rx="4"/>
        <text class="learn-svg-text" x="115" y="17" text-anchor="middle">${top}</text>
        <text class="learn-svg-text" x="115" y="124" text-anchor="middle">${top}</text>
        <text class="learn-svg-text" x="44" y="70" text-anchor="end">${side}</text>
        <text class="learn-svg-text" x="186" y="70">${side}</text>
    </svg>`;
}

function learnTriangle(base, height) {
    return `<svg viewBox="0 0 220 140" width="220" height="140" role="img" aria-label="รูปสามเหลี่ยม">
        <polygon class="shape-fill" points="110,12 190,112 30,112"/>
        <line class="learn-svg-line" x1="110" y1="12" x2="110" y2="112"/>
        <text class="learn-svg-text" x="116" y="72">สูง ${height}</text>
        <text class="learn-svg-text" x="110" y="132" text-anchor="middle">ฐาน ${base}</text>
    </svg>`;
}

// `total` is 90 or 180; A sits against the base line and B fills the rest
function learnAngle(total, angleA) {
    function point(degrees, radius) {
        let rad = degrees * Math.PI / 180;
        return [(110 + radius * Math.cos(rad)).toFixed(1), (120 - radius * Math.sin(rad)).toFixed(1)];
    }

    let ray = point(angleA, 100);
    let end = point(total, 100);
    let labelA = point(angleA / 2, 44);
    let labelB = point(angleA + (total - angleA) / 2, 44);

    return `<svg viewBox="0 0 220 136" width="220" height="136" role="img" aria-label="มุม A และมุม B">
        <line class="learn-svg-line" x1="110" y1="120" x2="210" y2="120"/>
        <line class="learn-svg-line" x1="110" y1="120" x2="${end[0]}" y2="${end[1]}"/>
        <line class="learn-svg-line is-accent" x1="110" y1="120" x2="${ray[0]}" y2="${ray[1]}"/>
        <text class="learn-svg-text" x="${labelA[0]}" y="${labelA[1]}" text-anchor="middle">A</text>
        <text class="learn-svg-text" x="${labelB[0]}" y="${labelB[1]}" text-anchor="middle">B</text>
    </svg>`;
}

var learnLessons = {
    content_speedquiz: [{
        title: 'วิธีเล่นแบบฝึกคำนวณเร็ว',
        steps: [
            { say: 'เลือกเครื่องหมายที่อยากฝึก แล้วเลือกโหมด <strong>ทำให้ครบ</strong> หรือ <strong>จับเวลา 1 นาที</strong>' },
            { say: 'กดเริ่มทำโจทย์ เวลาจะเริ่มเดินทันที แล้วพิมพ์คำตอบทีละข้อ' },
            { say: 'กดปุ่ม Return บนแป้นพิมพ์เพื่อไปข้อถัดไป ข้อไหนคิดไม่ออกให้ข้ามไปก่อน แล้วค่อยกลับมาทำ' },
            { say: 'ทำเสร็จแล้วดูคำตอบอีกครั้ง แล้วกดส่งคำตอบ เมื่อส่งแล้วจะแก้ไม่ได้' },
        ],
    }],

    content_p1_plus: [{
        label: 'ไม่มีทด',
        title: 'ตัวอย่าง: 23 + 14',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลัก หลักหน่วยตรงกับหลักหน่วย หลักสิบตรงกับหลักสิบ', show: learnColumn('23', '14', '+', { head: LEARN_PLACE_HEAD }) },
            { say: 'เริ่มบวกที่หลักหน่วยก่อนเสมอ 3 + 4 = 7', show: learnColumn('23', '14', '+', { head: LEARN_PLACE_HEAD, on: 0, answer: '7' }) },
            { say: 'แล้วบวกหลักสิบ 2 + 1 = 3', show: learnColumn('23', '14', '+', { head: LEARN_PLACE_HEAD, on: 1, answer: '37' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>23 + 14 = 37</strong>']) },
        ],
    }, {
        label: 'มีทด',
        title: 'ตัวอย่าง: 47 + 25',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลักเหมือนเดิม', show: learnColumn('47', '25', '+', { head: LEARN_PLACE_HEAD }) },
            { say: 'บวกหลักหน่วย 7 + 5 = 12 ได้เกิน 9 จึงเขียน 2 แล้ว<strong>ทด 1</strong> ไปไว้หลักสิบ', show: learnColumn('47', '25', '+', { head: LEARN_PLACE_HEAD, on: 0, carry: ['1', ''], answer: '2' }) },
            { say: 'บวกหลักสิบ อย่าลืมรวมตัวทดด้วย 4 + 2 + 1 = 7', show: learnColumn('47', '25', '+', { head: LEARN_PLACE_HEAD, on: 1, carry: ['1', ''], answer: '72' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>47 + 25 = 72</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'แม่มีส้ม 12 ผล ซื้อเพิ่มอีก 5 ผล แม่มีส้มทั้งหมดกี่ผล',
        steps: [
            { say: 'หาว่าโจทย์บอกอะไร และถามอะไร', show: learnLines(['มีส้ม 12 ผล', 'ซื้อเพิ่ม 5 ผล', 'ถามว่าทั้งหมดกี่ผล']) },
            { say: 'คำว่า <strong>เพิ่ม</strong> และ <strong>ทั้งหมด</strong> บอกให้เราบวก', show: learnLines(['12 + 5']) },
            { say: 'บวกแล้วตอบพร้อมบอกหน่วย', show: learnLines(['12 + 5 = 17', '<strong>ตอบ 17 ผล</strong>']) },
        ],
    }],

    content_p1_minus: [{
        label: 'ไม่กระจาย',
        title: 'ตัวอย่าง: 58 − 23',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลัก เอาจำนวนที่มากกว่าไว้ข้างบน', show: learnColumn('58', '23', '−', { head: LEARN_PLACE_HEAD }) },
            { say: 'เริ่มลบที่หลักหน่วยก่อน 8 − 3 = 5', show: learnColumn('58', '23', '−', { head: LEARN_PLACE_HEAD, on: 0, answer: '5' }) },
            { say: 'แล้วลบหลักสิบ 5 − 2 = 3', show: learnColumn('58', '23', '−', { head: LEARN_PLACE_HEAD, on: 1, answer: '35' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>58 − 23 = 35</strong>']) },
        ],
    }, {
        label: 'มีกระจาย',
        title: 'ตัวอย่าง: 52 − 27',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลัก แล้วดูหลักหน่วย 2 ลบ 7 ไม่พอ', show: learnColumn('52', '27', '−', { head: LEARN_PLACE_HEAD, on: 0 }) },
            { say: '<strong>ขอจากหลักสิบ 1 สิบ</strong> เลข 5 จึงเหลือ 4 และหลักหน่วยจาก 2 กลายเป็น 12', show: learnColumn('52', '27', '−', { head: LEARN_PLACE_HEAD, carry: ['4', '12'], strike: [0, 1] }) },
            { say: 'ลบหลักหน่วย 12 − 7 = 5', show: learnColumn('52', '27', '−', { head: LEARN_PLACE_HEAD, on: 0, carry: ['4', '12'], strike: [0, 1], answer: '5' }) },
            { say: 'ลบหลักสิบ 4 − 2 = 2', show: learnColumn('52', '27', '−', { head: LEARN_PLACE_HEAD, on: 1, carry: ['4', '12'], strike: [0, 1], answer: '25' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>52 − 27 = 25</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'พี่มีดินสอ 15 แท่ง ให้เพื่อนไป 4 แท่ง พี่เหลือดินสอกี่แท่ง',
        steps: [
            { say: 'หาว่าโจทย์บอกอะไร และถามอะไร', show: learnLines(['มีดินสอ 15 แท่ง', 'ให้เพื่อนไป 4 แท่ง', 'ถามว่าเหลือกี่แท่ง']) },
            { say: 'คำว่า <strong>ให้ไป</strong> และ <strong>เหลือ</strong> บอกให้เราลบ', show: learnLines(['15 − 4']) },
            { say: 'ลบแล้วตอบพร้อมบอกหน่วย', show: learnLines(['15 − 4 = 11', '<strong>ตอบ 11 แท่ง</strong>']) },
        ],
    }],

    content_p1_compare: [{
        label: 'หลักสิบต่างกัน',
        title: 'เปรียบเทียบ 47 กับ 52',
        steps: [
            { say: 'รู้จักเครื่องหมายก่อน ด้านที่อ้ากว้างจะหันไปหาจำนวนที่มากกว่าเสมอ', show: learnLines(['&gt; มากกว่า', '&lt; น้อยกว่า', '= เท่ากับ']) },
            { say: 'ดูหลักสิบก่อน 47 มี 4 สิบ ส่วน 52 มี 5 สิบ', show: learnTensAndUnits(4, 7) + learnTensAndUnits(5, 2) },
            { say: '4 สิบน้อยกว่า 5 สิบ ดังนั้น 47 น้อยกว่า 52', show: learnLines(['<strong>47 &lt; 52</strong>']) },
        ],
    }, {
        label: 'หลักสิบเท่ากัน',
        title: 'เปรียบเทียบ 36 กับ 31',
        steps: [
            { say: 'ดูหลักสิบก่อน ทั้งสองจำนวนมี 3 สิบเท่ากัน', show: learnLines(['<strong>3</strong>6 กับ <strong>3</strong>1']) },
            { say: 'หลักสิบเท่ากัน ให้ไปดูหลักหน่วย 6 มากกว่า 1', show: learnLines(['3<strong>6</strong> กับ 3<strong>1</strong>']) },
            { say: 'ดังนั้น 36 มากกว่า 31 ถ้าหลักหน่วยเท่ากันด้วย ให้เลือกเครื่องหมาย =', show: learnLines(['<strong>36 &gt; 31</strong>']) },
        ],
    }, {
        label: 'จำนวนหลักต่างกัน',
        title: 'เปรียบเทียบ 9 กับ 12',
        steps: [
            { say: 'นับว่าแต่ละจำนวนมีกี่หลัก 9 มี 1 หลัก ส่วน 12 มี 2 หลัก', show: learnLines(['9 → 1 หลัก', '12 → 2 หลัก']) },
            { say: 'จำนวนที่มีหลักมากกว่าจะมีค่ามากกว่าเสมอ', show: learnLines(['<strong>9 &lt; 12</strong>']) },
        ],
    }],

    content_p1_numberbond: [{
        title: 'ตัวอย่าง: 7 + ? = 10',
        steps: [
            { say: 'โจทย์อยากให้รวมกันได้ 10 ตอนนี้เรามีอยู่แล้ว 7', show: learnDots(7, 3) },
            { say: 'นับต่อจาก 7 ไปจนถึง 10 ได้ 8, 9, 10 นับไปทั้งหมด 3 ครั้ง', show: learnDots(10, 0) },
            { say: 'หรือใช้การลบก็ได้ เอาจำนวนรวมลบจำนวนที่มี', show: learnLines(['10 − 7 = 3']) },
            { say: 'ตรวจคำตอบด้วยการบวกกลับ ถ้าช่องว่างอยู่ข้างหน้า เช่น ? + 7 = 10 ก็ทำวิธีเดียวกัน', show: learnLines(['<strong>7 + 3 = 10</strong>']) },
        ],
    }],

    content_p1_pattern: [{
        label: 'เพิ่มขึ้น',
        title: 'ตัวอย่าง: 5, 10, 15, 20, ?',
        steps: [
            { say: 'ดูตัวเลข 2 ตัวแรก จาก 5 ไป 10 เพิ่มขึ้น 5', show: learnSequence([5, 10], '+5') },
            { say: 'ตรวจคู่ถัดไป ทุกคู่เพิ่มขึ้นทีละ 5 เหมือนกัน นี่คือแบบรูปของชุดนี้', show: learnSequence([5, 10, 15, 20], '+5') },
            { say: 'เอาตัวสุดท้ายบวกเพิ่มอีก 5 ก็ได้คำตอบ', show: learnLines(['20 + 5 = <strong>25</strong>']) },
        ],
    }, {
        label: 'ลดลง',
        title: 'ตัวอย่าง: 20, 18, 16, 14, ?',
        steps: [
            { say: 'ดูตัวเลข 2 ตัวแรก จาก 20 ไป 18 ลดลง 2', show: learnSequence([20, 18], '−2') },
            { say: 'ตรวจคู่ถัดไป ทุกคู่ลดลงทีละ 2 เหมือนกัน', show: learnSequence([20, 18, 16, 14], '−2') },
            { say: 'เอาตัวสุดท้ายลบออกอีก 2 ก็ได้คำตอบ', show: learnLines(['14 − 2 = <strong>12</strong>']) },
        ],
    }],

    content_p1_placevalue: [{
        title: 'ตัวอย่าง: 47',
        steps: [
            { say: 'เลขตัวขวาสุดคือ<strong>หลักหน่วย</strong> ของ 47 คือ 7', show: learnPlaceValue('4', '7', 'units') },
            { say: 'เลขตัวถัดไปทางซ้ายคือ<strong>หลักสิบ</strong> ของ 47 คือ 4', show: learnPlaceValue('4', '7', 'tens') },
            { say: 'แปลว่า 47 มี 4 สิบ กับอีก 7 หน่วย', show: learnTensAndUnits(4, 7) + learnLines(['40 + 7 = 47']) },
            { say: 'ถ้าหลักหน่วยเป็น 0 ก็ตอบ 0 ได้เลย เช่น 60 มีหลักสิบ 6 และหลักหน่วย 0', show: learnPlaceValue('6', '0', 'units') },
        ],
    }],

    content_p1_shape: [{
        title: 'รู้จักรูปเรขาคณิต 4 แบบ',
        steps: [
            { say: '<strong>วงกลม</strong> กลมทั้งรูป ไม่มีด้านตรงและไม่มีมุม', show: renderShapeSVG('circle') },
            { say: '<strong>สามเหลี่ยม</strong> มี 3 ด้าน และ 3 มุม', show: renderShapeSVG('triangle') },
            { say: '<strong>สี่เหลี่ยมจัตุรัส</strong> มี 4 ด้าน และทุกด้านยาวเท่ากัน', show: renderShapeSVG('square') },
            { say: '<strong>สี่เหลี่ยมผืนผ้า</strong> มี 4 ด้าน ด้านยาว 2 ด้าน และด้านสั้น 2 ด้าน', show: renderShapeSVG('rectangle') },
        ],
    }],

    content_p1_length: [{
        title: 'เปรียบเทียบ 45 ซม. กับ 62 ซม.',
        steps: [
            { say: 'ดูว่าหน่วยเหมือนกัน ทั้งสองเส้นวัดเป็นเซนติเมตร (ซม.) จึงเทียบตัวเลขได้เลย', show: learnCompareBars([{ label: 'เส้นแรก', value: 45, unit: 'ซม.' }, { label: 'เส้นที่สอง', value: 62, unit: 'ซม.' }]) },
            { say: 'เทียบหลักสิบก่อน 4 สิบน้อยกว่า 6 สิบ เส้นแรกจึงสั้นกว่า', show: learnLines(['<strong>45 ซม. &lt; 62 ซม.</strong>']) },
            { say: 'ถ้าตัวเลขเท่ากัน แสดงว่ายาวเท่ากัน ให้เลือกเครื่องหมาย =' },
        ],
    }],

    content_p1_weight: [{
        title: 'เปรียบเทียบ 13 กก. กับ 8 กก.',
        steps: [
            { say: 'ดูว่าหน่วยเหมือนกัน ทั้งสองถุงชั่งเป็นกิโลกรัม (กก.) จึงเทียบตัวเลขได้เลย', show: learnCompareBars([{ label: 'ถุงแรก', value: 13, unit: 'กก.' }, { label: 'ถุงที่สอง', value: 8, unit: 'กก.' }]) },
            { say: '13 มากกว่า 8 ถุงแรกจึงหนักกว่า', show: learnLines(['<strong>13 กก. &gt; 8 กก.</strong>']) },
            { say: 'ถ้าตัวเลขเท่ากัน แสดงว่าหนักเท่ากัน ให้เลือกเครื่องหมาย =' },
        ],
    }],

    content_p1_capacity: [{
        title: 'เปรียบเทียบ 7 ลิตร กับ 12 ลิตร',
        steps: [
            { say: 'ดูว่าหน่วยเหมือนกัน ทั้งสองขวดตวงเป็นลิตร จึงเทียบตัวเลขได้เลย', show: learnCompareBars([{ label: 'ขวดแรก', value: 7, unit: 'ลิตร' }, { label: 'ขวดที่สอง', value: 12, unit: 'ลิตร' }]) },
            { say: '7 น้อยกว่า 12 ขวดแรกจึงจุน้อยกว่า', show: learnLines(['<strong>7 ลิตร &lt; 12 ลิตร</strong>']) },
            { say: 'ถ้าตัวเลขเท่ากัน แสดงว่าจุเท่ากัน ให้เลือกเครื่องหมาย =' },
        ],
    }],

    content_p1_time: [{
        title: 'ดูนาฬิกาบอกเวลา',
        steps: [
            { say: 'หน้าปัดมี 12 ขีด ขีดบนสุดคือเลข 12 แล้วนับไปทางขวาเป็น 1, 2, 3 ไปเรื่อยๆ', show: renderClockSVG(12) },
            { say: 'ดูว่าเข็มชี้ที่ขีดไหน เข็มนี้ชี้ไปทางขวาตรงๆ นับจากบนสุดได้ 1, 2, 3', show: renderClockSVG(3) },
            { say: 'จึงเป็นเวลา <strong>3 นาฬิกา</strong>' },
            { say: 'จำจุดง่ายๆ ไว้ บนสุด 12 ขวา 3 ล่างสุด 6 ซ้าย 9 เข็มนี้ชี้ล่างสุด จึงเป็น 6 นาฬิกา', show: renderClockSVG(6) },
        ],
    }],

    content_p1_money: [{
        title: 'รวมเงินทั้งหมด',
        steps: [
            { say: 'ดูตัวเลขบนเหรียญและธนบัตรแต่ละอันว่ามีค่ากี่บาท', show: `<div class="money-items">${renderMoneyItems([20, 10, 5, 2])}</div>` },
            { say: 'เริ่มบวกจากค่ามากก่อน จะคิดง่ายกว่า', show: learnLines(['20 + 10 = 30']) },
            { say: 'เอาผลที่ได้บวกกับอันต่อไป', show: learnLines(['30 + 5 = 35']) },
            { say: 'บวกจนครบทุกอัน แล้วตอบเป็นบาท', show: learnLines(['35 + 2 = 37', '<strong>ตอบ 37 บาท</strong>']) },
        ],
    }],

    content_p1_wordproblem: [{
        label: 'โจทย์บวก',
        title: 'น้องเก็บดอกไม้ได้ 34 ดอก เพื่อนให้อีก 25 ดอก น้องมีดอกไม้ทั้งหมดกี่ดอก',
        steps: [
            { say: 'อ่านโจทย์แล้วหาตัวเลขและสิ่งที่ถาม', show: learnLines(['เก็บได้ 34 ดอก', 'เพื่อนให้อีก 25 ดอก', 'ถามว่าทั้งหมดกี่ดอก']) },
            { say: 'ของ<strong>เพิ่มขึ้น</strong> คำว่า อีก เพิ่ม ทั้งหมด รวม บอกให้บวก', show: learnLines(['34 + 25']) },
            { say: 'คำนวณแล้วตรวจว่าตอบตรงกับที่ถาม', show: learnLines(['34 + 25 = 59', '<strong>ตอบ 59 ดอก</strong>']) },
        ],
    }, {
        label: 'โจทย์ลบ',
        title: 'พ่อมีลูกโป่ง 48 ลูก ให้เพื่อนไป 13 ลูก พ่อเหลือลูกโป่งกี่ลูก',
        steps: [
            { say: 'อ่านโจทย์แล้วหาตัวเลขและสิ่งที่ถาม', show: learnLines(['มีลูกโป่ง 48 ลูก', 'ให้เพื่อนไป 13 ลูก', 'ถามว่าเหลือกี่ลูก']) },
            { say: 'ของ<strong>ลดลง</strong> คำว่า ให้ไป ใช้ไป เหลือ บอกให้ลบ', show: learnLines(['48 − 13']) },
            { say: 'คำนวณแล้วตรวจว่าตอบตรงกับที่ถาม', show: learnLines(['48 − 13 = 35', '<strong>ตอบ 35 ลูก</strong>']) },
        ],
    }],

    content_p2_plus: [{
        label: 'ไม่มีทด',
        title: 'ตัวอย่าง: 342 + 125',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลัก หลักร้อยตรงหลักร้อย หลักสิบตรงหลักสิบ หลักหน่วยตรงหลักหน่วย', show: learnColumn('342', '125', '+', { head: LEARN_HUNDRED_HEAD }) },
            { say: 'เริ่มบวกที่หลักหน่วยก่อน 2 + 5 = 7', show: learnColumn('342', '125', '+', { head: LEARN_HUNDRED_HEAD, on: 0, answer: '7' }) },
            { say: 'บวกหลักสิบ 4 + 2 = 6', show: learnColumn('342', '125', '+', { head: LEARN_HUNDRED_HEAD, on: 1, answer: '67' }) },
            { say: 'บวกหลักร้อย 3 + 1 = 4', show: learnColumn('342', '125', '+', { head: LEARN_HUNDRED_HEAD, on: 2, answer: '467' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>342 + 125 = 467</strong>']) },
        ],
    }, {
        label: 'มีทด',
        title: 'ตัวอย่าง: 268 + 157',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลักเหมือนเดิม', show: learnColumn('268', '157', '+', { head: LEARN_HUNDRED_HEAD }) },
            { say: 'บวกหลักหน่วย 8 + 7 = 15 เขียน 5 แล้ว<strong>ทด 1</strong> ไปหลักสิบ', show: learnColumn('268', '157', '+', { head: LEARN_HUNDRED_HEAD, on: 0, carry: ['', '1', ''], answer: '5' }) },
            { say: 'บวกหลักสิบรวมตัวทด 6 + 5 + 1 = 12 เขียน 2 แล้ว<strong>ทด 1</strong> ไปหลักร้อย', show: learnColumn('268', '157', '+', { head: LEARN_HUNDRED_HEAD, on: 1, carry: ['1', '1', ''], answer: '25' }) },
            { say: 'บวกหลักร้อยรวมตัวทด 2 + 1 + 1 = 4', show: learnColumn('268', '157', '+', { head: LEARN_HUNDRED_HEAD, on: 2, carry: ['1', '1', ''], answer: '425' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>268 + 157 = 425</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'พ่อเก็บมะม่วงได้ 125 ผล เก็บเพิ่มอีก 240 ผล พ่อมีมะม่วงทั้งหมดกี่ผล',
        steps: [
            { say: 'หาว่าโจทย์บอกอะไร และถามอะไร', show: learnLines(['มีมะม่วง 125 ผล', 'เก็บเพิ่ม 240 ผล', 'ถามว่าทั้งหมดกี่ผล']) },
            { say: 'คำว่า <strong>เพิ่ม</strong> และ <strong>ทั้งหมด</strong> บอกให้เราบวก', show: learnLines(['125 + 240']) },
            { say: 'บวกแล้วตอบพร้อมบอกหน่วย', show: learnLines(['125 + 240 = 365', '<strong>ตอบ 365 ผล</strong>']) },
        ],
    }],

    content_p2_minus: [{
        label: 'ไม่กระจาย',
        title: 'ตัวอย่าง: 586 − 243',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลัก เอาจำนวนที่มากกว่าไว้ข้างบน', show: learnColumn('586', '243', '−', { head: LEARN_HUNDRED_HEAD }) },
            { say: 'เริ่มลบที่หลักหน่วยก่อน 6 − 3 = 3', show: learnColumn('586', '243', '−', { head: LEARN_HUNDRED_HEAD, on: 0, answer: '3' }) },
            { say: 'ลบหลักสิบ 8 − 4 = 4', show: learnColumn('586', '243', '−', { head: LEARN_HUNDRED_HEAD, on: 1, answer: '43' }) },
            { say: 'ลบหลักร้อย 5 − 2 = 3', show: learnColumn('586', '243', '−', { head: LEARN_HUNDRED_HEAD, on: 2, answer: '343' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>586 − 243 = 343</strong>']) },
        ],
    }, {
        label: 'มีกระจาย',
        title: 'ตัวอย่าง: 532 − 178',
        steps: [
            { say: 'ดูหลักหน่วย 2 ลบ 8 ไม่พอ', show: learnColumn('532', '178', '−', { head: LEARN_HUNDRED_HEAD, on: 0 }) },
            { say: '<strong>ขอจากหลักสิบ 1 สิบ</strong> เลข 3 เหลือ 2 และหลักหน่วยกลายเป็น 12 แล้วลบ 12 − 8 = 4', show: learnColumn('532', '178', '−', { head: LEARN_HUNDRED_HEAD, on: 0, carry: ['', '2', '12'], strike: [0, 1], answer: '4' }) },
            { say: 'หลักสิบ 2 ลบ 7 ไม่พอ <strong>ขอจากหลักร้อย 1 ร้อย</strong> เลข 5 เหลือ 4 และหลักสิบกลายเป็น 12 แล้วลบ 12 − 7 = 5', show: learnColumn('532', '178', '−', { head: LEARN_HUNDRED_HEAD, on: 1, carry: ['4', '12', '12'], strike: [0, 1, 2], answer: '54' }) },
            { say: 'ลบหลักร้อย 4 − 1 = 3', show: learnColumn('532', '178', '−', { head: LEARN_HUNDRED_HEAD, on: 2, carry: ['4', '12', '12'], strike: [0, 1, 2], answer: '354' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>532 − 178 = 354</strong>']) },
        ],
    }, {
        label: 'กระจายข้าม 0',
        title: 'ตัวอย่าง: 502 − 167',
        steps: [
            { say: 'หลักหน่วย 2 ลบ 7 ไม่พอ แต่หลักสิบเป็น 0 ไม่มีให้ขอ', show: learnColumn('502', '167', '−', { head: LEARN_HUNDRED_HEAD, on: 0 }) },
            { say: 'จึงไป<strong>ขอจากหลักร้อยก่อน</strong> เลข 5 เหลือ 4 และหลักสิบกลายเป็น 10', show: learnColumn('502', '167', '−', { head: LEARN_HUNDRED_HEAD, carry: ['4', '10', ''], strike: [1, 2] }) },
            { say: 'แล้วขอจากหลักสิบ 1 สิบ เลข 10 เหลือ 9 และหลักหน่วยกลายเป็น 12 ลบได้ 12 − 7 = 5', show: learnColumn('502', '167', '−', { head: LEARN_HUNDRED_HEAD, on: 0, carry: ['4', '9', '12'], strike: [0, 1, 2], answer: '5' }) },
            { say: 'ลบหลักสิบ 9 − 6 = 3 แล้วลบหลักร้อย 4 − 1 = 3', show: learnColumn('502', '167', '−', { head: LEARN_HUNDRED_HEAD, carry: ['4', '9', '12'], strike: [0, 1, 2], answer: '335' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>502 − 167 = 335</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'ครูมีสมุด 350 เล่ม แจกนักเรียนไป 120 เล่ม ครูเหลือสมุดกี่เล่ม',
        steps: [
            { say: 'หาว่าโจทย์บอกอะไร และถามอะไร', show: learnLines(['มีสมุด 350 เล่ม', 'แจกไป 120 เล่ม', 'ถามว่าเหลือกี่เล่ม']) },
            { say: 'คำว่า <strong>แจกไป</strong> และ <strong>เหลือ</strong> บอกให้เราลบ', show: learnLines(['350 − 120']) },
            { say: 'ลบแล้วตอบพร้อมบอกหน่วย', show: learnLines(['350 − 120 = 230', '<strong>ตอบ 230 เล่ม</strong>']) },
        ],
    }],

    content_p2_multiply: [{
        label: 'การคูณคืออะไร',
        title: 'ตัวอย่าง: 4 × 3',
        steps: [
            { say: 'มีจุด 4 แถว แถวละ 3 จุด อยากรู้ว่ามีทั้งหมดกี่จุด', show: learnGrid(3, 4) },
            { say: 'บวกทีละแถวก็ได้ คือบวก 3 ซ้ำกัน 4 ครั้ง', show: learnLines(['3 + 3 + 3 + 3 = 12']) },
            { say: 'เขียนให้สั้นลงด้วยการคูณ อ่านว่า สี่คูณสาม', show: learnLines(['<strong>4 × 3 = 12</strong>']) },
            { say: 'สลับที่กันก็ได้ผลเท่าเดิม', show: learnLines(['3 × 4 = 12']) },
        ],
    }, {
        label: 'ไม่มีทด',
        title: 'ตัวอย่าง: 23 × 3',
        steps: [
            { say: 'เอาจำนวน 2 หลักไว้ข้างบน และจำนวน 1 หลักไว้ใต้หลักหน่วย', show: learnColumn('23', '3', '×', { head: LEARN_PLACE_HEAD }) },
            { say: 'คูณหลักหน่วยก่อน 3 × 3 = 9', show: learnColumn('23', '3', '×', { head: LEARN_PLACE_HEAD, on: 0, answer: '9' }) },
            { say: 'แล้วคูณหลักสิบ 2 × 3 = 6', show: learnColumn('23', '3', '×', { head: LEARN_PLACE_HEAD, on: 1, answer: '69' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>23 × 3 = 69</strong>']) },
        ],
    }, {
        label: 'มีทด',
        title: 'ตัวอย่าง: 47 × 3',
        steps: [
            { say: 'ตั้งเลขเหมือนเดิม', show: learnColumn('47', '3', '×', { head: LEARN_HUNDRED_HEAD }) },
            { say: 'คูณหลักหน่วย 7 × 3 = 21 เขียน 1 แล้ว<strong>ทด 2</strong> ไปหลักสิบ', show: learnColumn('47', '3', '×', { head: LEARN_HUNDRED_HEAD, on: 0, carry: ['2', ''], answer: '1' }) },
            { say: 'คูณหลักสิบก่อน 4 × 3 = 12 แล้วค่อยบวกตัวทด 12 + 2 = 14', show: learnColumn('47', '3', '×', { head: LEARN_HUNDRED_HEAD, on: 1, carry: ['2', ''], answer: '141' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>47 × 3 = 141</strong>']) },
        ],
    }],

    content_p2_divide: [{
        label: 'หารลงตัว',
        title: 'ตัวอย่าง: 12 ÷ 4',
        steps: [
            { say: 'การหารคือการแบ่งให้เท่าๆ กัน มีขนม 12 ชิ้น แบ่งให้เพื่อน 4 คน', show: learnDots(12, 0) },
            { say: 'ถามตัวเองว่า 4 คูณอะไรได้ 12', show: learnLines(['4 × □ = 12']) },
            { say: 'ท่องสูตรคูณแม่ 4 ไปเรื่อยๆ จะพบว่า 4 × 3 = 12', show: learnLines(['4 × 1 = 4', '4 × 2 = 8', '<strong>4 × 3 = 12</strong>']) },
            { say: 'ได้คนละ 3 ชิ้นพอดี ไม่เหลือเศษ เรียกว่า<strong>หารลงตัว</strong>', show: learnLines(['<strong>12 ÷ 4 = 3</strong>']) },
        ],
    }, {
        label: 'หารมีเศษ',
        title: 'ตัวอย่าง: 17 ÷ 5',
        steps: [
            { say: 'ท่องสูตรคูณแม่ 5 หาจำนวนที่ใกล้ 17 ที่สุด แต่ต้อง<strong>ไม่เกิน</strong> 17', show: learnLines(['5 × 3 = 15', '5 × 4 = 20 เกิน 17 แล้ว']) },
            { say: 'จึงใช้ 5 × 3 ผลหารคือ 3', show: learnLines(['ผลหาร = 3']) },
            { say: 'หาว่าเหลือเท่าไร เอา 17 ลบ 15', show: learnLines(['17 − 15 = 2', 'เศษ = 2']) },
            { say: 'เศษต้อง<strong>น้อยกว่าตัวหาร</strong>เสมอ 2 น้อยกว่า 5 จึงถูกต้อง', show: learnLines(['<strong>17 ÷ 5 = 3 เศษ 2</strong>']) },
            { say: 'ตรวจคำตอบด้วยการคูณกลับ แล้วบวกเศษ', show: learnLines(['5 × 3 + 2 = 17']) },
        ],
    }],

    content_p2_mixed: [{
        label: 'บวก ลบ',
        title: 'ตัวอย่าง: 120 + 45 − 30',
        steps: [
            { say: 'มีแต่บวกกับลบ ให้ทำ<strong>จากซ้ายไปขวา</strong>', show: learnLines(['120 + 45 − 30']) },
            { say: 'ทำคู่แรกก่อน', show: learnLines(['120 + 45 = 165']) },
            { say: 'เอาผลลัพธ์ไปทำต่อ', show: learnLines(['165 − 30 = 135', '<strong>ตอบ 135</strong>']) },
        ],
    }, {
        label: 'มีวงเล็บ',
        title: 'ตัวอย่าง: 200 − (50 + 30)',
        steps: [
            { say: 'ถ้ามีวงเล็บ ให้ทำ<strong>ในวงเล็บก่อน</strong>เสมอ', show: learnLines(['50 + 30 = 80']) },
            { say: 'แล้วเอาผลลัพธ์มาแทนที่วงเล็บ', show: learnLines(['200 − 80 = 120', '<strong>ตอบ 120</strong>']) },
        ],
    }, {
        label: 'คูณ หาร ด้วย',
        title: 'ตัวอย่าง: 20 − 12 ÷ 3',
        steps: [
            { say: 'ถ้ามีคูณหรือหารปนอยู่ ให้ทำ<strong>คูณหารก่อน</strong> แม้จะอยู่ข้างหลัง', show: learnLines(['12 ÷ 3 = 4']) },
            { say: 'แล้วค่อยบวกหรือลบ', show: learnLines(['20 − 4 = 16', '<strong>ตอบ 16</strong>']) },
            { say: 'จำลำดับไว้ <strong>วงเล็บ</strong> ก่อน แล้ว<strong>คูณหาร</strong> แล้วจึง<strong>บวกลบ</strong>', show: learnLines(['(2 + 3) × 4', '2 + 3 = 5', '5 × 4 = 20']) },
        ],
    }],

    content_p2_missing: [{
        label: 'บวก ลบ',
        title: 'ตัวอย่าง: □ + 25 = 60',
        steps: [
            { say: '□ คือจำนวนที่ยังไม่รู้ เมื่อบวกกับ 25 แล้วได้ 60', show: learnLines(['□ + 25 = 60']) },
            { say: 'ทำกลับกัน จากบวกเป็น<strong>ลบ</strong>', show: learnLines(['60 − 25 = 35']) },
            { say: 'ลองแทนค่าเพื่อตรวจคำตอบ', show: learnLines(['35 + 25 = 60', '<strong>□ = 35</strong>']) },
        ],
    }, {
        label: 'ลบ',
        title: 'ตัวอย่าง: 48 − □ = 20',
        steps: [
            { say: 'มี 48 เอาออกไปส่วนหนึ่งแล้วเหลือ 20', show: learnLines(['48 − □ = 20']) },
            { say: 'จำนวนที่เอาออกไป หาได้จาก 48 ลบ 20', show: learnLines(['48 − 20 = 28']) },
            { say: 'ลองแทนค่าเพื่อตรวจคำตอบ', show: learnLines(['48 − 28 = 20', '<strong>□ = 28</strong>']) },
        ],
    }, {
        label: 'คูณ หาร',
        title: 'ตัวอย่าง: □ × 4 = 28',
        steps: [
            { say: 'จำนวนที่คูณ 4 แล้วได้ 28 ทำกลับกันจากคูณเป็น<strong>หาร</strong>', show: learnLines(['28 ÷ 4 = 7']) },
            { say: 'ลองแทนค่าเพื่อตรวจคำตอบ', show: learnLines(['7 × 4 = 28', '<strong>□ = 7</strong>']) },
            { say: 'ถ้าเป็นการหาร ก็ทำกลับกันเป็น<strong>คูณ</strong> เช่น □ ÷ 3 = 6', show: learnLines(['6 × 3 = 18', '<strong>□ = 18</strong>']) },
        ],
    }],

    content_p2_placevalue: [{
        label: 'หลัก',
        title: 'ตัวอย่าง: 345',
        steps: [
            { say: 'จำนวน 3 หลัก อ่านจากซ้ายไปขวา หลักร้อย หลักสิบ หลักหน่วย', show: learnHundreds(3, 4, 5) },
            { say: 'เลข 3 อยู่หลักร้อย มีค่า 300', show: learnHundreds(3, 4, 5, 'hundreds') },
            { say: 'เลข 4 อยู่หลักสิบ มีค่า 40', show: learnHundreds(3, 4, 5, 'tens') },
            { say: 'เลข 5 อยู่หลักหน่วย มีค่า 5', show: learnHundreds(3, 4, 5, 'units') },
            { say: 'รวมกันจึงได้ 345', show: learnLines(['<strong>300 + 40 + 5 = 345</strong>']) },
        ],
    }, {
        label: 'ตัวเลขไทย',
        title: 'ตัวอย่าง: ๒๔๗',
        steps: [
            { say: 'จำตัวเลขไทยให้ได้ทั้ง 10 ตัว', show: learnLines(['๐ ๑ ๒ ๓ ๔', '0 1 2 3 4', '๕ ๖ ๗ ๘ ๙', '5 6 7 8 9']) },
            { say: 'แปลงทีละตัวจากซ้ายไปขวา', show: learnLines(['๒ คือ 2', '๔ คือ 4', '๗ คือ 7']) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>๒๔๗ = 247</strong>']) },
        ],
    }, {
        label: 'ตัวหนังสือ',
        title: 'ตัวอย่าง: สองร้อยยี่สิบเอ็ด',
        steps: [
            { say: 'แยกคำเป็นส่วนๆ ตามหลัก', show: learnLines(['สองร้อย = 200', 'ยี่สิบ = 20', 'เอ็ด = 1']) },
            { say: '<strong>ยี่สิบ</strong> คือ 20 และ<strong>เอ็ด</strong> คือเลข 1 ในหลักหน่วย', show: learnLines(['200 + 20 + 1 = 221']) },
            { say: 'ถ้าไม่มีคำว่าสิบ แปลว่าหลักสิบเป็น 0 เช่น ห้าร้อยเจ็ด', show: learnLines(['<strong>ห้าร้อยเจ็ด = 507</strong>']) },
        ],
    }],

    content_p2_compare: [{
        label: 'เปรียบเทียบ',
        title: 'ตัวอย่าง: 456 กับ 462',
        steps: [
            { say: 'เริ่มดูจาก<strong>หลักซ้ายสุด</strong> หลักร้อยเป็น 4 เท่ากัน จึงดูหลักถัดไป', show: learnColumn('456', '462', '', { head: LEARN_HUNDRED_HEAD, on: 2 }) },
            { say: 'หลักสิบ 5 น้อยกว่า 6 ตัดสินได้เลย ไม่ต้องดูหลักหน่วย', show: learnColumn('456', '462', '', { head: LEARN_HUNDRED_HEAD, on: 1 }) },
            { say: 'จึงได้ว่า 456 น้อยกว่า 462', show: learnLines(['<strong>456 &lt; 462</strong>']) },
            { say: 'จำเครื่องหมายไว้ &gt; มากกว่า, &lt; น้อยกว่า, = เท่ากับ และ ≠ ไม่เท่ากับ', show: learnLines(['462 &gt; 456', '462 ≠ 456']) },
        ],
    }, {
        label: 'เรียงลำดับ',
        title: 'เรียง 305, 350, 298, 412 จากน้อยไปมาก',
        steps: [
            { say: 'ดูหลักร้อยก่อน จำนวนที่หลักร้อยน้อยที่สุดคือ 298', show: learnSequence(['298'], '') },
            { say: 'ที่หลักร้อยเป็น 3 มีสองจำนวน ดูหลักสิบต่อ 0 น้อยกว่า 5 จึงเป็น 305 แล้ว 350', show: learnSequence(['298', '305', '350'], '') },
            { say: 'เหลือ 412 ซึ่งมากที่สุด', show: learnSequence(['298', '305', '350', '412'], '') },
            { say: 'ในแบบฝึก ให้แตะตัวเลขทีละตัวตามลำดับ ถ้าแตะผิด แตะซ้ำเพื่อเอาออกได้' },
        ],
    }],

    content_p2_length: [{
        label: 'เปรียบเทียบ',
        title: 'เปรียบเทียบ 2 ม. 35 ซม. กับ 240 ซม.',
        steps: [
            { say: 'จำไว้ว่า <strong>1 เมตร = 100 เซนติเมตร</strong> ม. ย่อมาจากเมตร ซม. ย่อมาจากเซนติเมตร', show: learnLines(['1 ม. = 100 ซม.', '2 ม. = 200 ซม.']) },
            { say: 'ทำให้เป็นหน่วยเดียวกันก่อน แปลงเมตรเป็นเซนติเมตร', show: learnLines(['2 ม. 35 ซม.', '200 + 35 = 235', '= 235 ซม.']) },
            { say: 'เทียบตัวเลขได้เลย', show: learnCompareBars([{ label: 'เส้นแรก', value: 235, unit: 'ซม.' }, { label: 'เส้นที่สอง', value: 240, unit: 'ซม.' }]) },
            { say: '235 น้อยกว่า 240', show: learnLines(['<strong>2 ม. 35 ซม. &lt; 240 ซม.</strong>']) },
        ],
    }, {
        label: 'บวก',
        title: 'เชือกยาว 2 เมตร 40 เซนติเมตร ต่อกับเชือกยาว 1 เมตร 35 เซนติเมตร',
        steps: [
            { say: 'แยกบวกทีละหน่วย เมตรบวกเมตร', show: learnLines(['2 + 1 = 3', '3 เมตร']) },
            { say: 'เซนติเมตรบวกเซนติเมตร', show: learnLines(['40 + 35 = 75', '75 เซนติเมตร']) },
            { say: 'รวมคำตอบ แล้วกรอกเลขในช่องของแต่ละหน่วย', show: learnLines(['<strong>ตอบ 3 เมตร 75 เซนติเมตร</strong>']) },
        ],
    }, {
        label: 'ลบ',
        title: 'ผ้ายาว 5 เมตร 80 เซนติเมตร ตัดออกไป 2 เมตร 30 เซนติเมตร',
        steps: [
            { say: 'คำว่า <strong>ตัดออก</strong> บอกให้เราลบ แยกลบทีละหน่วย เมตรลบเมตร', show: learnLines(['5 − 2 = 3', '3 เมตร']) },
            { say: 'เซนติเมตรลบเซนติเมตร', show: learnLines(['80 − 30 = 50', '50 เซนติเมตร']) },
            { say: 'รวมคำตอบ', show: learnLines(['<strong>ตอบ 3 เมตร 50 เซนติเมตร</strong>']) },
        ],
    }],

    content_p2_weight: [{
        label: 'หน่วยน้ำหนัก',
        title: 'กิโลกรัม ขีด และกรัม',
        steps: [
            { say: 'กก. ย่อมาจากกิโลกรัม จำความสัมพันธ์ของหน่วยไว้', show: learnLines(['1 กก. = 1000 กรัม', '1 กก. = 10 ขีด', '1 ขีด = 100 กรัม']) },
            { say: 'แปลงกิโลกรัมเป็นกรัม ตัวอย่าง 2 กก. 500 กรัม', show: learnLines(['2 กก. = 2000 กรัม', '2000 + 500 = 2500', '= 2500 กรัม']) },
            { say: 'แปลงกิโลกรัมเป็นขีด ตัวอย่าง 3 กก. 4 ขีด', show: learnLines(['3 กก. = 30 ขีด', '30 + 4 = 34', '= 34 ขีด']) },
        ],
    }, {
        label: 'เปรียบเทียบ',
        title: 'เปรียบเทียบ 3 กก. 4 ขีด กับ 36 ขีด',
        steps: [
            { say: 'ทำให้เป็นหน่วยเดียวกันก่อน', show: learnLines(['3 กก. 4 ขีด', '30 + 4 = 34', '= 34 ขีด']) },
            { say: 'เทียบตัวเลขได้เลย', show: learnCompareBars([{ label: 'ถุงแรก', value: 34, unit: 'ขีด' }, { label: 'ถุงที่สอง', value: 36, unit: 'ขีด' }]) },
            { say: '34 น้อยกว่า 36', show: learnLines(['<strong>3 กก. 4 ขีด &lt; 36 ขีด</strong>']) },
        ],
    }, {
        label: 'บวก ลบ',
        title: 'ข้าวสารหนัก 2 กิโลกรัม 300 กรัม ถั่วเขียวหนัก 1 กิโลกรัม 450 กรัม รวมกันหนักเท่าไร',
        steps: [
            { say: 'คำว่า <strong>รวมกัน</strong> บอกให้เราบวก แยกบวกทีละหน่วย', show: learnLines(['2 + 1 = 3', '3 กิโลกรัม']) },
            { say: 'กรัมบวกกรัม', show: learnLines(['300 + 450 = 750', '750 กรัม']) },
            { say: 'รวมคำตอบ', show: learnLines(['<strong>ตอบ 3 กิโลกรัม 750 กรัม</strong>']) },
            { say: 'ถ้าโจทย์ให้ลบ ก็แยกลบทีละหน่วยเหมือนกัน หน่วยใหญ่ลบหน่วยใหญ่ หน่วยเล็กลบหน่วยเล็ก' },
        ],
    }],

    content_p2_capacity: [{
        label: 'เปรียบเทียบ',
        title: 'เปรียบเทียบ 45 ลิตร กับ 54 ลิตร',
        steps: [
            { say: 'ลิตรเป็นหน่วยบอกว่าภาชนะจุได้มากแค่ไหน หน่วยเหมือนกันจึงเทียบตัวเลขได้เลย', show: learnCompareBars([{ label: 'ถังแรก', value: 45, unit: 'ลิตร' }, { label: 'ถังที่สอง', value: 54, unit: 'ลิตร' }]) },
            { say: 'ดูหลักสิบก่อน 4 น้อยกว่า 5', show: learnLines(['<strong>45 ลิตร &lt; 54 ลิตร</strong>']) },
            { say: 'ถ้าตัวเลขเท่ากัน แสดงว่าจุเท่ากัน ให้เลือกเครื่องหมาย =' },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'มีขวดน้ำ 5 ขวด ขวดละ 3 ลิตร มีน้ำทั้งหมดกี่ลิตร',
        steps: [
            { say: 'หาว่าโจทย์บอกอะไร และถามอะไร', show: learnLines(['มี 5 ขวด', 'ขวดละ 3 ลิตร', 'ถามว่าทั้งหมดกี่ลิตร']) },
            { say: 'คำว่า <strong>ขวดละ</strong> บอกว่าทุกขวดเท่ากัน จึงใช้การคูณ', show: learnLines(['5 × 3 = 15']) },
            { say: 'ตอบพร้อมบอกหน่วย', show: learnLines(['<strong>ตอบ 15 ลิตร</strong>']) },
            { say: 'โจทย์อื่นดูคำในโจทย์ <strong>เติมอีก</strong> ใช้บวก <strong>ใช้ไป เหลือ มากกว่า</strong> ใช้ลบ' },
        ],
    }],

    content_p2_time: [{
        label: 'ดูนาฬิกา',
        title: 'ตัวอย่าง: 8 นาฬิกา 25 นาที',
        steps: [
            { say: 'นาฬิกามี 2 เข็ม <strong>เข็มสั้นบอกชั่วโมง</strong> <strong>เข็มยาวบอกนาที</strong>', show: renderP2ClockSVG(8, 25) },
            { say: 'ดูเข็มสั้นก่อน เข็มเดินเลยเลข 8 ไปแล้วแต่ยังไม่ถึงเลข 9 จึงเป็น 8 นาฬิกา', show: renderP2ClockSVG(8, 25) },
            { say: 'ดูเข็มยาว นับทีละ 5 จากเลข 12 ที่เลข 1 ได้ 5 นาที เลข 2 ได้ 10 นาที เข็มชี้เลข 5 จึงได้ 25 นาที', show: learnSequence(['5', '10', '15', '20', '25'], '') },
            { say: 'ได้คำตอบแล้ว เขียนย่อได้เป็น 8.25 น.', show: learnLines(['<strong>8 นาฬิกา 25 นาที</strong>']) },
            { say: 'ถ้าเข็มยาวชี้เลข 12 แปลว่า 0 นาที ให้กรอก 0 ในช่องนาที', show: renderP2ClockSVG(3, 0) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'น้องทำการบ้าน 30 นาที แล้วอ่านหนังสือต่ออีก 15 นาที น้องใช้เวลาทั้งหมดกี่นาที',
        steps: [
            { say: 'ดูว่าหน่วยเหมือนกันไหม ทั้งสองอย่างเป็นนาที จึงคิดได้เลย', show: learnLines(['ทำการบ้าน 30 นาที', 'อ่านหนังสือ 15 นาที']) },
            { say: 'คำว่า <strong>ทั้งหมด</strong> บอกให้เราบวก', show: learnLines(['30 + 15 = 45', '<strong>ตอบ 45 นาที</strong>']) },
            { say: 'ถ้าโจทย์บอกเวลาเริ่มและเวลาจบ ให้เอาเวลาจบลบเวลาเริ่ม เช่น เริ่ม 8 นาฬิกา จบ 11 นาฬิกา', show: learnLines(['11 − 8 = 3', '<strong>ตอบ 3 ชั่วโมง</strong>']) },
        ],
    }],

    content_p2_shape: [{
        label: 'รูปหลายเหลี่ยม',
        title: 'ดูชื่อรูปจากจำนวนด้าน',
        steps: [
            { say: 'รูปหลายเหลี่ยมมีด้านเป็นเส้นตรง จุดที่สองด้านมาชนกันเรียกว่า<strong>มุม</strong> รูปนี้มี 3 ด้าน 3 มุม จึงเป็นรูปสามเหลี่ยม', show: learnPolygon('60,10 110,110 10,110') },
            { say: 'มี 4 ด้าน 4 มุม เป็นรูปสี่เหลี่ยม ไม่ว่าจะเอียงแบบไหน', show: learnPolygon('30,20 110,30 90,105 15,85') },
            { say: 'มี 5 ด้าน 5 มุม เป็นรูปห้าเหลี่ยม', show: learnPolygon('60,8 112,46 92,110 28,110 8,46') },
            { say: 'มี 6 ด้าน 6 มุม เป็นรูปหกเหลี่ยม', show: learnPolygon('35,12 85,12 112,60 85,108 35,108 8,60') },
        ],
    }, {
        label: 'วงกลม',
        title: 'รูปวงกลมต่างจากรูปหลายเหลี่ยมอย่างไร',
        steps: [
            { say: 'รูปวงกลมมีขอบเป็นเส้นโค้งตลอด จึง<strong>ไม่มีด้าน</strong>และ<strong>ไม่มีมุม</strong>', show: renderP2ShapeSVG('circle') },
            { say: 'จำง่ายๆ มีมุมคือรูปหลายเหลี่ยม ไม่มีมุมและกลมตลอดคือรูปวงกลม' },
        ],
    }, {
        label: 'นับด้าน',
        title: 'นับด้านไม่ให้ซ้ำ',
        steps: [
            { say: 'เลือกมุมหนึ่งเป็นจุดเริ่ม แล้วนับด้านเรียงไปรอบรูปจนกลับมาที่เดิม', show: learnPolygon('20,15 100,25 112,80 55,112 10,75') },
            { say: 'รูปนี้นับได้ 5 ด้าน และรูปหลายเหลี่ยมมีจำนวนมุมเท่ากับจำนวนด้านเสมอ', show: learnLines(['<strong>5 ด้าน 5 มุม</strong>', 'รูปห้าเหลี่ยม']) },
        ],
    }],

    content_p2_pictograph: [{
        label: 'อ่านแผนภูมิ',
        title: 'ผลไม้ที่นักเรียนชอบ',
        steps: [
            { say: 'แผนภูมิรูปภาพใช้รูปแทนจำนวน ดูชื่อเรื่องและรายการก่อน', show: renderPictograph(LEARN_PICTOGRAPH_TOPIC, LEARN_PICTOGRAPH_ROWS, 5) },
            { say: 'สำคัญที่สุดคือดูบรรทัดล่าง <strong>1 รูป แทน 5 คน</strong> รูปหนึ่งจึงไม่ได้แปลว่าคนเดียว', show: learnLines(['1 รูป = 5 คน']) },
            { say: 'ส้มมี 4 รูป นับจำนวนรูปแล้วคูณด้วย 5', show: learnLines(['4 × 5 = 20', '<strong>ชอบส้ม 20 คน</strong>']) },
        ],
    }, {
        label: 'รวมและเปรียบเทียบ',
        title: 'ส้มกับกล้วย',
        steps: [
            { say: 'ถามว่า<strong>รวมกัน</strong> ส้ม 4 รูป กล้วย 2 รูป รวม 6 รูป', show: learnLines(['4 + 2 = 6', '6 × 5 = 30', '<strong>รวม 30 คน</strong>']) },
            { say: 'ถามว่า<strong>มากกว่ากี่คน</strong> ส้มมีมากกว่ากล้วย 2 รูป', show: learnLines(['4 − 2 = 2', '2 × 5 = 10', '<strong>มากกว่า 10 คน</strong>']) },
            { say: 'ถ้ารูปหนึ่งแทน 2 หรือ 10 ก็เปลี่ยนตัวคูณให้ตรงกับบรรทัดล่าง' },
        ],
    }],

    content_p2_wordproblem: [{
        label: 'บวก ลบ',
        title: 'แม่มีส้ม 120 ผล ซื้อเพิ่มอีก 35 ผล แล้วแบ่งให้เพื่อน 40 ผล แม่เหลือส้มกี่ผล',
        steps: [
            { say: 'โจทย์นี้มี 2 ขั้น อ่านให้ครบแล้วแยกว่าเกิดอะไรขึ้นก่อน-หลัง', show: learnLines(['ขั้นที่ 1: ซื้อเพิ่ม', 'ขั้นที่ 2: แบ่งให้เพื่อน']) },
            { say: 'ขั้นที่ 1 คำว่า <strong>เพิ่ม</strong> ให้บวก', show: learnLines(['120 + 35 = 155']) },
            { say: 'ขั้นที่ 2 เอาผลลัพธ์มาทำต่อ คำว่า <strong>แบ่งให้</strong> และ <strong>เหลือ</strong> ให้ลบ', show: learnLines(['155 − 40 = 115']) },
            { say: 'ตอบพร้อมบอกหน่วย', show: learnLines(['<strong>ตอบ 115 ผล</strong>']) },
        ],
    }, {
        label: 'คูณ แล้วบวก',
        title: 'ครูมีดินสอ 4 กล่อง กล่องละ 12 แท่ง และมีอีก 5 แท่ง ครูมีดินสอทั้งหมดกี่แท่ง',
        steps: [
            { say: 'ขั้นที่ 1 คำว่า <strong>กล่องละ</strong> แปลว่าทุกกล่องเท่ากัน ให้คูณ', show: learnLines(['4 × 12 = 48']) },
            { say: 'ขั้นที่ 2 คำว่า <strong>มีอีก</strong> ให้บวกเพิ่ม', show: learnLines(['48 + 5 = 53']) },
            { say: 'ตอบพร้อมบอกหน่วย', show: learnLines(['<strong>ตอบ 53 แท่ง</strong>']) },
        ],
    }, {
        label: 'หาร แล้วลบ',
        title: 'พ่อมีส้ม 24 ผล แบ่งใส่ 6 กล่อง กล่องละเท่าๆ กัน แล้วหยิบออกจากกล่องหนึ่ง 1 ผล กล่องนั้นเหลือส้มกี่ผล',
        steps: [
            { say: 'ขั้นที่ 1 คำว่า <strong>แบ่งเท่าๆ กัน</strong> ให้หาร', show: learnLines(['24 ÷ 6 = 4']) },
            { say: 'ขั้นที่ 2 คำว่า <strong>หยิบออก</strong> ให้ลบ', show: learnLines(['4 − 1 = 3']) },
            { say: 'ตอบพร้อมบอกหน่วย', show: learnLines(['<strong>ตอบ 3 ผล</strong>']) },
        ],
    }],

    content_p5_decimal: [{
        label: '+',
        title: 'ตัวอย่าง: 12.5 + 3.8',
        steps: [
            { say: 'ตั้งเลขให้<strong>จุดทศนิยมตรงกัน</strong> เลขทุกหลักจะตรงกันเอง', show: learnColumn('12.5', ' 3.8', '+') },
            { say: 'บวกจากขวาสุด 5 + 8 = 13 เขียน 3 แล้วทด 1', show: learnColumn('12.5', ' 3.8', '+', { on: 0, carry: ['', '1', '', ''], answer: '.3' }) },
            { say: 'บวกหลักหน่วย 2 + 3 + 1 = 6 แล้วบวกหลักสิบ 1', show: learnColumn('12.5', ' 3.8', '+', { on: 2, carry: ['', '1', '', ''], answer: '16.3' }) },
            { say: 'ใส่จุดทศนิยมให้ตรงกับข้างบน', show: learnLines(['<strong>12.5 + 3.8 = 16.3</strong>']) },
        ],
    }, {
        label: '−',
        title: 'ตัวอย่าง: 15.4 − 3.7',
        steps: [
            { say: 'ตั้งเลขให้<strong>จุดทศนิยมตรงกัน</strong>', show: learnColumn('15.4', ' 3.7', '−') },
            { say: '4 ลบ 7 ไม่พอ ขอจากเลข 5 ทำให้ 5 เหลือ 4 และ 4 กลายเป็น 14', show: learnColumn('15.4', ' 3.7', '−', { on: 0, carry: ['', '4', '', '14'], strike: [0, 2] }) },
            { say: 'ลบจากขวาไปซ้าย 14 − 7 = 7 ต่อมา 4 − 3 = 1 และหลักสิบเหลือ 1', show: learnColumn('15.4', ' 3.7', '−', { carry: ['', '4', '', '14'], strike: [0, 2], answer: '11.7' }) },
            { say: 'ใส่จุดทศนิยมให้ตรงกับข้างบน', show: learnLines(['<strong>15.4 − 3.7 = 11.7</strong>']) },
        ],
    }, {
        label: '×',
        title: 'ตัวอย่าง: 4.6 × 3',
        steps: [
            { say: 'ลืมจุดทศนิยมไปก่อน แล้วคูณเหมือนจำนวนเต็ม', show: learnLines(['46 × 3 = 138']) },
            { say: 'นับว่าตัวตั้งมีทศนิยมกี่ตำแหน่ง 4.6 มี 1 ตำแหน่ง', show: learnLines(['4<strong>.6</strong> → 1 ตำแหน่ง']) },
            { say: 'ใส่จุดในคำตอบให้มีทศนิยมเท่ากัน นับจากขวามา 1 ตำแหน่ง', show: learnLines(['138 → 13.8', '<strong>4.6 × 3 = 13.8</strong>']) },
        ],
    }, {
        label: '÷',
        title: 'ตัวอย่าง: 12.6 ÷ 3',
        steps: [
            { say: 'ตัวหารเป็นจำนวนเต็ม จึงลืมจุดของตัวตั้งไปก่อน แล้วหารเหมือนจำนวนเต็ม', show: learnLines(['126 ÷ 3 = 42']) },
            { say: 'จุดในคำตอบอยู่ตรงกับจุดของตัวตั้ง 12.6 มีทศนิยม 1 ตำแหน่ง คำตอบจึงมี 1 ตำแหน่ง', show: learnLines(['42 → 4.2']) },
            { say: 'ตรวจคำตอบด้วยการคูณกลับ', show: learnLines(['4.2 × 3 = 12.6', '<strong>12.6 ÷ 3 = 4.2</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'มานีซื้อกระเป๋าราคา 45.5 บาท และซื้อเสื้อราคา 20.2 บาท มานีจ่ายเงินทั้งหมดกี่บาท',
        steps: [
            { say: 'หาตัวเลขและสิ่งที่ถาม', show: learnLines(['กระเป๋า 45.5 บาท', 'เสื้อ 20.2 บาท', 'ถามว่าจ่ายทั้งหมดกี่บาท']) },
            { say: 'คำว่า <strong>ทั้งหมด</strong> บอกให้บวก แล้วตั้งจุดให้ตรงกัน', show: learnColumn('45.5', '20.2', '+', { answer: '65.7' }) },
            { say: 'ตอบพร้อมบอกหน่วย', show: learnLines(['<strong>ตอบ 65.7 บาท</strong>']) },
        ],
    }],

    content_p5_percentage: [{
        label: 'คิดด้วยเศษส่วน',
        title: 'ตัวอย่าง: ร้อยละ 25 ของ 80',
        steps: [
            { say: 'ร้อยละ 25 แปลว่า 25 ส่วนใน 100 ส่วน', show: learnLines([`ร้อยละ 25 = ${learnFraction(25, 100)}`]) },
            { say: 'คำว่า <strong>ของ</strong> แปลว่าคูณ', show: learnLines([`${learnFraction(25, 100)} × 80`]) },
            { say: 'คูณก่อนแล้วค่อยหารด้วย 100', show: learnLines(['25 × 80 = 2000', '2000 ÷ 100 = 20', '<strong>ร้อยละ 25 ของ 80 = 20</strong>']) },
        ],
    }, {
        label: 'ทางลัด',
        title: 'จำทางลัดของร้อยละที่เจอบ่อย',
        steps: [
            { say: 'ร้อยละเหล่านี้หารได้เลย ไม่ต้องคูณ', show: learnLines(['ร้อยละ 50 → ÷ 2', 'ร้อยละ 25 → ÷ 4', 'ร้อยละ 20 → ÷ 5', 'ร้อยละ 10 → ÷ 10', 'ร้อยละ 5 → ÷ 20']) },
            { say: 'เช่น ร้อยละ 25 ของ 80 เอา 80 หารด้วย 4 ก็ได้คำตอบเลย', show: learnLines(['80 ÷ 4 = <strong>20</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'ในโรงเรียนมีนักเรียน 200 คน เป็นนักเรียนหญิงร้อยละ 20 มีนักเรียนหญิงกี่คน',
        steps: [
            { say: 'หาว่าร้อยละนี้เป็นของจำนวนอะไร', show: learnLines(['ร้อยละ 20 ของ 200 คน']) },
            { say: 'ใช้ทางลัด ร้อยละ 20 คือหารด้วย 5', show: learnLines(['200 ÷ 5 = 40']) },
            { say: 'ตอบพร้อมบอกหน่วย', show: learnLines(['<strong>ตอบ 40 คน</strong>']) },
        ],
    }],

    content_p5_fraction: [{
        label: '+',
        title: `ตัวอย่าง: ${learnFraction(1, 4)} + ${learnFraction(2, 3)}`,
        steps: [
            { say: 'ตัวส่วนไม่เท่ากัน บวกทันทีไม่ได้ ต้องทำให้ตัวส่วนเท่ากันก่อน หา ค.ร.น. ของ 4 และ 3 ได้ 12', show: learnLines(['ส่วนร่วม = 12']) },
            { say: 'เปลี่ยนเศษส่วนให้มีตัวส่วนเป็น 12 คูณทั้งเศษและส่วนด้วยจำนวนเดียวกัน', show: learnLines([`${learnFraction(1, 4)} = ${learnFraction('1 × 3', '4 × 3')} = ${learnFraction(3, 12)}`, `${learnFraction(2, 3)} = ${learnFraction('2 × 4', '3 × 4')} = ${learnFraction(8, 12)}`]) },
            { say: 'บวกเฉพาะตัวเศษ ตัวส่วนคงเดิม', show: learnLines([`${learnFraction(3, 12)} + ${learnFraction(8, 12)} = <strong>${learnFraction(11, 12)}</strong>`]) },
        ],
    }, {
        label: '−',
        title: `ตัวอย่าง: ${learnFraction(3, 4)} − ${learnFraction(1, 6)}`,
        steps: [
            { say: 'ทำตัวส่วนให้เท่ากันก่อน ค.ร.น. ของ 4 และ 6 คือ 12', show: learnLines(['ส่วนร่วม = 12']) },
            { say: 'เปลี่ยนเศษส่วนให้มีตัวส่วนเป็น 12', show: learnLines([`${learnFraction(3, 4)} = ${learnFraction('3 × 3', '4 × 3')} = ${learnFraction(9, 12)}`, `${learnFraction(1, 6)} = ${learnFraction('1 × 2', '6 × 2')} = ${learnFraction(2, 12)}`]) },
            { say: 'ลบเฉพาะตัวเศษ ตัวส่วนคงเดิม', show: learnLines([`${learnFraction(9, 12)} − ${learnFraction(2, 12)} = <strong>${learnFraction(7, 12)}</strong>`]) },
        ],
    }, {
        label: '×',
        title: `ตัวอย่าง: ${learnFraction(2, 3)} × ${learnFraction(3, 4)}`,
        steps: [
            { say: 'การคูณไม่ต้องทำตัวส่วนให้เท่ากัน เอาเศษคูณเศษ และส่วนคูณส่วนได้เลย', show: learnLines([`${learnFraction('2 × 3', '3 × 4')} = ${learnFraction(6, 12)}`]) },
            { say: 'ทำให้เป็นเศษส่วนอย่างต่ำ หารทั้งเศษและส่วนด้วย 6', show: learnLines([`${learnFraction('6 ÷ 6', '12 ÷ 6')} = <strong>${learnFraction(1, 2)}</strong>`]) },
            { say: 'แอปนี้นับ 6/12 ว่าถูกเหมือนกัน แต่ควรฝึกทำให้เป็นอย่างต่ำไว้เสมอ' },
        ],
    }, {
        label: '÷',
        title: `ตัวอย่าง: ${learnFraction(3, 4)} ÷ ${learnFraction(2, 5)}`,
        steps: [
            { say: 'เปลี่ยนหารเป็นคูณ แล้ว<strong>กลับเศษเป็นส่วน</strong>ของตัวหลัง', show: learnLines([`${learnFraction(3, 4)} × ${learnFraction(5, 2)}`]) },
            { say: 'เอาเศษคูณเศษ และส่วนคูณส่วน', show: learnLines([`${learnFraction('3 × 5', '4 × 2')} = <strong>${learnFraction(15, 8)}</strong>`]) },
            { say: 'ตัวเศษมากกว่าตัวส่วนได้ เรียกว่าเศษเกิน ตอบแบบนี้ได้เลย' },
        ],
    }],

    content_p5_gcflcm: [{
        label: 'ห.ร.ม.',
        title: 'หา ห.ร.ม. ของ 12 และ 18',
        steps: [
            { say: '<strong>ห.ร.ม.</strong> คือตัวหารร่วมที่มากที่สุด เริ่มจากหาจำนวนที่หารแต่ละตัวได้ลงตัว', show: learnLines(['12 → 1, 2, 3, 4, 6, 12', '18 → 1, 2, 3, 6, 9, 18']) },
            { say: 'เลือกตัวที่อยู่ทั้งสองแถว นี่คือตัวหารร่วม', show: learnLines(['1, 2, 3, 6']) },
            { say: 'ตัวที่มากที่สุดคือคำตอบ', show: learnLines(['<strong>ห.ร.ม. = 6</strong>']) },
        ],
    }, {
        label: 'ค.ร.น.',
        title: 'หา ค.ร.น. ของ 4 และ 6',
        steps: [
            { say: '<strong>ค.ร.น.</strong> คือตัวคูณร่วมที่น้อยที่สุด เริ่มจากเขียนผลคูณของแต่ละจำนวน', show: learnLines(['4 → 4, 8, 12, 16, 20, 24', '6 → 6, 12, 18, 24, 30']) },
            { say: 'เลือกตัวที่อยู่ทั้งสองแถว นี่คือตัวคูณร่วม', show: learnLines(['12, 24']) },
            { say: 'ตัวที่น้อยที่สุดคือคำตอบ', show: learnLines(['<strong>ค.ร.น. = 12</strong>']) },
        ],
    }, {
        label: 'ตั้งหาร',
        title: 'หาทั้งสองค่าของ 12 และ 18 ด้วยการตั้งหาร',
        steps: [
            { say: 'หาจำนวนที่หารทั้งสองตัวลงตัว เช่น 2 แล้วเขียนผลหารไว้ข้างล่าง', show: learnLines(['2 ) 12, 18', '&nbsp;&nbsp;&nbsp;&nbsp;6, 9']) },
            { say: 'หารต่อไปจนไม่มีจำนวนไหนหารทั้งคู่ลงตัว นอกจาก 1', show: learnLines(['2 ) 12, 18', '3 ) 6, 9', '&nbsp;&nbsp;&nbsp;&nbsp;2, 3']) },
            { say: '<strong>ห.ร.ม.</strong> เอาตัวหารด้านซ้ายมาคูณกัน', show: learnLines(['2 × 3 = <strong>6</strong>']) },
            { say: '<strong>ค.ร.น.</strong> เอาตัวหารด้านซ้ายคูณกับเลขแถวล่างสุดทุกตัว', show: learnLines(['2 × 3 × 2 × 3 = <strong>36</strong>']) },
        ],
    }],

    content_p5_mixednumber: [{
        label: '+',
        title: `ตัวอย่าง: ${learnMixed(2, 1, 4)} + ${learnMixed(1, 1, 2)}`,
        steps: [
            { say: 'เปลี่ยนจำนวนคละเป็นเศษเกินก่อน เอาจำนวนเต็มคูณตัวส่วน แล้วบวกตัวเศษ', show: learnLines([`${learnMixed(2, 1, 4)} = ${learnFraction('(2 × 4) + 1', 4)} = ${learnFraction(9, 4)}`, `${learnMixed(1, 1, 2)} = ${learnFraction('(1 × 2) + 1', 2)} = ${learnFraction(3, 2)}`]) },
            { say: 'ทำตัวส่วนให้เท่ากัน แล้วบวกตัวเศษ', show: learnLines([`${learnFraction(9, 4)} + ${learnFraction(6, 4)} = ${learnFraction(15, 4)}`]) },
            { say: 'เปลี่ยนกลับเป็นจำนวนคละ 15 ÷ 4 = 3 เศษ 3', show: learnLines([`<strong>${learnMixed(3, 3, 4)}</strong>`]) },
        ],
    }, {
        label: '−',
        title: `ตัวอย่าง: ${learnMixed(3, 1, 2)} − ${learnMixed(1, 1, 4)}`,
        steps: [
            { say: 'เปลี่ยนจำนวนคละเป็นเศษเกินก่อน', show: learnLines([`${learnMixed(3, 1, 2)} = ${learnFraction(7, 2)}`, `${learnMixed(1, 1, 4)} = ${learnFraction(5, 4)}`]) },
            { say: 'ทำตัวส่วนให้เท่ากัน แล้วลบตัวเศษ', show: learnLines([`${learnFraction(14, 4)} − ${learnFraction(5, 4)} = ${learnFraction(9, 4)}`]) },
            { say: 'เปลี่ยนกลับเป็นจำนวนคละ 9 ÷ 4 = 2 เศษ 1 ถ้าคำตอบไม่ถึง 1 ให้ใส่ 0 ในช่องจำนวนเต็ม', show: learnLines([`<strong>${learnMixed(2, 1, 4)}</strong>`]) },
        ],
    }, {
        label: '×',
        title: `ตัวอย่าง: ${learnMixed(1, 1, 2)} × ${learnMixed(2, 1, 3)}`,
        steps: [
            { say: 'เปลี่ยนจำนวนคละเป็นเศษเกินก่อน', show: learnLines([`${learnFraction(3, 2)} × ${learnFraction(7, 3)}`]) },
            { say: 'เอาเศษคูณเศษ และส่วนคูณส่วน', show: learnLines([`${learnFraction('3 × 7', '2 × 3')} = ${learnFraction(21, 6)}`]) },
            { say: 'เปลี่ยนกลับเป็นจำนวนคละ 21 ÷ 6 = 3 เศษ 3 และ 3/6 ทำให้เป็นอย่างต่ำได้ 1/2', show: learnLines([`<strong>${learnMixed(3, 1, 2)}</strong>`]) },
        ],
    }, {
        label: '÷',
        title: `ตัวอย่าง: ${learnMixed(2, 1, 2)} ÷ ${learnMixed(1, 1, 4)}`,
        steps: [
            { say: 'เปลี่ยนจำนวนคละเป็นเศษเกินก่อน', show: learnLines([`${learnFraction(5, 2)} ÷ ${learnFraction(5, 4)}`]) },
            { say: 'เปลี่ยนหารเป็นคูณ แล้วกลับเศษเป็นส่วนของตัวหลัง', show: learnLines([`${learnFraction(5, 2)} × ${learnFraction(4, 5)} = ${learnFraction(20, 10)}`]) },
            { say: '20 ÷ 10 = 2 พอดี ถ้าไม่มีเศษ ให้ใส่จำนวนเต็ม 2 ตัวเศษ 0 และตัวส่วน 1', show: learnLines(['<strong>2</strong>']) },
        ],
    }],

    content_p5_geometry: [{
        label: 'พื้นที่สี่เหลี่ยม',
        title: 'สี่เหลี่ยมผืนผ้า กว้าง 5 หน่วย ยาว 8 หน่วย',
        steps: [
            { say: 'พื้นที่คือจำนวนช่องตารางที่อยู่ข้างในรูป รูปนี้มี 5 แถว แถวละ 8 ช่อง', show: learnGrid(8, 5) },
            { say: 'ไม่ต้องนับทีละช่อง ใช้สูตรคูณได้เลย', show: learnLines(['พื้นที่ = กว้าง × ยาว', '5 × 8 = <strong>40 ตารางหน่วย</strong>']) },
            { say: 'ถ้าเป็นสี่เหลี่ยมจัตุรัส ทุกด้านยาวเท่ากัน เอาด้านคูณด้าน เช่น ด้านยาว 6 หน่วย', show: learnLines(['6 × 6 = <strong>36 ตารางหน่วย</strong>']) },
        ],
    }, {
        label: 'รอบรูป',
        title: 'สี่เหลี่ยมผืนผ้า กว้าง 5 หน่วย ยาว 8 หน่วย',
        steps: [
            { say: 'ความยาวรอบรูปคือระยะทางเดินรอบรูปจนครบ เอาทุกด้านมาบวกกัน', show: learnRectangle('ยาว 8', 'กว้าง 5') },
            { say: 'มีด้านกว้าง 2 ด้าน และด้านยาว 2 ด้าน จึงบวกกันแล้วคูณ 2', show: learnLines(['2 × (5 + 8)', '2 × 13 = <strong>26 หน่วย</strong>']) },
            { say: 'ถ้าเป็นสี่เหลี่ยมจัตุรัส มี 4 ด้านเท่ากัน เอาด้านคูณ 4 เช่น ด้านยาว 6 หน่วย', show: learnLines(['4 × 6 = <strong>24 หน่วย</strong>']) },
        ],
    }, {
        label: 'พื้นที่สามเหลี่ยม',
        title: 'สามเหลี่ยม ฐานยาว 10 หน่วย สูง 7 หน่วย',
        steps: [
            { say: 'หาฐานและความสูง ความสูงคือเส้นตรงจากยอดตั้งฉากลงมาที่ฐาน', show: learnTriangle(10, 7) },
            { say: 'สามเหลี่ยมมีพื้นที่ครึ่งหนึ่งของสี่เหลี่ยมที่ฐานและสูงเท่ากัน จึงคูณแล้วหารด้วย 2', show: learnLines(['พื้นที่ = ฐาน × สูง ÷ 2']) },
            { say: 'แทนค่าแล้วคำนวณ', show: learnLines(['10 × 7 = 70', '70 ÷ 2 = <strong>35 ตารางหน่วย</strong>']) },
        ],
    }],

    content_p5_volume: [{
        title: 'กล่องกว้าง 3 ยาว 4 สูง 2',
        steps: [
            { say: 'ปริมาตรคือจำนวนลูกบาศก์ที่จุอยู่ในกล่อง ใช้สูตรนี้', show: learnLines(['ปริมาตร = กว้าง × ยาว × สูง']) },
            { say: 'วางลูกบาศก์ชั้นล่างก่อน กว้าง 3 ยาว 4 ชั้นหนึ่งจึงมี 12 ลูก', show: learnGrid(4, 3) + learnLines(['3 × 4 = 12']) },
            { say: 'กล่องสูง 2 จึงมี 2 ชั้น เอาจำนวนต่อชั้นคูณจำนวนชั้น', show: learnLines(['12 × 2 = 24']) },
            { say: 'ตอบเป็นลูกบาศก์หน่วย', show: learnLines(['<strong>3 × 4 × 2 = 24 ลูกบาศก์หน่วย</strong>']) },
        ],
    }],

    content_p5_angle: [{
        label: 'มุมประกอบมุมฉาก',
        title: 'มุม A มีขนาด 35 องศา เป็นมุมประกอบมุมฉากกับมุม B',
        steps: [
            { say: '<strong>มุมฉาก</strong> มีขนาด 90 องศา มุม A กับมุม B จึงรวมกันได้ 90 องศา', show: learnAngle(90, 35) },
            { say: 'เอา 90 ลบด้วยมุมที่รู้แล้ว', show: learnLines(['มุม B = 90 − 35', '<strong>มุม B = 55 องศา</strong>']) },
            { say: 'ตรวจคำตอบด้วยการบวกกลับ', show: learnLines(['35 + 55 = 90']) },
        ],
    }, {
        label: 'มุมประกอบมุมตรง',
        title: 'มุม A มีขนาด 120 องศา เป็นมุมประกอบมุมตรงกับมุม B',
        steps: [
            { say: '<strong>มุมตรง</strong> มีขนาด 180 องศา มุม A กับมุม B จึงรวมกันได้ 180 องศา', show: learnAngle(180, 120) },
            { say: 'เอา 180 ลบด้วยมุมที่รู้แล้ว', show: learnLines(['มุม B = 180 − 120', '<strong>มุม B = 60 องศา</strong>']) },
            { say: 'ตรวจคำตอบด้วยการบวกกลับ', show: learnLines(['120 + 60 = 180']) },
        ],
    }],

    content_p5_average: [{
        label: 'ตัวเลข',
        title: 'หาค่าเฉลี่ยของ 12, 15, 18, 15',
        steps: [
            { say: 'ค่าเฉลี่ยคือการเกลี่ยทุกจำนวนให้เท่ากัน ใช้สูตรนี้', show: learnLines(['ค่าเฉลี่ย = ผลรวม ÷ จำนวนข้อมูล']) },
            { say: 'บวกทุกจำนวนเข้าด้วยกัน', show: learnLines(['12 + 15 + 18 + 15 = 60']) },
            { say: 'นับว่ามีข้อมูลกี่ตัว ชุดนี้มี 4 ตัว แล้วเอาผลรวมหารด้วย 4', show: learnLines(['60 ÷ 4 = <strong>15</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'มานะสอบ 4 วิชา ได้คะแนน 20, 25, 30, 25 คะแนน เฉลี่ยวิชาละกี่คะแนน',
        steps: [
            { say: 'คำว่า <strong>เฉลี่ย</strong> บอกให้รวมแล้วหาร เริ่มจากรวมคะแนน', show: learnLines(['20 + 25 + 30 + 25 = 100']) },
            { say: 'โจทย์บอกว่ามี 4 วิชา จึงหารด้วย 4', show: learnLines(['100 ÷ 4 = 25']) },
            { say: 'ตอบพร้อมบอกหน่วย', show: learnLines(['<strong>ตอบ 25 คะแนน</strong>']) },
        ],
    }],

    content_p5_barchart: [{
        title: 'แผนภูมิแสดงจำนวนนักเรียนที่ชอบผลไม้แต่ละชนิด',
        steps: [
            { say: 'แต่ละแท่งคือผลไม้ 1 ชนิด ตัวเลขบนแท่งบอกจำนวนนักเรียน <strong>ส้มมี 15 คน</strong>', show: learnBarChart(['แอปเปิ้ล', 'กล้วย', 'ส้ม', 'มะม่วง'], [20, 35, 15, 30], [2]) },
            { say: 'ถ้าถามว่ามากที่สุด ให้หาแท่งที่สูงที่สุด กล้วยมี <strong>35 คน</strong>', show: learnBarChart(['แอปเปิ้ล', 'กล้วย', 'ส้ม', 'มะม่วง'], [20, 35, 15, 30], [1]) },
            { say: 'ถ้าถามว่าทั้งหมดกี่คน ให้บวกทุกแท่ง', show: learnBarChart(['แอปเปิ้ล', 'กล้วย', 'ส้ม', 'มะม่วง'], [20, 35, 15, 30], [0, 1, 2, 3]) + learnLines(['20 + 35 + 15 + 30 = <strong>100 คน</strong>']) },
            { say: 'ถ้าถามผลต่าง ให้เอาแท่งมากที่สุดลบแท่งน้อยที่สุด', show: learnBarChart(['แอปเปิ้ล', 'กล้วย', 'ส้ม', 'มะม่วง'], [20, 35, 15, 30], [1, 2]) + learnLines(['35 − 15 = <strong>20 คน</strong>']) },
        ],
    }],

    content_p5_wordproblem: [{
        label: 'เงินทอน',
        title: 'มานีมีเงิน 100.0 บาท ซื้อกระเป๋าราคา 45.5 บาท มานีจะเหลือเงินกี่บาท',
        steps: [
            { say: 'อ่านโจทย์แล้วหาตัวเลขและสิ่งที่ถาม', show: learnLines(['มีเงิน 100.0 บาท', 'จ่ายไป 45.5 บาท', 'ถามว่าเหลือกี่บาท']) },
            { say: 'คำว่า <strong>เหลือ</strong> บอกให้ลบ ตั้งจุดทศนิยมให้ตรงกัน', show: learnLines(['100.0 − 45.5']) },
            { say: 'คำนวณแล้วตอบพร้อมบอกหน่วย', show: learnLines(['100.0 − 45.5 = 54.5', '<strong>ตอบ 54.5 บาท</strong>']) },
        ],
    }, {
        label: 'ส่วนลด',
        title: 'เสื้อราคา 200 บาท ลดราคาร้อยละ 25 ราคาหลังลดเหลือกี่บาท',
        steps: [
            { say: 'โจทย์นี้มี 2 ขั้น หาส่วนลดก่อน ร้อยละ 25 คือหารด้วย 4', show: learnLines(['200 ÷ 4 = 50 บาท']) },
            { say: 'โจทย์ถามราคาหลังลด จึงเอาราคาเต็มลบส่วนลด', show: learnLines(['200 − 50 = 150']) },
            { say: 'ระวังอย่าตอบแค่ส่วนลด อ่านคำถามอีกครั้งก่อนตอบ', show: learnLines(['<strong>ตอบ 150 บาท</strong>']) },
        ],
    }, {
        label: 'พื้นที่',
        title: 'สวนรูปสี่เหลี่ยมผืนผ้ากว้าง 6 เมตร ยาว 9 เมตร มีพื้นที่กี่ตารางเมตร',
        steps: [
            { say: 'โจทย์ถาม<strong>พื้นที่</strong> ของรูปสี่เหลี่ยมผืนผ้า จึงใช้สูตรกว้างคูณยาว', show: learnLines(['พื้นที่ = กว้าง × ยาว']) },
            { say: 'แทนค่าจากโจทย์แล้วคำนวณ', show: learnLines(['6 × 9 = 54']) },
            { say: 'พื้นที่ตอบเป็นตารางเมตร', show: learnLines(['<strong>ตอบ 54 ตารางเมตร</strong>']) },
        ],
    }],
};
