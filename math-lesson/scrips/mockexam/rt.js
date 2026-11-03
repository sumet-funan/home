// RT ป.1, the reading test, laid out as the 2568 guidance sets it: reading for
// meaning (words 10 items, a sentence from a picture 5, sentences 10, a passage
// 5, 50 points) and reading aloud (20 words, then a passage of ten sentences, 50
// points). Every item is written here from word lists; none is a real paper.
//
// Two parts cannot be marked by a page the way the test marks them. Reading
// aloud is heard by a grown-up, who taps each word or sentence the child read
// right, as the examiner does. The sentence from a picture is written in the
// test; here the child puts word cards in order, so a ป.1 child need not type.
// mockexam/index.js runs the paper like the others.

// Things a ป.1 child reads, each with a picture that needs no download.
const RT_PICTURES = [
    ['ช้าง', '🐘'], ['ม้า', '🐴'], ['ปลา', '🐟'], ['ไก่', '🐔'], ['เป็ด', '🦆'], ['หมู', '🐷'],
    ['วัว', '🐮'], ['แมว', '🐱'], ['หมา', '🐶'], ['นก', '🐦'], ['ปู', '🦀'], ['กุ้ง', '🦐'],
    ['งู', '🐍'], ['ลิง', '🐒'], ['เสือ', '🐯'], ['หมี', '🐻'], ['กบ', '🐸'], ['เต่า', '🐢'],
    ['ผึ้ง', '🐝'], ['ผีเสื้อ', '🦋'], ['มด', '🐜'], ['กระต่าย', '🐰'], ['ไข่', '🥚'], ['นม', '🥛'],
    ['ข้าว', '🍚'], ['กล้วย', '🍌'], ['ส้ม', '🍊'], ['แตงโม', '🍉'], ['มะม่วง', '🥭'], ['องุ่น', '🍇'],
    ['ข้าวโพด', '🌽'], ['บ้าน', '🏠'], ['รถ', '🚗'], ['เรือ', '⛵'], ['รถไฟ', '🚆'], ['เครื่องบิน', '✈️'],
    ['จักรยาน', '🚲'], ['ร่ม', '☂️'], ['หนังสือ', '📖'], ['ดินสอ', '✏️'], ['กระเป๋า', '🎒'], ['นาฬิกา', '⏰'],
    ['ประตู', '🚪'], ['เตียง', '🛏️'], ['เก้าอี้', '🪑'], ['ดอกไม้', '🌸'], ['ต้นไม้', '🌳'], ['ดาว', '⭐'],
    ['ดวงจันทร์', '🌙'], ['ภูเขา', '⛰️'], ['ไฟ', '🔥'], ['ลูกบอล', '⚽'], ['หมวก', '👒'], ['รองเท้า', '👟'],
    ['เสื้อ', '👕'], ['มือ', '✋'], ['ฟัน', '🦷'], ['หู', '👂'],
];

// More everyday words, for reading aloud.
const RT_WORDS = ['ไป', 'มา', 'กิน', 'นอน', 'ดู', 'ฟัง', 'อ่าน', 'เขียน', 'เล่น', 'วิ่ง', 'เดิน', 'ยิ้ม',
    'ดี', 'สวย', 'ใหญ่', 'เล็ก', 'ร้อน', 'หนาว', 'แม่', 'พ่อ', 'ครู', 'เพื่อน', 'โรงเรียน', 'ห้องเรียน',
    'ตลาด', 'ทะเล', 'น้ำ', 'ฟ้า', 'ขาว', 'เขียว', 'ช่วย', 'ขอบคุณ', 'สนาม', 'ดีใจ'];

const RT_NAMES = ['มะลิ', 'ภูผา', 'ใบบัว', 'นที', 'แก้วตา', 'ต้นข้าว'];
const RT_COLOURS = ['ขาว', 'ดำ', 'แดง', 'เหลือง', 'เขียว', 'ฟ้า'];
const RT_COUNTS = ['สอง', 'สาม', 'สี่', 'ห้า', 'หก'];

// The Thai curriculum's reading and writing indicators the parts test.
const RT_INDICATORS = {
    'ท 1.1 ป.1/1': 'อ่านออกเสียงคำ คำคล้องจอง และข้อความสั้น ๆ',
    'ท 1.1 ป.1/2': 'บอกความหมายของคำ และข้อความที่อ่าน',
    'ท 1.1 ป.1/3': 'ตอบคำถามเกี่ยวกับเรื่องที่อ่าน',
    'ท 1.1 ป.1/5': 'คาดคะเนเหตุการณ์จากเรื่องที่อ่าน',
    'ท 2.1 ป.1/2': 'เขียนสื่อสารด้วยคำและประโยคง่าย ๆ',
};

// Our split of marks where the guidance gives only a part's total.
const RT_ORDER_POINTS = 2;              // a sentence put in order: 2, or 1 if it starts right
const RT_ALOUD_WORD_POINTS = 1;
const RT_ALOUD_SENTENCE_POINTS = 3;     // ten sentences, 30 points

function rtPicture(emoji) {
    return `<span class="rt-emoji" aria-hidden="true">${emoji}</span>`;
}

function rtWord(word) {
    return `<span class="rt-word">${escapeLessonText(word)}</span>`;
}

// Wrong words that look like the right one, so the child has to read it: the
// ones sharing the most letters come first.
function rtLookAlikes(word, count) {
    let others = RT_PICTURES.filter(function (pair) { return pair[0] !== word; });
    let score = function (other) {
        return other.split('').filter(function (letter) { return word.indexOf(letter) !== -1; }).length + Math.random();
    };
    return others.map(function (pair) { return { pair: pair, score: score(pair[0]) }; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, count)
        .map(function (entry) { return entry.pair; });
}

function rtChoice(text, figure, right, wrong, show) {
    let options = shuffleList([right].concat(wrong));
    return {
        text: text,
        figure: figure,
        options: options.map(function (option) { return option[0]; }),
        html: options.map(show),
        correct: options.indexOf(right),
    };
}

// ตอนที่ 1: a word and its picture, asked both ways round.
function rtWordItem(pair, pictureFirst) {
    let wrong = rtLookAlikes(pair[0], 3);

    if (pictureFirst) {
        return rtChoice('ภาพนี้คือคำใด', rtPicture(pair[1]), pair, wrong, function (option) { return rtWord(option[0]); });
    }
    return rtChoice('คำนี้ตรงกับภาพใด', rtWord(pair[0]), pair, wrong, function (option) { return rtPicture(option[1]); });
}

// ตอนที่ 2: what the picture shows, as cards to put in order.
const RT_SCENES = [
    ['🐱 🐟', ['แมว', 'กิน', 'ปลา']],
    ['🐦 ☁️', ['นก', 'บิน', 'บน', 'ฟ้า']],
    ['🧒 📖', ['น้อง', 'อ่าน', 'หนังสือ']],
    ['🐶 🦴', ['หมา', 'กิน', 'กระดูก']],
    ['🐸 💧', ['กบ', 'กระโดด', 'ลง', 'น้ำ']],
    ['👧 🚲', ['พี่', 'ขี่', 'จักรยาน']],
    ['🐟 🌊', ['ปลา', 'ว่าย', 'ใน', 'ทะเล']],
    ['🐔 🥚', ['แม่ไก่', 'ออก', 'ไข่']],
    ['🐒 🍌', ['ลิง', 'กิน', 'กล้วย']],
    ['🧒 ⚽', ['น้อง', 'เตะ', 'ลูกบอล']],
    ['🐢', ['เต่า', 'เดิน', 'ช้า']],
    ['🐝 🌸', ['ผึ้ง', 'ตอม', 'ดอกไม้']],
    ['🐮 🌿', ['วัว', 'กิน', 'หญ้า']],
    ['🧒 ☂️', ['ฉัน', 'กาง', 'ร่ม']],
];

function rtOrderItem(scene) {
    let words = scene[1];
    let cards = shuffleList(words.map(function (word, position) { return position; }));

    // never hand the cards over already in order
    if (cards.every(function (card, position) { return card === position; })) {
        cards.push(cards.shift());
    }
    return {
        text: 'ดูภาพ แล้วแตะบัตรคำเรียงเป็นประโยค',
        figure: rtPicture(scene[0]),
        cards: cards.map(function (position) { return words[position]; }),
        // the card positions in the order that makes the sentence
        correct: words.map(function (word, position) { return cards.indexOf(position); }),
    };
}

// ตอนที่ 3: one sentence, one question about it.
function rtSentenceItem(kind) {
    let name = pickOne(RT_NAMES);
    let others = function (list, right, count) {
        return shuffleList(list.filter(function (item) { return item !== right; })).slice(0, count || 3);
    };
    let words = function (sentence, question, right, wrong) {
        return rtChoice(question, `<div class="rt-sentence">${escapeLessonText(sentence)}</div>`, [right], wrong.map(function (word) { return [word]; }), function (option) { return rtWord(option[0]); });
    };

    if (kind === 'eat') {
        let pair = pickOne([['ลิง', 'กล้วย'], ['แมว', 'ปลา'], ['กระต่าย', 'แครอท'], ['วัว', 'หญ้า'], ['หมา', 'กระดูก'], ['ไก่', 'ข้าวโพด']]);
        return words(`${pair[0]}ชอบกิน${pair[1]}`, `${pair[0]}ชอบกินอะไร`, pair[1], others(['กล้วย', 'ปลา', 'แครอท', 'หญ้า', 'กระดูก', 'ข้าวโพด'], pair[1]));
    }
    if (kind === 'ride') {
        let way = pickOne(['จักรยาน', 'รถไฟ', 'เรือ', 'รถเมล์']);
        return words(`${name}ไปโรงเรียนด้วย${way}`, `${name}ไปโรงเรียนด้วยอะไร`, way, others(['จักรยาน', 'รถไฟ', 'เรือ', 'รถเมล์'], way));
    }
    if (kind === 'colour') {
        let pet = pickOne(['แมว', 'หมา', 'กระต่าย', 'นก']), colour = pickOne(RT_COLOURS);
        return words(`${name}มี${pet}สี${colour}`, `${pet}ของ${name}สีอะไร`, 'สี' + colour, others(RT_COLOURS, colour).map(function (other) { return 'สี' + other; }));
    }
    if (kind === 'count') {
        let fruit = pickOne(['ส้ม', 'แตงโม', 'มะม่วง']), count = pickOne(RT_COUNTS);
        return words(`แม่ซื้อ${fruit}มา${count}ลูก`, `แม่ซื้อ${fruit}มากี่ลูก`, count + 'ลูก', others(RT_COUNTS, count).map(function (other) { return other + 'ลูก'; }));
    }
    if (kind === 'place') {
        let place = pickOne(['สนาม', 'ห้องเรียน', 'ชายหาด', 'สวนหลังบ้าน']);
        return words(`${name}กับเพื่อนเล่นกันอยู่ที่${place}`, `${name}เล่นอยู่ที่ไหน`, place, others(['สนาม', 'ห้องเรียน', 'ชายหาด', 'สวนหลังบ้าน'], place));
    }
    if (kind === 'who') {
        let friends = shuffleList(RT_NAMES);
        return words(`${friends[0]}ให้ดินสอแก่${friends[1]}`, 'ใครเป็นคนให้ดินสอ', friends[0], [friends[1], friends[2], friends[3]]);
    }

    // which sentence the picture shows: the right one beside ones with the
    // animal or the place changed
    let animals = [['แมว', '🐱'], ['หมา', '🐶'], ['กระต่าย', '🐰'], ['ลิง', '🐒'], ['เป็ด', '🦆']];
    let places = [['เตียง', '🛏️'], ['เก้าอี้', '🪑'], ['ต้นไม้', '🌳']];
    let animal = pickOne(animals), place = pickOne(places);
    let otherAnimal = pickOne(animals.filter(function (a) { return a !== animal; }));
    let otherPlaces = shuffleList(places.filter(function (p) { return p !== place; }));
    let sentence = function (a, p) { return [`${a[0]}อยู่บน${p[0]}`]; };
    let right = sentence(animal, place);

    return rtChoice('ข้อใดตรงกับภาพ', rtPicture(animal[1] + ' ' + place[1]), right,
        [sentence(otherAnimal, place), sentence(animal, otherPlaces[0]), sentence(otherAnimal, otherPlaces[1])],
        function (option) { return rtWord(option[0]); });
}

const RT_SENTENCE_KINDS = ['eat', 'ride', 'colour', 'count', 'place', 'who', 'picture'];

// ตอนที่ 4: a short story and five questions on it. Each story fills its own
// names and things, so no two papers read the same.
function rtStory() {
    let name = pickOne(RT_NAMES);
    let pickOther = function (list, right) { return shuffleList(list.filter(function (item) { return item !== right; })).slice(0, 3); };
    let stories = [
        function () {
            let day = pickOne(['วันเสาร์', 'วันอาทิตย์']), who = pickOne(['แม่', 'ยาย']);
            let fruit = pickOne(['ส้ม', 'มะม่วง', 'แตงโม']), count = pickOne(RT_COUNTS);
            let animal = pickOne(['แมว', 'หมา', 'ไก่']);
            return {
                text: `${day} ${name}ไปตลาดกับ${who} ${who}ซื้อ${fruit}${count}ลูก และซื้อขนมหนึ่งถุง ${name}ช่วย${who}ถือตะกร้า ตอนเดินกลับบ้าน ${name}เห็น${animal}นอนอยู่ใต้ต้นไม้ ${name}ยิ้มแล้วโบกมือให้${animal}`,
                questions: [
                    [`${name}ไปตลาดกับใคร`, who, pickOther(['แม่', 'ยาย', 'พ่อ', 'พี่'], who), 'ท 1.1 ป.1/3'],
                    [`${name}ไปตลาดวันอะไร`, day, pickOther(['วันจันทร์', 'วันพุธ', 'วันเสาร์', 'วันอาทิตย์'], day), 'ท 1.1 ป.1/3'],
                    [`${who}ซื้อ${fruit}กี่ลูก`, count + 'ลูก', pickOther(RT_COUNTS, count).map(function (c) { return c + 'ลูก'; }), 'ท 1.1 ป.1/3'],
                    [`${name}ช่วย${who}ทำอะไร`, 'ถือตะกร้า', ['หุงข้าว', 'ล้างจาน', 'กวาดบ้าน'], 'ท 1.1 ป.1/3'],
                    [`${name}เห็นอะไรนอนอยู่ใต้ต้นไม้`, animal, pickOther(['แมว', 'หมา', 'ไก่', 'เป็ด'], animal), 'ท 1.1 ป.1/3'],
                ],
            };
        },
        function () {
            let colour = pickOne(RT_COLOURS), thing = pickOne(['ดอกไม้', 'ต้นไม้', 'บ้าน', 'ปลา']);
            return {
                text: `เช้าวันนี้ฝนตก ${name}กางร่มสี${colour}ไปโรงเรียน ที่โรงเรียน คุณครูให้นักเรียนวาดรูป${thing} ${name}ตั้งใจวาดแล้วระบายสีอย่างสวยงาม เพื่อน ๆ ชมว่ารูปของ${name}สวยมาก ${name}ดีใจที่สุด`,
                questions: [
                    ['เช้าวันนี้อากาศเป็นอย่างไร', 'ฝนตก', ['แดดออก', 'อากาศหนาว', 'ลมพัดแรง'], 'ท 1.1 ป.1/3'],
                    [`ร่มของ${name}สีอะไร`, 'สี' + colour, pickOther(RT_COLOURS, colour).map(function (c) { return 'สี' + c; }), 'ท 1.1 ป.1/3'],
                    ['คุณครูให้นักเรียนทำอะไร', 'วาดรูป' + thing, ['ร้องเพลง', 'อ่านหนังสือ', 'เล่นฟุตบอล'], 'ท 1.1 ป.1/3'],
                    [`เพื่อน ๆ ชมว่าอะไร`, 'รูปสวยมาก', ['ร้องเพลงเพราะ', 'วิ่งเร็วมาก', 'ร่มสวยมาก'], 'ท 1.1 ป.1/3'],
                    [`${name}รู้สึกอย่างไร`, 'ดีใจ', ['เสียใจ', 'โกรธ', 'กลัว'], 'ท 1.1 ป.1/3'],
                ],
            };
        },
        function () {
            let pair = pickOne([['แมว', 'ปลา'], ['หมา', 'กระดูก'], ['กระต่าย', 'แครอท']]);
            let pet = pickOne(['ปุยฝ้าย', 'ถุงเงิน', 'มะขาม']), colour = pickOne(RT_COLOURS);
            return {
                text: `${name}มี${pair[0]}ตัวหนึ่งชื่อ${pet} ${pet}ตัวสี${colour} ชอบกิน${pair[1]} ทุกเย็น ${name}พา${pet}ไปเดินเล่นที่สวน วันนี้${pet}วิ่งเร็วมากจนหกล้ม ${name}จึงรีบอุ้ม${pet}กลับบ้าน`,
                questions: [
                    [`${pet}เป็นสัตว์อะไร`, pair[0], pickOther(['แมว', 'หมา', 'กระต่าย', 'นก'], pair[0]), 'ท 1.1 ป.1/3'],
                    [`${pet}ชอบกินอะไร`, pair[1], pickOther(['ปลา', 'กระดูก', 'แครอท', 'ข้าวโพด'], pair[1]), 'ท 1.1 ป.1/3'],
                    [`${name}พา${pet}ไปเดินเล่นเมื่อไร`, 'ตอนเย็น', ['ตอนเช้า', 'ตอนกลางวัน', 'ตอนกลางคืน'], 'ท 1.1 ป.1/3'],
                    [`วันนี้เกิดอะไรขึ้นกับ${pet}`, 'วิ่งจนหกล้ม', ['นอนหลับ', 'ว่ายน้ำ', 'หายไป'], 'ท 1.1 ป.1/3'],
                    [`ถ้า${pet}เจ็บขา ${name}ควรทำอย่างไร`, 'พาไปหาหมอ', ['ให้วิ่งต่อ', 'ทิ้งไว้ที่สวน', 'ดุว่า' + pet], 'ท 1.1 ป.1/5'],
                ],
            };
        },
    ];
    return pickOne(stories)();
}

// Reading aloud, the second part: ten short sentences about one day.
function rtAloudStory() {
    let name = pickOne(RT_NAMES);
    let stories = [
        [`${name}ตื่นนอนแต่เช้า`, `${name}ล้างหน้าและแปรงฟัน`, 'แม่ทำไข่เจียวให้กิน', `${name}กินข้าวจนหมดจาน`,
            `พ่อขี่รถพา${name}ไปโรงเรียน`, 'ที่โรงเรียนมีเพื่อนมากมาย', `${name}เล่นกับเพื่อนที่สนาม`,
            'คุณครูสอนให้อ่านหนังสือ', `ตอนเย็น${name}กลับบ้านกับพ่อ`, `วันนี้${name}มีความสุขมาก`],
        [`วันหยุด${name}ไปทะเลกับพ่อแม่`, 'ทะเลมีน้ำสีฟ้าสวยงาม', `${name}เล่นทรายที่ชายหาด`, 'พ่อช่วยก่อปราสาททราย',
            'แม่นั่งอยู่ใต้ร่มใหญ่', `${name}เห็นปูเดินอยู่ริมน้ำ`, 'ปูตัวเล็กเดินไปข้าง ๆ', `${name}หัวเราะชอบใจ`,
            'ตอนเย็นทุกคนกินข้าวด้วยกัน', `${name}อยากมาทะเลอีก`],
        [`ยายของ${name}มีสวนผัก`, 'ในสวนมีผักหลายอย่าง', `${name}ไปช่วยยายรดน้ำผัก`, 'ยายเก็บผักใส่ตะกร้า',
            'มีผีเสื้อบินอยู่ในสวน', `${name}วิ่งตามผีเสื้อ`, 'ยายบอกให้ระวังหกล้ม', `${name}ช่วยยายถือตะกร้า`,
            'ยายทำแกงจืดให้กิน', `${name}รักยายมาก`],
    ];
    return pickOne(stories);
}

// Thai speech for a grown-up checking a word, where the device has it.
function rtCanSpeak() {
    return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
}

function rtSpeak(text) {
    if (!rtCanSpeak()) {
        return;
    }
    let utterance = new SpeechSynthesisUtterance(text);
    let voice = window.speechSynthesis.getVoices().find(function (v) { return /^th/i.test(v.lang); });

    utterance.lang = 'th-TH';
    utterance.rate = 0.8;
    if (voice) {
        utterance.voice = voice;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// The whole paper, in the order of the parts in MOCK_EXAMS.rt1.
function buildReadingTest() {
    let items = [];
    let add = function (part, kind, points, code, item) {
        items.push(Object.assign(item, { part: part, kind: kind, points: points, code: code }));
    };

    shuffleList(RT_PICTURES).slice(0, 10).forEach(function (pair, i) {
        add(0, 'choice', 1, 'ท 1.1 ป.1/2', rtWordItem(pair, i % 2 === 0));
    });
    shuffleList(RT_SCENES).slice(0, 5).forEach(function (scene) {
        add(1, 'order', RT_ORDER_POINTS, 'ท 2.1 ป.1/2', rtOrderItem(scene));
    });
    let kinds = shuffleList(RT_SENTENCE_KINDS.concat(RT_SENTENCE_KINDS)).slice(0, 10);
    kinds.forEach(function (kind) {
        add(2, 'choice', 2, 'ท 1.1 ป.1/2', rtSentenceItem(kind));
    });
    let story = rtStory();
    story.questions.forEach(function (question) {
        let item = rtChoice(question[0], `<div class="rt-passage">${escapeLessonText(story.text)}</div>`, [question[1]],
            question[2].map(function (word) { return [word]; }), function (option) { return rtWord(option[0]); });
        add(3, 'choice', 2, question[3], item);
    });

    let words = shuffleList(RT_PICTURES.map(function (pair) { return pair[0]; }).concat(RT_WORDS)).slice(0, 20);
    add(4, 'aloud', 20, 'ท 1.1 ป.1/1', {
        text: 'ให้นักเรียนอ่านออกเสียงทีละคำ ผู้ปกครองหรือครูแตะคำที่อ่านถูก แตะอีกครั้งถ้าอ่านผิด',
        figure: '', lines: words, each: RT_ALOUD_WORD_POINTS,
    });
    add(5, 'aloud', 30, 'ท 1.1 ป.1/1', {
        text: 'ให้นักเรียนอ่านออกเสียงทีละประโยค ผู้ปกครองหรือครูแตะประโยคที่อ่านถูก แตะอีกครั้งถ้าอ่านผิด',
        figure: '', lines: rtAloudStory(), each: RT_ALOUD_SENTENCE_POINTS, sentences: true,
    });
    return items;
}

function markReadingOrder(item, answer) {
    if (!answer || answer.length !== item.correct.length) {
        return 0;
    }
    if (answer.every(function (card, position) { return card === item.correct[position]; })) {
        return item.points;
    }
    return answer[0] === item.correct[0] ? 1 : 0;
}

function markReadingAloud(item, answer) {
    return answer.filter(function (mark) { return mark === true; }).length * item.each;
}
