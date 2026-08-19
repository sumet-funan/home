// Persistence layer for lesson attempts and speed-quiz results.
//
// Every write is fire-and-forget: an answer must never wait on the network.
// Writes that fail (offline, CDN hiccup) are parked in a localStorage outbox
// and retried on the next successful write or sign-in, so a flaky connection
// costs nothing. While signed out (guest), every call is a no-op.

const DATA_OUTBOX_KEY = 'mathLessonOutbox';

var currentUserId = null;

function readOutbox() {
    try {
        let raw = localStorage.getItem(DATA_OUTBOX_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function writeOutbox(entries) {
    try {
        localStorage.setItem(DATA_OUTBOX_KEY, JSON.stringify(entries));
    } catch (e) {
        // storage full or unavailable — dropping queued rows is preferable to
        // breaking the lesson the child is in the middle of
    }
}

function queueForRetry(table, row) {
    let entries = readOutbox();
    entries.push({ table: table, row: row });
    writeOutbox(entries);
}

function flushOutbox() {
    if (!currentUserId) {
        return;
    }

    let entries = readOutbox();
    if (!entries.length) {
        return;
    }

    // Rows belonging to a different account stay queued rather than being sent
    // (RLS would reject them) or dropped (that would lose the other kid's work).
    let mine = entries.filter(function (e) { return e.row.user_id === currentUserId; });
    let others = entries.filter(function (e) { return e.row.user_id !== currentUserId; });
    if (!mine.length) {
        return;
    }

    writeOutbox(others);

    mine.forEach(function (entry) {
        supabaseClient.from(entry.table).insert(entry.row).then(function (result) {
            if (result.error) {
                queueForRetry(entry.table, entry.row);
            }
        });
    });
}

function recordAttempt(lessonId, isCorrect, expression) {
    if (!currentUserId || !lessonId) {
        return;
    }

    let row = {
        user_id: currentUserId,
        lesson_id: lessonId,
        is_correct: !!isCorrect,
        expression: expression || null
    };

    supabaseClient.from('attempts').insert(row).then(function (result) {
        if (result.error) {
            queueForRetry('attempts', row);
            return;
        }
        flushOutbox();
    });
}

function recordQuizResult(mode, size, correctCount, durationMs) {
    if (!currentUserId) {
        return;
    }

    let row = {
        user_id: currentUserId,
        mode: mode,
        size: size,
        correct_count: correctCount,
        duration_ms: durationMs
    };

    supabaseClient.from('quiz_results').insert(row).then(function (result) {
        if (result.error) {
            queueForRetry('quiz_results', row);
            return;
        }
        flushOutbox();
    });
}

// Best time counts only perfect runs, matching how the quiz has always scored it.
function fetchBestQuizTime(mode, size) {
    if (!currentUserId) {
        return Promise.resolve(null);
    }

    return supabaseClient
        .from('quiz_results')
        .select('duration_ms')
        .eq('mode', mode)
        .eq('size', size)
        .eq('correct_count', size)
        .order('duration_ms', { ascending: true })
        .limit(1)
        .then(function (result) {
            if (result.error || !result.data.length) {
                return null;
            }
            return result.data[0].duration_ms;
        });
}

function fetchLessonStats() {
    if (!currentUserId) {
        return Promise.resolve([]);
    }

    return supabaseClient
        .from('lesson_stats')
        .select('*')
        .then(function (result) {
            return result.error ? [] : result.data;
        });
}

function fetchRecentMistakes(limit) {
    if (!currentUserId) {
        return Promise.resolve([]);
    }

    return supabaseClient
        .from('attempts')
        .select('lesson_id, expression, created_at')
        .eq('is_correct', false)
        .not('expression', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit || 10)
        .then(function (result) {
            return result.error ? [] : result.data;
        });
}

function fetchLessonAttempts(lessonId, limit) {
    if (!currentUserId) {
        return Promise.resolve([]);
    }

    return supabaseClient
        .from('attempts')
        .select('is_correct, expression, created_at')
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false })
        .limit(limit || 50)
        .then(function (result) {
            return result.error ? [] : result.data;
        });
}

function fetchQuizBests() {
    if (!currentUserId) {
        return Promise.resolve([]);
    }

    return supabaseClient
        .from('quiz_results')
        .select('mode, size, duration_ms, correct_count')
        .order('duration_ms', { ascending: true })
        .then(function (result) {
            return result.error ? [] : result.data;
        });
}

supabaseClient.auth.onAuthStateChange(function (event, session) {
    currentUserId = session ? session.user.id : null;
    flushOutbox();
});

supabaseClient.auth.getSession().then(function (result) {
    currentUserId = result.data.session ? result.data.session.user.id : null;
    flushOutbox();
});
