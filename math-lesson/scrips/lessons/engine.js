// Every lesson from ป.3 up runs on this one page. A lesson here is only its
// wording and a builder for each kind of question, because the page, the marking
// and the history are the same for all of them: the earlier lessons each carry
// their own copy of those, and there are too many new ones to go on doing that.
//
// A builder returns { text, figure?, ... } and one of three kinds of answer:
//   answer: 25              one number, with an optional `unit` beside the box
//   fields: [{ label, value }]   several numbers, and `same(values)` when more than
//                                one set of numbers is right, as with 2/4 and 1/2
//   choices: ['a', 'b'], answer: 'a'    tap one
var lessonBook = {};

const LESSON_SAME_QUESTION_RETRIES = 8;

function commaNumber(number) {
    return number.toLocaleString('en-US');
}

const THAI_PLACE_WORDS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

// numberToThaiWords stops at 1,000, which was as far as ป.2 needed
function thaiNumberWords(number) {
    if (!number) {
        return thaiDigitWords[0];
    }
    if (number >= 1000000) {
        let rest = number % 1000000;
        return thaiNumberWords(Math.floor(number / 1000000)) + 'ล้าน' + (rest ? thaiNumberWords(rest) : '');
    }

    let digits = String(number).split('').map(Number);

    return digits.map(function (digit, index) {
        let place = digits.length - 1 - index;

        if (!digit) {
            return '';
        }
        if (place === 0 && digit === 1 && digits.length > 1) {
            return 'เอ็ด';
        }
        if (place === 1 && digit === 1) {
            return 'สิบ';
        }
        if (place === 1 && digit === 2) {
            return 'ยี่สิบ';
        }
        return thaiDigitWords[digit] + THAI_PLACE_WORDS[place];
    }).join('');
}

function escapeLessonText(text) {
    return $('<div>').text(text).html();
}

function choiceQuestion(text, answer, wrong, figure) {
    return { text: text, figure: figure, answer: answer, choices: shuffleList([answer].concat(wrong)) };
}

function compareQuestion(text, first, second, figure) {
    return { text: text, figure: figure, answer: compareSymbolText[compareSymbolOf(first, second)], choices: ['>', '<', '='] };
}

// `asWritten` keeps the final quiz from simplifying the answer, for a grade that
// has not met simplifying, or a question that is about the improper form itself.
function fractionFields(numerator, denominator, asWritten) {
    return {
        fields: [{ label: 'ตัวเศษ', value: numerator }, { label: 'ตัวส่วน', value: denominator }],
        fraction: { top: numerator, bottom: denominator, asWritten: asWritten },
        same: function (values) {
            return values[1] > 0 && values[0] * denominator === numerator * values[1];
        },
    };
}

function lessonTable(headers, rows) {
    let head = headers.map(function (cell) { return `<th>${cell}</th>`; }).join('');
    let body = rows.map(function (row) {
        return '<tr>' + row.map(function (cell) { return `<td>${cell}</td>`; }).join('') + '</tr>';
    }).join('');

    return `<table class="lesson-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function lessonPageId(lesson) {
    return lesson.id.replace(/^(p\d)/, 'content_$1_');
}

function lessonMenuHtml(lesson) {
    let menuId = lesson.id.replace(/^(p\d)/, 'menu_$1_');
    let pageId = lessonPageId(lesson);

    return `<a class="nav-menu-item" id="${menuId}" data-bs-toggle="list" href="#${pageId}" role="tab"
        aria-controls="${pageId}" data-op="${lesson.op}">
        <i class="bi ${lesson.icon}"></i><span>${lesson.menu}</span>
    </a>`;
}

function lessonPageHtml(lesson) {
    let id = lesson.id;
    let modes = lesson.modes.length < 2 ? '' : `<div class="mode-picker lesson-modes">${lesson.modes.map(function (mode, index) {
        return `<button type="button" class="mode-btn${index ? '' : ' active'}" data-mode="${index}">${mode.label}</button>`;
    }).join('')}</div>`;

    return `<div class="tab-pane fade" id="${lessonPageId(lesson)}" role="tabpanel" aria-labelledby="${lesson.id.replace(/^(p\d)/, 'menu_$1_')}">
        <div class="operation-panel" data-op="${lesson.op}" data-lesson="${id}">
            <div class="panel-header">
                <h2><i class="bi ${lesson.icon}"></i> ${lesson.title}</h2>
                <p>${lesson.intro}</p>
            </div>
            <div class="panel-body">
                ${modes}
                <div class="calc-card">
                    <div class="lesson-figure"></div>
                    <div class="word-question"></div>
                    <div class="lesson-answer"></div>
                    <button type="button" class="calc-submit lesson-check">ตรวจคำตอบ <i class="bi bi-check2-circle"></i></button>
                    <div class="calc-feedback" id="feedback_${id}"></div>
                </div>
                <div class="side-panels">
                    <div class="side-panel lesson-right" style="display: none;">
                        <h3><i class="bi bi-list-check"></i> คำตอบที่ถูก</h3>
                        <div class="answer-list"></div>
                    </div>
                    <div class="side-panel lesson-history" style="display: none;">
                        <h3><i class="bi bi-clock-history"></i> ประวัติ</h3>
                        <div class="answer-list" id="history_${id}"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function lessonAnswerHtml(lesson, question) {
    if (question.choices) {
        return `<div class="shape-options" id="choices_${lesson.id}">${question.choices.map(function (choice, index) {
            return `<button type="button" class="shape-option-btn lesson-choice" data-index="${index}">${escapeLessonText(choice)}</button>`;
        }).join('')}</div>`;
    }

    if (question.fields) {
        return `<div class="place-value-fields">${question.fields.map(function (field, index) {
            return `<div class="place-value-field">
                <label for="answer_${lesson.id}_${index}">${field.label}</label>
                <input type="number" id="answer_${lesson.id}_${index}" class="calc-input" placeholder="?" aria-label="${field.label}">
            </div>`;
        }).join('')}</div>`;
    }

    let unit = question.unit ? `<span class="lesson-unit">${question.unit}</span>` : '';

    return `<div class="lesson-single">
        <input type="number" id="answer_${lesson.id}_0" class="calc-input calc-input-result" placeholder="?" aria-label="คำตอบ">
        ${unit}
    </div>`;
}

// a question read off a picture has the same words every time
function lessonQuestionKey(question) {
    return question.text + (question.figure || '');
}

function askLessonQuestion(lesson) {
    let state = lesson.state;
    let build = lesson.modes[state.mode].build;
    let question = build();

    // the same question straight after answering it right teaches nothing
    for (let tries = 0; tries < LESSON_SAME_QUESTION_RETRIES && lessonQuestionKey(question) === state.lastKey; tries++) {
        question = build();
    }

    let $page = $('#' + lessonPageId(lesson));

    state.question = question;
    state.lastKey = lessonQuestionKey(question);
    state.picked = null;

    $page.find('.lesson-figure').html(question.figure || '').toggle(!!question.figure);
    $page.find('.word-question').text(question.text);
    $page.find('.lesson-answer').html(lessonAnswerHtml(lesson, question));
}

function lessonGivenAnswer(lesson) {
    let question = lesson.state.question;

    if (question.choices) {
        if (lesson.state.picked === null) {
            flagFieldRequired('choices_' + lesson.id);
            return null;
        }
        let picked = question.choices[lesson.state.picked];
        return { isCorrect: picked === question.answer, text: picked };
    }

    let fields = question.fields || [{ label: '', value: question.answer }];
    let ids = fields.map(function (field, index) { return `answer_${lesson.id}_${index}`; });

    if (focusFirstEmptyField(ids)) {
        return null;
    }

    let values = ids.map(function (id) { return +$('#' + id).val(); });
    let isCorrect = question.same
        ? question.same(values)
        : fields.every(function (field, index) { return isSameNumber(field.value, values[index]); });
    let text = question.fields
        ? fields.map(function (field, index) { return `${field.label} ${values[index]}`; }).join(' ')
        : values[0] + (question.unit ? ' ' + question.unit : '');

    return { isCorrect: isCorrect, text: text };
}

function addLessonChip($list, number, expr) {
    $list.append(`<div class="answer-chip">
        <span class="answer-index">${number}</span>
        <span class="answer-expr">${escapeLessonText(expr)}</span>
    </div>`);
}

function addLessonHistory(lesson, expr, isCorrect) {
    let historyId = 'history_' + lesson.id;

    $('#' + historyId).append(`<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
        <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
        <span class="answer-index">${lesson.state.historyRows}</span>
        <span class="answer-expr">${escapeLessonText(expr)}</span>
    </div>`);

    recordHistoryAttempt(lesson.id, isCorrect, historyId);

    if (isCorrect) {
        lesson.state.historyRows++;
    }
}

function checkLessonAnswer(lesson) {
    let given = lessonGivenAnswer(lesson);

    if (!given) {
        return;
    }

    let $page = $('#' + lessonPageId(lesson));
    let expr = `${lesson.state.question.text} → ${given.text}`;

    showFeedback('feedback_' + lesson.id, given.isCorrect);

    if (given.isCorrect) {
        addLessonChip($page.find('.lesson-right .answer-list'), lesson.state.rightRows, expr);
        lesson.state.rightRows++;
        $page.find('.lesson-right').show();
        askLessonQuestion(lesson);
        $page.find('.calc-input').first().trigger('focus');
    }

    $page.find('.lesson-history').show();
    addLessonHistory(lesson, expr, given.isCorrect);
}

function lessonOf(element) {
    return lessonBook[$(element).closest('.operation-panel').data('lesson')];
}

$(document).on('click', '.lesson-check', function () {
    checkLessonAnswer(lessonOf(this));
});

$(document).on('click', '.lesson-choice', function () {
    $(this).siblings().removeClass('selected');
    $(this).addClass('selected');
    lessonOf(this).state.picked = +$(this).data('index');
});

$(document).on('click', '.lesson-modes .mode-btn', function () {
    let lesson = lessonOf(this);

    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    lesson.state.mode = +$(this).data('mode');
    askLessonQuestion(lesson);
});

const QUIZ_LABEL_FIRST = ['ผลหาร', 'เศษ'];

function quizFieldsText(fields, shifts) {
    return fields.map(function (field, index) {
        let value = field.value + (shifts[index] || 0);
        return QUIZ_LABEL_FIRST.indexOf(field.label) === -1 ? `${value} ${field.label}` : `${field.label} ${value}`;
    }).join(' ');
}

function quizFieldsQuestion(question) {
    let last = question.fields[question.fields.length - 1].value;
    let step = last && last % 5 === 0 ? 5 : 1;

    return {
        text: question.text,
        figure: question.figure,
        answer: quizFieldsText(question.fields, []),
        wrong: [[1, 0], [0, step], [1, step]].map(function (shifts) { return quizFieldsText(question.fields, shifts); }),
    };
}

function quizRatioQuestion(question) {
    let first = question.ratio[0], second = question.ratio[1];
    let wrong = [`${second} : ${first}`, `${first + 1} : ${second}`, `${first} : ${second + 1}`, `${first + 1} : ${second + 2}`]
        .filter(function (text) { return text !== `${first} : ${second}`; });

    return { text: question.text, answer: `${first} : ${second}`, wrong: wrong.slice(0, 3) };
}

function quizWrittenFractionQuestion(question) {
    let top = question.fraction.top, bottom = question.fraction.bottom;

    return {
        text: question.text,
        figure: question.figure,
        answer: `${top}/${bottom}`,
        wrong: [`${top + 1}/${bottom}`, `${top}/${bottom + 1}`, `${top + bottom}/${bottom}`],
    };
}

function quizNumberQuestion(question) {
    let unit = question.unit ? ' ' + question.unit : '';
    let write = function (value) { return commaNumber(+value) + unit; };
    let built = numberQuestion(question.text, question.answer, question.figure);

    return { text: built.text, figure: built.figure, answer: write(built.answer), wrong: built.wrong.map(write) };
}

// A lesson's question as the final quiz asks it: four answers to choose from.
function quizQuestion(question) {
    if (question.choices) {
        let others = question.choices.filter(function (choice) { return choice !== question.answer; });
        return { text: question.text, figure: question.figure, answer: question.answer, wrong: shuffleList(others).slice(0, FINAL_QUIZ_LETTERS.length - 1) };
    }
    if (question.fraction && question.fraction.asWritten) {
        return quizWrittenFractionQuestion(question);
    }
    if (question.fraction) {
        let text = question.text.replace(/ \(ตอบเป็น[^)]*\)/, '');
        return Object.assign({ figure: question.figure }, fractionChoices(text, question.fraction.top, question.fraction.bottom));
    }
    if (question.ratio) {
        return quizRatioQuestion(question);
    }
    return question.fields ? quizFieldsQuestion(question) : quizNumberQuestion(question);
}

// Each indicator asks from its lesson, through `ask` where only some of the
// lesson's kinds of question are about that indicator.
function addFinalQuiz(grade, indicators) {
    finalQuizIndicators[grade] = indicators.map(function (indicator) {
        return Object.assign({
            build: function () {
                let modes = lessonBook[indicator.lesson].modes.filter(function (mode) {
                    return !indicator.ask || indicator.ask.indexOf(mode.label) !== -1;
                });
                return quizQuestion(pickOne(modes).build());
            },
        }, indicator);
    });
}

// `moved` puts a lesson that already exists into this grade's list, where it
// belongs in the teaching order. It keeps its id, and so the child's history.
function addLessons(grade, lessons) {
    lessons.forEach(function (lesson) {
        if (lesson.moved) {
            $('#group-' + grade).append($('#' + lesson.moved));
            return;
        }

        lessonBook[lesson.id] = lesson;
        lesson.state = { mode: 0, picked: null, question: null, lastKey: '', rightRows: 1, historyRows: 1 };
        LESSON_LABELS[lesson.id] = lesson.label;
        learnLessons[lessonPageId(lesson)] = lesson.learn;

        $('#group-' + grade).append(lessonMenuHtml(lesson));
        $('.tab-content').first().append(lessonPageHtml(lesson));
        askLessonQuestion(lesson);
    });
}
