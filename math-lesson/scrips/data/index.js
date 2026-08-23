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

function recordQuizResult(mode, size, correctCount, durationMs, kind) {
    if (!currentUserId) {
        return;
    }

    let row = {
        user_id: currentUserId,
        mode: mode,
        size: size,
        correct_count: correctCount,
        duration_ms: durationMs,
        kind: kind || 'count'
    };

    supabaseClient.from('quiz_results').insert(row).then(function (result) {
        if (result.error) {
            queueForRetry('quiz_results', row);
            return;
        }
        flushOutbox();
    });
}

// Two different notions of "best": a fixed-count round is the fastest perfect
// run, a timed one is the highest score. Returns whichever this kind means.
function fetchBestQuizResult(mode, size, kind) {
    if (!currentUserId) {
        return Promise.resolve(null);
    }

    let timed = kind === 'timed';
    let query = supabaseClient
        .from('quiz_results')
        .select(timed ? 'correct_count' : 'duration_ms')
        .eq('mode', mode)
        .eq('size', size)
        .eq('kind', kind || 'count');

    if (!timed) {
        query = query.eq('correct_count', size);   // only perfect runs count
    }

    return query
        .order(timed ? 'correct_count' : 'duration_ms', { ascending: !timed })
        .limit(1)
        .then(function (result) {
            if (result.error || !result.data.length) {
                return null;
            }
            return timed ? result.data[0].correct_count : result.data[0].duration_ms;
        });
}

// Start of the calendar period, in the child's own timezone, or null for "all".
function rangeStartISO(range) {
    if (!range || range === 'all') {
        return null;
    }

    let now = new Date();
    let start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (range === 'week') {
        // week starts Monday; getDay() is 0 for Sunday
        let weekday = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - weekday);
    } else if (range === 'month') {
        start.setDate(1);
    } else if (range === 'year') {
        start.setMonth(0, 1);
    }

    return start.toISOString();
}

// Aggregated in Postgres rather than client-side: PostgREST caps rows at 1000
// by default, so summing attempts in the browser would quietly under-report
// once a child passes that many.
function fetchLessonStats(range) {
    if (!currentUserId) {
        return Promise.resolve([]);
    }

    return supabaseClient
        .rpc('lesson_stats_since', { since: rangeStartISO(range) })
        .then(function (result) {
            return result.error ? [] : result.data;
        });
}

function fetchRecentMistakes(limit, range) {
    if (!currentUserId) {
        return Promise.resolve([]);
    }

    let since = rangeStartISO(range);
    let query = supabaseClient
        .from('attempts')
        .select('lesson_id, expression, created_at')
        .eq('is_correct', false)
        .not('expression', 'is', null);

    if (since) {
        query = query.gte('created_at', since);
    }

    return query
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

function fetchQuizBests(range) {
    if (!currentUserId) {
        return Promise.resolve([]);
    }

    let since = rangeStartISO(range);
    let query = supabaseClient
        .from('quiz_results')
        .select('kind, mode, size, duration_ms, correct_count');

    if (since) {
        query = query.gte('created_at', since);
    }

    return query
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
