// The "เรียนรู้วิธีทำ" card at the top of each lesson: a worked example shown one
// step at a time. The content is in lessons.js; this file only walks through it.
var learnState = {};

function buildLearnCard(paneId) {
    let topics = learnLessons[paneId];
    let picker = '';

    if (topics.length > 1) {
        let buttons = topics.map(function (topic, index) {
            return `<button type="button" class="mode-btn${index === 0 ? ' active' : ''}" data-topic="${index}">${topic.label}</button>`;
        });
        picker = `<div class="mode-picker learn-topics">${buttons.join('')}</div>`;
    }

    return `<section class="learn-card" data-pane="${paneId}">
        <button type="button" class="learn-toggle" aria-expanded="false" aria-controls="learn_${paneId}">
            <span class="learn-toggle-icon"><i class="bi bi-lightbulb-fill"></i></span>
            <span class="learn-toggle-text">
                <strong>เรียนรู้วิธีทำ</strong>
                <span>ดูตัวอย่างทีละขั้นก่อนเริ่มฝึก</span>
            </span>
            <i class="bi bi-chevron-right learn-caret"></i>
        </button>
        <div class="learn-body" id="learn_${paneId}" hidden>
            ${picker}
            <div class="learn-title"></div>
            <div class="learn-step" aria-live="polite"></div>
            <div class="learn-meter">
                <span class="learn-count"></span>
                <div class="learn-progress"><span></span></div>
            </div>
            <div class="learn-nav">
                <button type="button" class="learn-back"><i class="bi bi-chevron-left"></i> ย้อนกลับ</button>
                <button type="button" class="learn-next"></button>
            </div>
        </div>
    </section>`;
}

function renderLearnStep(card) {
    let paneId = card.data('pane');
    let state = learnState[paneId];
    let topic = learnLessons[paneId][state.topic];
    let step = topic.steps[state.step];
    let isLast = state.step === topic.steps.length - 1;

    card.find('.learn-title').html(topic.title);
    card.find('.learn-step').html(`<p class="learn-say">${step.say}</p>`
        + (step.show ? `<div class="learn-show">${step.show}</div>` : ''));
    card.find('.learn-progress span').css('width', (state.step + 1) / topic.steps.length * 100 + '%');
    card.find('.learn-count').text(`ขั้นที่ ${state.step + 1} จาก ${topic.steps.length}`);
    card.find('.learn-back').prop('disabled', state.step === 0);
    card.find('.learn-next').html(isLast ? 'เริ่มฝึกเลย' : 'ขั้นต่อไป <i class="bi bi-chevron-right"></i>');
}

function closeLearnCard(card) {
    learnState[card.data('pane')].step = 0;
    card.find('.learn-body').prop('hidden', true);
    card.find('.learn-toggle').attr('aria-expanded', 'false');

    // reading the lesson is not time spent on the question waiting underneath
    resetQuestionTimer();
}

function openLearnCard(card) {
    card.find('.learn-body').prop('hidden', false);
    card.find('.learn-toggle').attr('aria-expanded', 'true');
    renderLearnStep(card);
}

$(document).on('click', '.learn-toggle', function () {
    let card = $(this).closest('.learn-card');

    if (card.find('.learn-body').prop('hidden')) {
        openLearnCard(card);
    } else {
        closeLearnCard(card);
    }
});

// Two misses in a row usually mean the method is missing, not the effort, so the
// lesson offers its worked example instead of asking for a third guess.
const LEARN_HINT_AFTER_MISSES = 2;
var learnMisses = {};

function clearLearnHint(feedbackId) {
    delete learnMisses[feedbackId];
    $('#' + feedbackId).siblings('.learn-hint').remove();
}

function noteLessonAnswer(feedbackId, isCorrect) {
    if (isCorrect) {
        clearLearnHint(feedbackId);
        return;
    }

    let $feedback = $('#' + feedbackId);
    learnMisses[feedbackId] = (learnMisses[feedbackId] || 0) + 1;

    if (learnMisses[feedbackId] >= LEARN_HINT_AFTER_MISSES && !$feedback.siblings('.learn-hint').length) {
        $feedback.after(`<button type="button" class="learn-hint" data-feedback="${feedbackId}">
            <i class="bi bi-lightbulb-fill"></i> ลองดูวิธีทำก่อนไหม
        </button>`);
    }
}

$(document).on('click', '.learn-hint', function () {
    let card = $(this).closest('.panel-body').find('.learn-card');

    clearLearnHint($(this).data('feedback'));
    if (card.find('.learn-body').prop('hidden')) {
        openLearnCard(card);
    }
    card[0].scrollIntoView({ block: 'center' });
});

// a different kind of question starts the count again
$(document).on('click', '.operation-panel .mode-btn', function () {
    let feedback = $(this).closest('.panel-body').find('.calc-feedback').attr('id');
    if (feedback) {
        clearLearnHint(feedback);
    }
});

$(document).on('click', '.learn-topics .mode-btn', function () {
    let card = $(this).closest('.learn-card');

    card.find('.learn-topics .mode-btn').removeClass('active');
    $(this).addClass('active');
    learnState[card.data('pane')] = { topic: +$(this).data('topic'), step: 0 };
    renderLearnStep(card);
});

$(document).on('click', '.learn-back', function () {
    let card = $(this).closest('.learn-card');

    learnState[card.data('pane')].step--;
    renderLearnStep(card);
});

$(document).on('click', '.learn-next', function () {
    let card = $(this).closest('.learn-card');
    let state = learnState[card.data('pane')];

    if (state.step === learnLessons[card.data('pane')][state.topic].steps.length - 1) {
        closeLearnCard(card);
        card.find('.learn-toggle').trigger('focus');
        return;
    }

    state.step++;
    renderLearnStep(card);
});

Object.keys(learnLessons).forEach(function (paneId) {
    learnState[paneId] = { topic: 0, step: 0 };
    $('#' + paneId + ' .panel-body').prepend(buildLearnCard(paneId));
});
