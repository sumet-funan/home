// Practice papers laid out like the national tests: the same parts, the same kinds
// of answer, the same points and the same time. The questions are written by the
// lesson builders to the published blueprint; none of them are real past papers.
//
// RT ป.1 is the reading test, not maths: its items come from rt.js, which also
// says how its reading aloud and its sentence from a picture are marked.
//
// NT ป.3 follows the 2568 guidance (30 items in three parts, 90 minutes). It names
// no indicators, so every ป.3 indicator is in the pool. O-NET ป.6 follows the
// สทศ. Test Blueprint for 2569: 15 items over the indicators it lists, 60 minutes.
var mockExamObj = {
    exam: 'nt3',
    examChosen: false,
    running: false,
    items: [],
    answers: [],
    index: 0,
    endsAt: 0,
    timer: null,
}

const MOCK_EXAM_RESULT_KEY = 'mathLessonMockExamResults';
const MOCK_EXAM_SAVE_KEY = 'mathLessonMockExamSaved';
const MOCK_EXAM_BUILD_TRIES = 40;

const ONET_NUMBER_POOL = ['ค 1.1 ป.4/10', 'ค 1.1 ป.5/8', 'ค 1.1 ป.6/11', 'ค 1.1 ป.6/12'];
const ONET_NUMBERS = ['ค 1.1 ป.4/10', 'ค 1.1 ป.5/8', 'ค 1.1 ป.6/1', 'ค 1.1 ป.6/11', 'ค 1.1 ป.6/12'];
const ONET_MEASURES = ['ค 2.1 ป.4/1', 'ค 2.1 ป.5/1', 'ค 2.1 ป.5/2', 'ค 2.1 ป.6/1', 'ค 2.1 ป.6/2', 'ค 2.1 ป.6/3'];
const ONET_DATA = ['ค 3.1 ป.5/1', 'ค 3.1 ป.6/1'];
const NT_NUMBER_POOL = ['ค 1.1 ป.3/5', 'ค 1.1 ป.3/6', 'ค 1.1 ป.3/8', 'ค 1.1 ป.3/9', 'ค 1.2 ป.3/1', 'ค 2.1 ป.3/1', 'ค 3.1 ป.3/2'];

function repeatSlot(count, slot) {
    return Array.from({ length: count }, function () { return slot; });
}

// A part is filled slot by slot, and each slot takes an indicator the paper has
// not asked yet where it can, so a paper spreads across its list.
const MOCK_EXAMS = {
    rt1: {
        name: 'RT ป.1',
        title: 'การประเมินความสามารถด้านการอ่านของผู้เรียน (RT) ป.1',
        // 45 minutes of reading for meaning, then about 10 reading aloud
        minutes: 55,
        build: buildReadingTest,
        parts: [
            { name: 'อ่านรู้เรื่อง ตอนที่ 1 คำ', kind: 'choice', points: 1, slots: repeatSlot(10, 'rt') },
            { name: 'อ่านรู้เรื่อง ตอนที่ 2 เล่าเรื่องจากภาพ', kind: 'order', points: 2, slots: repeatSlot(5, 'rt') },
            { name: 'อ่านรู้เรื่อง ตอนที่ 2 ประโยค', kind: 'choice', points: 2, slots: repeatSlot(10, 'rt') },
            { name: 'อ่านรู้เรื่อง ตอนที่ 3 ข้อความ', kind: 'choice', points: 2, slots: repeatSlot(5, 'rt') },
            { name: 'อ่านออกเสียง ตอนที่ 1 คำ', kind: 'aloud', points: 20, slots: ['rt'], summary: 'อ่านออกเสียง ตอนที่ 1 คำ 20 คำ คำละ 1 คะแนน' },
            { name: 'อ่านออกเสียง ตอนที่ 2 ข้อความ', kind: 'aloud', points: 30, slots: ['rt'], summary: 'อ่านออกเสียง ตอนที่ 2 ข้อความ 10 ส่วน ส่วนละ 3 คะแนน' },
        ],
    },
    nt3: {
        name: 'NT ป.3',
        title: 'การประเมินคุณภาพผู้เรียน (NT) ป.3 ด้านคณิตศาสตร์',
        minutes: 90,
        parts: [
            { name: 'ตอนที่ 1 เลือกตอบ', kind: 'choice', points: 3, slots: repeatSlot(26, 'p3') },
            { name: 'ตอนที่ 2 เติมคำตอบ', kind: 'number', points: 4, slots: repeatSlot(3, NT_NUMBER_POOL) },
            { name: 'ตอนที่ 3 แสดงวิธีทำ', kind: 'steps', points: 10, slots: ['steps'] },
        ],
    },
    onet6: {
        name: 'O-NET ป.6',
        title: 'การทดสอบทางการศึกษาระดับชาติขั้นพื้นฐาน (O-NET) ป.6 วิชาคณิตศาสตร์',
        minutes: 60,
        parts: [
            {
                name: 'ตอนที่ 1 เลือกตอบ 4 ตัวเลือก', kind: 'choice', points: 6.5,
                slots: repeatSlot(4, ONET_NUMBERS).concat([['ค 1.2 ป.6/1']], repeatSlot(4, ONET_MEASURES), [['ค 2.2 ป.5/2'], ONET_DATA]),
            },
            {
                name: 'ตอนที่ 2 ระบายตัวเลขที่เป็นคำตอบ', kind: 'number', points: 7.125,
                slots: repeatSlot(2, ONET_NUMBER_POOL).concat([ONET_MEASURES, ONET_DATA]),
            },
        ],
    },
};

function mockExamIndicator(code) {
    let grade = 'p' + code.match(/ป\.(\d)/)[1];
    return finalQuizIndicators[grade].find(function (indicator) { return indicator.code === code; });
}

function mockExamCodes(slot) {
    if (slot === 'p3') {
        return finalQuizIndicators.p3.map(function (indicator) { return indicator.code; });
    }
    return slot;
}

function mockChoiceItem(indicator) {
    let question = indicator.build();
    let options = shuffleList([question.answer].concat(question.wrong));

    return { text: question.text, figure: question.figure || '', options: options.map(finalQuizOptionLabel), html: options.map(finalQuizOptionHtml), correct: options.indexOf(question.answer) };
}

// A typed answer needs a question whose answer is one number. The newer grades ask
// their lesson for one; the older ones only have the quiz's builder, whose right
// option is a number written out.
function mockNumberItem(indicator) {
    let lesson = lessonBook[indicator.lesson];

    for (let tries = 0; tries < MOCK_EXAM_BUILD_TRIES; tries++) {
        if (lesson) {
            let modes = lesson.modes.filter(function (mode) { return !indicator.ask || indicator.ask.indexOf(mode.label) !== -1; });
            let question = pickOne(modes).build();
            if (typeof question.answer === 'number' && !question.choices && !question.fields) {
                return { text: question.text, figure: question.figure || '', answer: question.answer, unit: question.unit || '' };
            }
        } else {
            let question = indicator.build();
            if (/^\d+(\.\d+)?$/.test(question.answer)) {
                return { text: question.text, figure: question.figure || '', answer: +question.answer, unit: '' };
            }
        }
    }
    return null;
}

// Marked step by step, since a page cannot read working: the first step for
// showing the method, the last for the answer. The split is ours, not the test's.
const MOCK_STEP_POINTS = [4, 6];

function mockStepsItem() {
    let name = pickOne(wordNames);
    let templates = [
        function () {
            let count = randomInt(3, 9), each = randomInt(12, 95), extra = randomInt(10, 500);
            return {
                text: `${name}มีเงิน ${commaNumber(count * each + extra)} บาท ซื้อสมุด ${count} เล่ม เล่มละ ${each} บาท เหลือเงินกี่บาท`,
                steps: [{ label: 'ซื้อสมุดไปเป็นเงินกี่บาท', value: count * each }, { label: 'เหลือเงินกี่บาท', value: extra }],
            };
        },
        function () {
            let boxes = randomInt(3, 12), each = randomInt(4, 9) * 10, rooms = pickOne([2, 5, 10]);
            return {
                text: `มีดินสอ ${boxes} กล่อง กล่องละ ${each} แท่ง แบ่งให้นักเรียน ${rooms} ห้องเท่า ๆ กัน ได้ห้องละกี่แท่ง`,
                steps: [{ label: 'มีดินสอทั้งหมดกี่แท่ง', value: boxes * each }, { label: 'ได้ห้องละกี่แท่ง', value: boxes * each / rooms }],
            };
        },
        function () {
            let boys = randomInt(1200, 4800), girls = randomInt(1200, 4800), left = randomInt(100, 900);
            return {
                text: `งานวันเด็กมีเด็กชาย ${commaNumber(boys)} คน เด็กหญิง ${commaNumber(girls)} คน กลับบ้านไปแล้ว ${left} คน ยังเหลือเด็กในงานกี่คน`,
                steps: [{ label: 'มีเด็กทั้งหมดกี่คน', value: boys + girls }, { label: 'ยังเหลือเด็กกี่คน', value: boys + girls - left }],
            };
        },
        function () {
            let first = randomInt(2100, 8900), more = randomInt(150, 980);
            return {
                text: `ร้านขายส้มวันแรกได้ ${commaNumber(first)} ผล วันที่สองขายได้มากกว่าวันแรก ${more} ผล สองวันขายส้มได้รวมกี่ผล`,
                steps: [{ label: 'วันที่สองขายได้กี่ผล', value: first + more }, { label: 'สองวันขายได้รวมกี่ผล', value: first + first + more }],
            };
        },
    ];

    return Object.assign({ figure: '' }, pickOne(templates)());
}

function buildMockExam(examId) {
    if (MOCK_EXAMS[examId].build) {
        return MOCK_EXAMS[examId].build();
    }

    let used = [];
    let items = [];

    MOCK_EXAMS[examId].parts.forEach(function (part, partIndex) {
        // typed answers come from short lists, so they choose first and the
        // choices spread over what is left
        part.slots.map(function (slot, slotIndex) { return { slot: slot, slotIndex: slotIndex }; }).forEach(function (entry) {
            let item;

            if (entry.slot === 'steps') {
                item = Object.assign({ code: 'ค 1.1 ป.3/9', lesson: 'p3wordproblem' }, mockStepsItem());
            } else {
                let codes = mockExamCodes(entry.slot);
                let fresh = codes.filter(function (code) { return used.indexOf(code) === -1; });
                let code = pickOne(fresh.length ? fresh : codes);
                let indicator = mockExamIndicator(code);

                used.push(code);
                item = part.kind === 'number' ? mockNumberItem(indicator) : mockChoiceItem(indicator);
                if (!item) {
                    item = mockChoiceItem(indicator);
                    item.fallback = true;
                }
                item = Object.assign({ code: code, lesson: indicator.lesson }, item);
            }

            items.push(Object.assign(item, { part: partIndex, kind: item.fallback ? 'choice' : part.kind, points: part.points }));
        });
    });

    return items;
}

function mockExamOwner() {
    return currentUserId || 'guest';
}

// A guest's scores stay on this device and an account's go to the database, the
// same split as the final quiz, so a shared tablet shows each child their own.
function readMockExamResults() {
    try {
        let all = JSON.parse(localStorage.getItem(MOCK_EXAM_RESULT_KEY)) || {};
        return all.guest || {};
    } catch (e) {
        return {};
    }
}

function loadMockExamResults() {
    return currentUserId ? fetchMockExamResults() : Promise.resolve(readMockExamResults());
}

function saveMockExamResult(examId, score) {
    if (currentUserId) {
        recordMockExamResult(examId, score);
        return;
    }

    try {
        let all = JSON.parse(localStorage.getItem(MOCK_EXAM_RESULT_KEY)) || {};
        let mine = all.guest || {};
        let earlier = mine[examId];
        let result = { score: score, at: new Date().toISOString() };

        mine[examId] = Object.assign({}, result, { best: earlier && earlier.best && earlier.best.score >= score ? earlier.best : result });
        all.guest = mine;
        localStorage.setItem(MOCK_EXAM_RESULT_KEY, JSON.stringify(all));
    } catch (e) {
        // no storage: the result on screen is all that is lost
    }
}

function saveMockExamProgress() {
    if (!mockExamObj.running) {
        return;
    }

    try {
        localStorage.setItem(MOCK_EXAM_SAVE_KEY, JSON.stringify({
            owner: mockExamOwner(),
            exam: mockExamObj.exam,
            items: mockExamObj.items,
            answers: mockExamObj.answers,
            index: mockExamObj.index,
            leftMs: Math.max(0, mockExamObj.endsAt - Date.now()),
        }));
    } catch (e) {
        // no storage: the paper still runs, it just cannot be picked up later
    }
}

function readSavedMockExam() {
    try {
        let saved = JSON.parse(localStorage.getItem(MOCK_EXAM_SAVE_KEY));
        return saved && saved.owner === mockExamOwner() && MOCK_EXAMS[saved.exam] ? saved : null;
    } catch (e) {
        return null;
    }
}

function clearSavedMockExam() {
    try {
        localStorage.removeItem(MOCK_EXAM_SAVE_KEY);
    } catch (e) {
        // nothing was saved in the first place
    }
}

function mockScoreText(score) {
    return String(+score.toFixed(3));
}

// The final quiz's trophies, read straight off the score: a paper is out of 100,
// so its score is already the percentage the levels are set in. Not rounded up,
// so 79.5 is not gold. From the best score, so a trophy is never taken back.
function mockExamTrophy(result) {
    return result ? finalQuizTrophy(result.best.score) : null;
}

function mockExamHasTrophy(results) {
    return Object.keys(MOCK_EXAMS).some(function (exam) { return mockExamTrophy(results[exam]); });
}

function mockExamShelfHtml(results) {
    return Object.keys(MOCK_EXAMS).map(function (exam) {
        let result = results[exam];
        return trophySlotHtml(MOCK_EXAMS[exam].name, mockExamTrophy(result), result ? mockScoreText(result.best.score) + ' คะแนน' : '');
    }).join('');
}

function renderMockExamTrophy(score) {
    let trophy = finalQuizTrophy(score);
    let next = FINAL_QUIZ_TROPHIES[(trophy ? FINAL_QUIZ_TROPHIES.indexOf(trophy) : FINAL_QUIZ_TROPHIES.length) - 1];

    $('#mockExamTrophy').html(`${finalQuizTrophyIcon(trophy)}
        ${trophy ? `<strong>ได้${trophy.label}</strong>` : ''}
        ${next ? `<span>อีก ${mockScoreText(next.percent - score)} คะแนนจะได้${next.label}</span>` : ''}`);
}

function isMockAnswered(answer) {
    if (Array.isArray(answer)) {
        return answer.some(function (value) { return value !== null; });
    }
    return answer !== null;
}

function renderMockExamSetup() {
    let exam = MOCK_EXAMS[mockExamObj.exam];
    let items = exam.parts.reduce(function (sum, part) { return sum + part.slots.length; }, 0);
    let parts = exam.parts.map(function (part) {
        return `<li>${part.summary || `${part.name} ${part.slots.length} ข้อ ข้อละ ${mockScoreText(part.points)} คะแนน`}</li>`;
    }).join('');
    let owner = mockExamOwner();
    let examId = mockExamObj.exam;

    $('#mockExamPicker .mode-btn').removeClass('active');
    $('#mockExamPicker [data-exam="' + mockExamObj.exam + '"]').addClass('active');
    $('#mockExamTitle').text(exam.title);
    $('#mockExamInfo').text(`${items} ข้อ · คะแนนเต็ม 100 · เวลา ${exam.minutes} นาที`);
    $('#mockExamParts').html(parts);
    $('#mockExamLast').text('');
    loadMockExamResults().then(function (results) {
        // the answer may arrive after the child has signed out or switched paper
        if (mockExamOwner() !== owner) {
            return;
        }

        // a failed request says nothing about trophies rather than "none"
        $('#mockExamShelfCard').toggle(!!results);
        $('#mockExamShelf').html(mockExamShelfHtml(results || {}));

        let result = results && results[examId];
        if (result && mockExamObj.exam === examId) {
            $('#mockExamLast').text(`ครั้งล่าสุด ${mockScoreText(result.score)} คะแนน · ดีที่สุด ${mockScoreText(result.best.score)} คะแนน`);
        }
    });

    let saved = readSavedMockExam();
    $('#mockExamResume').toggle(!!saved);
    if (saved) {
        let answered = saved.answers.filter(isMockAnswered).length;
        $('#mockExamResumeText').text(`${MOCK_EXAMS[saved.exam].name} ตอบแล้ว ${answered} จาก ${saved.items.length} ข้อ เหลือเวลา ${Math.ceil(saved.leftMs / 60000)} นาที`);
    }
}

function showMockExamStage(stage) {
    $('#mockExamSetup').toggle(stage === 'setup');
    $('#mockExamRunning').toggle(stage === 'running');
    $('#mockExamResult').toggle(stage === 'result');
    $('body').toggleClass('fq-running', stage === 'running');
    document.getElementById('appMain').scrollTop = 0;
}

function renderMockExamClock() {
    let left = Math.max(0, Math.ceil((mockExamObj.endsAt - Date.now()) / 1000));
    let pad = function (n) { return n < 10 ? '0' + n : '' + n; };

    $('#mockExamClock').text(`${Math.floor(left / 60)}:${pad(left % 60)}`);
    $('#mockExamClockBox').toggleClass('is-low', left <= 300);

    if (!left && mockExamObj.running) {
        finishMockExam(true);
    }
}

function mockAnswerHtml(item, answer) {
    if (item.kind === 'choice') {
        let labels = item.labels || FINAL_QUIZ_LETTERS;
        return `<div class="fq-options${item.compact ? ' rt-bank' : ''}">` + item.html.map(function (html, position) {
            return `<button type="button" class="fq-option mock-option${answer === position ? ' selected' : ''}" data-option="${position}" aria-pressed="${answer === position}" aria-label="${labels[position]} ${escapeLessonText(item.options[position])}">
                <span class="fq-letter">${labels[position]}</span>
                <span class="fq-option-text">${html}</span>
            </button>`;
        }).join('') + '</div>';
    }

    if (item.kind === 'order') {
        let chosen = answer || [];
        let line = chosen.length
            ? chosen.map(function (card, position) {
                return `<button type="button" class="rt-card rt-chosen" data-position="${position}" aria-label="เอา ${escapeLessonText(item.cards[card])} ออก">${escapeLessonText(item.cards[card])}</button>`;
            }).join('')
            : '<span class="rt-line-hint">แตะบัตรคำด้านล่างตามลำดับ</span>';

        return `<div class="rt-order">
            <div class="rt-line">${line}</div>
            <div class="rt-pool">${item.cards.map(function (word, card) {
                return `<button type="button" class="rt-card rt-pick" data-card="${card}"${chosen.indexOf(card) !== -1 ? ' disabled' : ''}>${escapeLessonText(word)}</button>`;
            }).join('')}</div>
            ${chosen.length ? '<button type="button" class="fq-nav-btn rt-clear"><i class="bi bi-arrow-counterclockwise"></i> เรียงใหม่</button>' : ''}
        </div>`;
    }

    // reading aloud: a grown-up taps what was read right, and again if it was not
    if (item.kind === 'aloud') {
        let marks = answer || [];
        let speak = rtCanSpeak();

        return `<div class="rt-aloud${item.sentences ? ' is-sentences' : ''}">${item.lines.map(function (line, position) {
            let mark = marks[position];
            let state = mark === true ? ' is-right' : mark === false ? ' is-wrong' : '';
            let icon = mark === true ? 'bi-check-circle-fill' : mark === false ? 'bi-x-circle-fill' : 'bi-circle';
            let said = mark === true ? 'อ่านถูก' : mark === false ? 'อ่านผิด' : 'ยังไม่ตรวจ';

            return `<div class="rt-mark${state}">
                <button type="button" class="rt-mark-btn" data-line="${position}" aria-label="${escapeLessonText(line)} ${said}"><i class="bi ${icon}" aria-hidden="true"></i><span>${escapeLessonText(line)}</span></button>
                ${speak ? `<button type="button" class="rt-say" data-line="${position}" aria-label="ฟังเสียง ${escapeLessonText(line)}"><i class="bi bi-volume-up-fill"></i></button>` : ''}
            </div>`;
        }).join('')}</div>
        <button type="button" class="fq-nav-btn rt-all"><i class="bi bi-check2-all"></i> อ่านถูกทุก${item.sentences ? 'ประโยค' : 'คำ'}</button>`;
    }

    if (item.kind === 'number') {
        return `<div class="lesson-single">
            <input type="number" class="calc-input calc-input-result mock-input" data-step="0" placeholder="?" aria-label="คำตอบ" value="${answer === null ? '' : answer}">
            ${item.unit ? `<span class="lesson-unit">${item.unit}</span>` : ''}
        </div>`;
    }

    return '<div class="mock-steps">' + item.steps.map(function (step, position) {
        let value = answer && answer[position] !== null ? answer[position] : '';
        return `<label class="mock-step">
            <span>ขั้นที่ ${position + 1} ${step.label}</span>
            <input type="number" class="calc-input mock-input" data-step="${position}" placeholder="?" value="${value}">
        </label>`;
    }).join('') + '</div>';
}

function renderMockExamQuestion() {
    let index = mockExamObj.index;
    let item = mockExamObj.items[index];
    let total = mockExamObj.items.length;
    let part = MOCK_EXAMS[mockExamObj.exam].parts[item.part];

    $('#mockExamCount').text(`ข้อ ${index + 1} จาก ${total}`);
    $('#mockExamPart').text(`${part.name} · ${mockScoreText(item.points)} คะแนน`);
    $('#mockExamProgress').css('width', (index + 1) / total * 100 + '%');
    $('#mockExamFigure').html(item.figure).toggle(!!item.figure);
    $('#mockExamQuestion').text(item.text);
    $('#mockExamAnswer').html(mockAnswerHtml(item, mockExamObj.answers[index]));
    $('#mockExamMap').html(mockExamObj.items.map(function (other, position) {
        let classes = 'fq-map-btn';
        if (isMockAnswered(mockExamObj.answers[position])) { classes += ' is-answered'; }
        if (position === index) { classes += ' is-current'; }
        return `<button type="button" class="${classes}" data-question="${position}" aria-label="ไปข้อ ${position + 1}">${position + 1}</button>`;
    }).join(''));
    $('#mockExamBackBtn').prop('disabled', index === 0);
    $('#mockExamNextBtn').prop('disabled', index === total - 1);
}

function runMockExam() {
    mockExamObj.running = true;
    clearInterval(mockExamObj.timer);
    mockExamObj.timer = setInterval(renderMockExamClock, 1000);

    renderMockExamClock();
    renderMockExamQuestion();
    showMockExamStage('running');
    saveMockExamProgress();
}

function startMockExam() {
    mockExamObj.items = buildMockExam(mockExamObj.exam);
    mockExamObj.answers = mockExamObj.items.map(function (item) {
        if (item.kind === 'aloud') {
            return item.lines.map(function () { return null; });
        }
        if (item.kind === 'order') {
            return [];
        }
        return item.kind === 'steps' ? item.steps.map(function () { return null; }) : null;
    });
    mockExamObj.index = 0;
    mockExamObj.endsAt = Date.now() + MOCK_EXAMS[mockExamObj.exam].minutes * 60000;
    runMockExam();
}

function resumeMockExam() {
    let saved = readSavedMockExam();

    if (!saved) {
        renderMockExamSetup();
        return;
    }

    mockExamObj.exam = saved.exam;
    mockExamObj.items = saved.items;
    mockExamObj.answers = saved.answers;
    mockExamObj.index = saved.index;
    mockExamObj.endsAt = Date.now() + saved.leftMs;
    runMockExam();
}

// The clock stops while the paper is put away, as it would not in the real test,
// because a child at home is called away far more often than one in a hall.
function pauseMockExam() {
    saveMockExamProgress();
    clearInterval(mockExamObj.timer);
    mockExamObj.running = false;
    renderMockExamSetup();
    showMockExamStage('setup');
}

function markMockItem(item, answer) {
    if (item.kind === 'order') {
        return markReadingOrder(item, answer);
    }
    if (item.kind === 'aloud') {
        return markReadingAloud(item, answer);
    }
    if (item.kind === 'choice') {
        return answer === item.correct ? item.points : 0;
    }
    if (item.kind === 'number') {
        return answer !== null && isSameNumber(+answer, item.answer) ? item.points : 0;
    }
    return item.steps.reduce(function (sum, step, position) {
        let given = answer[position];
        return sum + (given !== null && isSameNumber(+given, step.value) ? MOCK_STEP_POINTS[position] : 0);
    }, 0);
}

function mockAloudUnit(item) {
    return item.sentences ? 'ประโยค' : 'คำ';
}

function mockRightText(item) {
    if (item.kind === 'order') {
        return escapeLessonText(item.correct.map(function (card) { return item.cards[card]; }).join(''));
    }
    if (item.kind === 'aloud') {
        return `อ่านถูกทุก${mockAloudUnit(item)}`;
    }
    if (item.kind === 'choice') {
        return item.html[item.correct];
    }
    if (item.kind === 'number') {
        return `${commaNumber(item.answer)}${item.unit ? ' ' + item.unit : ''}`;
    }
    return item.steps.map(function (step, position) { return `ขั้นที่ ${position + 1} ${step.label} ${commaNumber(step.value)}`; }).join('<br>');
}

function mockGivenText(item, answer) {
    if (!isMockAnswered(answer)) {
        return item.kind === 'aloud' ? 'ยังไม่ได้ตรวจ' : 'ไม่ได้ตอบ';
    }
    if (item.kind === 'order') {
        return escapeLessonText(answer.map(function (card) { return item.cards[card]; }).join(' '));
    }
    if (item.kind === 'aloud') {
        let missed = item.lines.filter(function (line, position) { return answer[position] !== true; });
        return `อ่านถูก ${item.lines.length - missed.length} จาก ${item.lines.length} ${mockAloudUnit(item)}` +
            (missed.length ? `<br>ยังอ่านไม่ถูก: ${missed.map(escapeLessonText).join(' · ')}` : '');
    }
    if (item.kind === 'choice') {
        return item.html[answer];
    }
    if (item.kind === 'number') {
        return `${answer}${item.unit ? ' ' + item.unit : ''}`;
    }
    return answer.map(function (value, position) { return `ขั้นที่ ${position + 1} ${value === null ? '-' : value}`; }).join('<br>');
}

function finishMockExam(timeUp) {
    clearInterval(mockExamObj.timer);
    mockExamObj.running = false;
    clearSavedMockExam();

    let exam = MOCK_EXAMS[mockExamObj.exam];
    let parts = exam.parts.map(function (part) { return { name: part.name, score: 0, full: 0, right: 0, count: 0 }; });
    let codes = {};
    let score = 0;

    mockExamObj.items.forEach(function (item, index) {
        let answer = mockExamObj.answers[index];
        let got = markMockItem(item, answer);
        let full = item.points;
        let part = parts[item.part];

        score += got;
        part.score += got;
        part.full += full;
        part.count++;
        part.right += got === full ? 1 : 0;

        codes[item.code] = codes[item.code] || { lesson: item.lesson, right: 0, total: 0 };
        codes[item.code].right += got === full ? 1 : 0;
        codes[item.code].total++;

        // an answer here counts towards its lesson, as one in the final quiz does
        if (isMockAnswered(answer) && typeof recordAttempt === 'function') {
            recordAttempt(item.lesson, got === full, `${item.text} → ${$('<div>').html(mockGivenText(item, answer)).text()}`, null);
        }
    });

    saveMockExamResult(mockExamObj.exam, score);
    renderMockExamResult(score, parts, codes, timeUp);
    showMockExamStage('result');
}

function mockIndicatorText(code) {
    if (RT_INDICATORS[code]) {
        return RT_INDICATORS[code];
    }
    let indicator = mockExamIndicator(code);
    return indicator ? indicator.text : '';
}

function renderMockExamResult(score, parts, codes, timeUp) {
    renderMockExamTrophy(score);
    $('#mockExamScore').text(`${mockScoreText(score)} / 100`);
    $('#mockExamTimeUp').toggle(!!timeUp);
    $('#mockExamParts2').html(parts.map(function (part) {
        return `<div class="fq-row">
            <i class="bi ${part.right === part.count ? 'bi-check-circle-fill is-good' : 'bi-circle-half is-weak'}"></i>
            <div class="fq-row-text"><strong>${part.name}</strong><span>ถูก ${part.right} จาก ${part.count} ข้อ</span></div>
            <span class="fq-row-score">${mockScoreText(part.score)}/${mockScoreText(part.full)}</span>
        </div>`;
    }).join(''));

    $('#mockExamIndicators').html(Object.keys(codes).sort().map(function (code) {
        let row = codes[code];
        let isFull = row.right === row.total;
        // reading has no lesson here to send the child to
        let practice = isFull || !row.lesson ? '' : `<button type="button" class="fq-practice" data-lesson="${row.lesson}">ไปฝึก</button>`;

        return `<div class="fq-row">
            <i class="bi ${isFull ? 'bi-check-circle-fill is-good' : 'bi-exclamation-circle-fill is-weak'}"></i>
            <div class="fq-row-text"><strong>${mockIndicatorText(code)}</strong><span>${code}</span></div>
            <span class="fq-row-score">${row.right}/${row.total}</span>
            ${practice}
        </div>`;
    }).join(''));

    let missed = mockExamObj.items.map(function (item, index) {
        let answer = mockExamObj.answers[index];
        if (markMockItem(item, answer) === item.points) {
            return '';
        }
        return `<div class="fq-missed">
            ${item.figure ? `<div class="fq-figure">${item.figure}</div>` : ''}
            <p>ข้อ ${index + 1}. ${escapeLessonText(item.text)}</p>
            <div class="fq-missed-line is-given"><span>คำตอบของเรา</span> ${mockGivenText(item, answer)}</div>
            <div class="fq-missed-line"><span>คำตอบที่ถูก</span> ${mockRightText(item)}</div>
        </div>`;
    }).join('');

    $('#mockExamMissedSection').toggle(!!missed);
    $('#mockExamMissed').html(missed);
}

$('#mockExamPicker').on('click', '.mode-btn', function () {
    mockExamObj.exam = $(this).data('exam');
    mockExamObj.examChosen = true;
    renderMockExamSetup();
});

$('#mockExamStartBtn').on('click', function () {
    if (readSavedMockExam()) {
        confirmFinalQuiz('มีข้อสอบที่ยังทำไม่เสร็จ ถ้าเริ่มชุดใหม่ คำตอบเดิมจะหายไป ต้องการเริ่มใหม่หรือไม่?', 'เริ่มชุดใหม่', startMockExam);
    } else {
        startMockExam();
    }
});

$('#mockExamResumeBtn').on('click', resumeMockExam);
$('#mockExamAgainBtn').on('click', function () {
    renderMockExamSetup();
    showMockExamStage('setup');
});

$('#mockExamDiscardBtn').on('click', function () {
    confirmFinalQuiz('ถ้าลบข้อสอบชุดนี้ คำตอบที่ทำไว้จะหายไป ต้องการลบหรือไม่?', 'ลบข้อสอบ', function () {
        clearSavedMockExam();
        renderMockExamSetup();
    });
});

$('#mockExamAnswer').on('click', '.mock-option', function () {
    mockExamObj.answers[mockExamObj.index] = +$(this).data('option');
    renderMockExamQuestion();
    saveMockExamProgress();
});

$('#mockExamAnswer').on('input', '.mock-input', function () {
    let item = mockExamObj.items[mockExamObj.index];
    let value = $(this).val() === '' ? null : $(this).val();

    if (item.kind === 'steps') {
        mockExamObj.answers[mockExamObj.index][+$(this).data('step')] = value;
    } else {
        mockExamObj.answers[mockExamObj.index] = value;
    }
    $('#mockExamMap .fq-map-btn').eq(mockExamObj.index).toggleClass('is-answered', isMockAnswered(mockExamObj.answers[mockExamObj.index]));
    saveMockExamProgress();
});

function changeMockAnswer(change) {
    change(mockExamObj.answers[mockExamObj.index], mockExamObj.items[mockExamObj.index]);
    renderMockExamQuestion();
    saveMockExamProgress();
}

$('#mockExamAnswer').on('click', '.rt-pick', function () {
    let card = +$(this).data('card');
    changeMockAnswer(function (answer) { answer.push(card); });
});

$('#mockExamAnswer').on('click', '.rt-chosen', function () {
    let position = +$(this).data('position');
    changeMockAnswer(function (answer) { answer.splice(position, 1); });
});

$('#mockExamAnswer').on('click', '.rt-clear', function () {
    changeMockAnswer(function (answer) { answer.length = 0; });
});

// not marked, read right, read wrong, and round again
$('#mockExamAnswer').on('click', '.rt-mark-btn', function () {
    let line = +$(this).data('line');
    changeMockAnswer(function (answer) {
        answer[line] = answer[line] === null ? true : answer[line] === true ? false : null;
    });
});

$('#mockExamAnswer').on('click', '.rt-all', function () {
    changeMockAnswer(function (answer) { answer.fill(true); });
});

$('#mockExamAnswer').on('click', '.rt-say', function () {
    rtSpeak(mockExamObj.items[mockExamObj.index].lines[+$(this).data('line')]);
});

function moveMockExam(index) {
    mockExamObj.index = index;
    renderMockExamQuestion();
    saveMockExamProgress();
}

$('#mockExamBackBtn').on('click', function () { moveMockExam(mockExamObj.index - 1); });
$('#mockExamNextBtn').on('click', function () { moveMockExam(mockExamObj.index + 1); });
$('#mockExamMap').on('click', '.fq-map-btn', function () { moveMockExam(+$(this).data('question')); });

$('#mockExamSubmitBtn').on('click', function () {
    let blanks = mockExamObj.answers.filter(function (answer) { return !isMockAnswered(answer); }).length;

    if (blanks) {
        confirmFinalQuiz(`ยังไม่ได้ตอบอีก ${blanks} ข้อ ข้อที่ไม่ได้ตอบจะไม่ได้คะแนน ต้องการส่งคำตอบหรือไม่?`, 'ส่งคำตอบ', function () { finishMockExam(false); });
    } else {
        finishMockExam(false);
    }
});

$('#mockExamIndicators').on('click', '.fq-practice', function () {
    let menu = document.getElementById(lessonMenuId($(this).data('lesson')));
    if (menu) {
        bootstrap.Tab.getOrCreateInstance(menu).show();
    }
});

$(document).on('show.bs.tab', '[data-bs-toggle="list"]', function (e) {
    if (e.relatedTarget && e.relatedTarget.id === 'menu_mockexam' && mockExamObj.running) {
        pauseMockExam();
    }
});

window.addEventListener('pagehide', saveMockExamProgress);
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        saveMockExamProgress();
    }
});

// a ป.1 child starts on RT, a ป.6 child on O-NET, everyone else on NT
supabaseClient.auth.onAuthStateChange(function (event, session) {
    let grade = session && session.user.user_metadata && session.user.user_metadata.grade;

    if (mockExamObj.running) {
        return;
    }
    if (!mockExamObj.examChosen) {
        mockExamObj.exam = grade === 'p1' ? 'rt1' : grade === 'p6' ? 'onet6' : 'nt3';
    }
    setTimeout(renderMockExamSetup, 0);
});

$('#mockExamTrophyRule').text(FINAL_QUIZ_TROPHIES.map(function (trophy) {
    return `${trophy.percent} คะแนนขึ้นไป ${trophy.label}`;
}).join(' · '));

renderMockExamSetup();
