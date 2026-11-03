// "เมืองของฉัน": a town round the world that grows with the child's learning.
// Each grade is a district with one of the world's landmarks, built up tier by
// tier as the grade's lessons grow strong; the trophies stand in the temple
// square, every day of the streak puts a car on the road and every seventh a
// robot animal too, and a day's goal met sets off fireworks. The skytrain runs
// overhead and Nang Kwak beckons from a shop roof. The pieces are in parts.js
// and landmarks.js.
//
// three.js is the one large library here, so it is fetched only when the page is
// first opened (the import map in index.html names it). The reload guard in the
// head only watches files the page asks for itself, so a failed fetch here gets
// its own message and retry button.

const CITY_GROUPS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'extra'];
const CITY_DISTRICT_COLOURS = { p1: '--green', p2: '--orange', p3: '--purple', p4: '--pink', p5: '--cyan', p6: '--blue', extra: '--yellow' };
const CITY_DISTRICT_NAMES = { p1: 'ป.1', p2: 'ป.2', p3: 'ป.3', p4: 'ป.4', p5: 'ป.5', p6: 'ป.6', extra: 'เสริม' };

// Blocks on a 3 x 3 grid with roads between them and a ring road round the
// edge. The middle block is the temple square, the last corner the park.
const CITY_SPACING = 22;
const CITY_BLOCK = 16;
const CITY_HALF = 37;              // the base, out to its kerb
const CITY_ROADS = [-33, -11, 11, 33];
const CITY_SLOTS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1]];
const CITY_PARK_SLOT = [1, 1];
const CITY_SKYTRAIN_ROAD = -11;
const CITY_TAP_SLOP = 6;           // pixels a finger can move and still be a tap
const CITY_FIT_RADIUS = 36;        // how much of the town has to fit across the stage

const CITY_WORLD = {
    p1: { city: 'กรุงเทพฯ', landmark: 'พระบรมมหาราชวัง', build: cityGrandPalace },
    p2: { city: 'โตเกียว', landmark: 'โตเกียวทาวเวอร์', build: cityTokyoTower },
    p3: { city: 'ปารีส', landmark: 'หอไอเฟล', build: cityEiffelTower },
    p4: { city: 'ลอนดอน', landmark: 'หอนาฬิกาบิ๊กเบน', build: cityBigBen },
    p5: { city: 'นิวยอร์ก', landmark: 'เทพีเสรีภาพ', build: cityStatueOfLiberty },
    p6: { city: 'ดูไบ', landmark: 'บุรจญ์เคาะลีฟะฮ์', build: cityBurjKhalifa },
    extra: { city: 'ซิดนีย์', landmark: 'โอเปร่าเฮาส์', build: citySydneyOpera },
};

// Cars keep to the lanes either side of a road's centre line, each lane at one
// speed so nothing overtakes; robot animals walk slowly down the middle of the
// ring road, where the skytrain has no pillars. The outer lanes are longest, so
// they take most of the cars.
const CITY_LANES = [
    { half: 9.6, speed: 3.2 }, { half: 12.4, speed: 3.2, reverse: true },
    { half: 31.6, speed: 4.4 }, { half: 34.4, speed: 4.4, reverse: true },
];
const CITY_LANE_ORDER = [2, 3, 0, 2, 3, 1, 2, 3];
const CITY_ROBOT_LANE = { half: 33, speed: 1.4 };
const CITY_MAX_CARS = 24;
const CITY_MAX_ROBOTS = 6;
// on the road from the very first visit, before any streak (CITY_CAR_KINDS)
const CITY_BASE_CARS = [0, 1, 2, 6, 1];

// People on the pavements: two lanes round every block, one each way, and two
// round the rim of the town.
const CITY_WALK_OUT = CITY_BLOCK / 2 - 0.2;
const CITY_WALK_IN = CITY_BLOCK / 2 - 0.5;
const CITY_WALKERS_PER_LANE = 2;
const CITY_RIM_WALKERS = 6;
// Sky: clouds drifting along the horizon, two flocks of birds circling over
// the rooftops, hot air balloons round the edge of town.
const CITY_CLOUDS = 9;
const CITY_PUFFS = [[0, 0, 0, 2.4], [2.2, -0.3, 0.4, 1.8], [-2.1, -0.4, -0.3, 1.7], [0.9, 0.9, -0.6, 1.5], [-1, 0.6, 0.8, 1.4]];
const CITY_FLOCKS = [{ radius: 26, height: 27, speed: 0.12 }, { radius: 42, height: 31, speed: -0.09 }];
const CITY_FLOCK_SHAPE = [[0, 0], [-1.3, -1.2], [1.3, -1.2], [-2.6, -2.4], [2.6, -2.4], [-3.9, -3.6], [3.9, -3.6]];
const CITY_BALLOONS = [['#e53935', '#ffd23f'], ['#1e88e5', '#ffffff'], ['#8e24aa', '#ff9500']];
const CITY_PAN_LIMIT = 30;      // how far from the middle the view can be moved

// The town keeps the device's own time, or the child picks day or night; the
// choice stays on this device.
const CITY_TIME_KEY = 'mathLessonCityTime';
const CITY_TIME_MODES = ['auto', 'day', 'night'];
const CITY_TIME_LABELS = { auto: 'ตามเวลาจริง', day: 'กลางวัน', night: 'กลางคืน' };
const CITY_TIME_ICONS = { auto: 'bi-clock', day: 'bi-sun-fill', night: 'bi-moon-stars-fill' };

// The sky through a day: at each hour its colour, the light from the sky and
// from the sun (or the moon), how bright the windows and signs are, and the
// clouds' colour. Between two hours everything blends.
const CITY_NIGHT = { sky: 0x0b1a2e, hemi: 0.35, hemiColour: 0x8fa8d6, sun: 0.3, sunColour: 0x9fb4ff, glow: 1.1, cloud: 0x46546b };
const CITY_NOON = { sky: 0x8ecbef, hemi: 1.2, hemiColour: 0xfff4e0, sun: 2.2, sunColour: 0xfff1d6, glow: 0, cloud: 0xffffff };
const CITY_DAY = [
    Object.assign({ hour: 0 }, CITY_NIGHT),
    Object.assign({ hour: 5 }, CITY_NIGHT),
    { hour: 6, sky: 0xf6b38a, hemi: 0.8, hemiColour: 0xffd2b0, sun: 1.2, sunColour: 0xffb070, glow: 0.5, cloud: 0xf7c9b0 },
    { hour: 7.5, sky: 0xa9d8f5, hemi: 1.1, hemiColour: 0xfff4e0, sun: 2.0, sunColour: 0xfff1d6, glow: 0, cloud: 0xffffff },
    Object.assign({ hour: 12 }, CITY_NOON),
    Object.assign({ hour: 17 }, CITY_NOON),
    { hour: 18.2, sky: 0xf08a5d, hemi: 0.8, hemiColour: 0xffb38a, sun: 1.1, sunColour: 0xff8a50, glow: 0.6, cloud: 0xf5a98a },
    { hour: 19.3, sky: 0x3a2f5e, hemi: 0.5, hemiColour: 0xa08fd6, sun: 0.4, sunColour: 0xb39ddb, glow: 1.0, cloud: 0x6a5a85 },
    Object.assign({ hour: 20.5 }, CITY_NIGHT),
    Object.assign({ hour: 24 }, CITY_NIGHT),
];

const CITY_SHIRTS = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#fb8c00', '#00acc1', '#f06292', '#f5f5f5', '#5d4037'];
const CITY_SKINS = ['#f6d2b0', '#e8b98f', '#c98f65', '#8d5a3b'];
const CITY_HAIRS = ['#1d1d1d', '#3b2a20', '#5d4037', '#2b2b2b'];

var cityState = {
    three: null,          // { THREE, MapControls, merge } once loaded
    loading: null,
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    lights: null,
    materials: null,
    world: null,          // the streets, temple and shop: the same for every child
    occluders: [],
    town: null,           // the group rebuilt from each child's data
    pickables: [],
    selectedRing: null,
    vehicles: [],
    boats: [],
    sky: null,
    skytrain: null,
    nangKwak: null,
    clock: 0,
    fireworks: [],
    fireworksOn: false,
    nextBurstAt: 0,
    running: false,
    frames: 0,
    drawCalls: 0,
    owner: null,
    counts: null,
    night: null,          // the stars and the moon
    skyAt: 0,             // when the sky was last brought up to the hour
    hourShown: 0,
    timeFallback: null,
    touched: false,       // once the child has zoomed, a resize keeps their view
};

function cityColour(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888888';
}

function cityTimeMode() {
    try {
        let mode = localStorage.getItem(CITY_TIME_KEY);
        return CITY_TIME_MODES.indexOf(mode) !== -1 ? mode : 'auto';
    } catch (e) {
        return cityState.timeFallback || 'auto';
    }
}

// The hour the town shows, 0 to 24.
function cityHour() {
    let mode = cityTimeMode();
    if (mode === 'day') {
        return 12;
    }
    if (mode === 'night') {
        return 22;
    }
    let now = new Date();
    return now.getHours() + now.getMinutes() / 60;
}

function cityStill() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function loadCityThree() {
    if (!cityState.loading) {
        cityState.loading = Promise.all([
            import('three'),
            import('three/addons/controls/MapControls.js'),
            import('three/addons/utils/BufferGeometryUtils.js'),
        ]).then(function (modules) {
            cityState.three = { THREE: modules[0], MapControls: modules[1].MapControls, merge: modules[2].mergeGeometries };
            return cityState.three;
        }).catch(function (error) {
            cityState.loading = null;   // a later open tries again
            throw error;
        });
    }
    return cityState.loading;
}

function showCityStatus(kind) {
    $('#cityStatus').toggle(kind !== 'ready');
    $('#cityLoading').toggle(kind === 'loading');
    $('#cityFailed').toggle(kind === 'failed');
    $('#cityNoWebgl').toggle(kind === 'nowebgl');
}

// Text on a sprite, for the district names and the park's sign.
function citySign(THREE, text, colour) {
    let canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    let context = canvas.getContext('2d');

    context.fillStyle = 'rgba(255, 255, 255, 0.92)';
    context.beginPath();
    context.roundRect(4, 4, 504, 88, 28);
    context.fill();
    context.fillStyle = colour;
    context.font = 'bold 48px ' + getComputedStyle(document.body).fontFamily;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 256, 50, 480);

    let texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    let sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false }));
    sprite.scale.set(9.6, 1.8, 1);
    return sprite;
}

// How far a landmark is built, 0 to 5, from its grade's lessons: a lesson
// counts 0 when new, 1 started, 2 practising and 3 strong. Any start at all
// begins the build; the last tier waits for every lesson to be strong.
function cityTier(lessons) {
    let weight = { new: 0, started: 1, practising: 2, strong: 3 };
    let done = lessons.reduce(function (sum, lesson) { return sum + weight[lesson.stage]; }, 0) / (3 * lessons.length);

    if (lessons.every(function (lesson) { return lesson.stage === 'strong'; })) {
        return 5;
    }
    return done >= 0.75 ? 4 : done >= 0.5 ? 3 : done >= 0.25 ? 2 : done > 0 ? 1 : 0;
}

// The lesson to send a child to from a landmark: one nearly there first, then
// one begun, then a new one, in the order of the menu. None once all are strong.
function cityNextLesson(lessons) {
    let order = ['practising', 'started', 'new'];
    for (let i = 0; i < order.length; i++) {
        let lesson = lessons.find(function (each) { return each.stage === order[i]; });
        if (lesson) {
            return lesson;
        }
    }
    return null;
}

// A closed loop round a square of roads, `half` from the centre, for a car to
// follow. Straight runs are filled in so the curve does not bulge.
function cityLoop(THREE, half, radius) {
    let points = [];
    let corners = [[1, 1, 0], [-1, 1, Math.PI / 2], [-1, -1, Math.PI], [1, -1, Math.PI * 1.5]];

    corners.forEach(function (corner, index) {
        let cx = corner[0] * (half - radius), cz = corner[1] * (half - radius);
        for (let i = 0; i <= 4; i++) {
            let angle = corner[2] + i * Math.PI / 8;
            points.push(new THREE.Vector3(cx + Math.cos(angle) * radius, 0, cz + Math.sin(angle) * radius));
        }
        let next = corners[(index + 1) % 4];
        let from = points[points.length - 1];
        let to = new THREE.Vector3(next[0] * (half - radius) + Math.cos(next[2]) * radius, 0, next[1] * (half - radius) + Math.sin(next[2]) * radius);
        for (let i = 1; i < 6; i++) {
            points.push(from.clone().lerp(to, i / 6));
        }
    });
    return new THREE.CatmullRomCurve3(points, true);
}

// ---------- what every child's town has ----------

function buildCityWorld() {
    let THREE = cityState.three.THREE, merge = cityState.three.merge;
    let shapes = cityShapes(THREE);
    let b = cityBrush(THREE, shapes);
    let world = new THREE.Group();
    let poles = 0;

    // the base: asphalt on top, the soil showing round its edge
    b.place(0, -3, 0);
    b.put(citySlab(THREE, cityRoundedShape(THREE, CITY_HALF, 6), 3), ['#4a4d52', '#8b5e3c'], [0, 0, 0]);
    let rim = cityRoundedShape(THREE, CITY_HALF, 6);
    rim.holes.push(cityRoundedShape(THREE, CITY_HALF - 1, 5));
    b.place(0, 0, 0);
    b.put(citySlab(THREE, rim, CITY_KERB), ['#d6cfc2', '#a9a39a'], [0, 0, 0]);

    // nine raised blocks of pavement
    let blockShape = cityRoundedShape(THREE, CITY_BLOCK / 2, 0.8);
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let top = i === 0 && j === 0 ? '#e9dfca' : (i === CITY_PARK_SLOT[0] && j === CITY_PARK_SLOT[1] ? '#79b95a' : '#d6cfc2');
            b.place(i * CITY_SPACING, 0, j * CITY_SPACING);
            b.put(citySlab(THREE, blockShape, CITY_KERB), [top, '#a9a39a'], [0, 0, 0]);
        }
    }
    b.place(0, 0, 0);

    // dashed centre lines, broken at the junctions, and zebra crossings
    CITY_ROADS.forEach(function (road) {
        for (let t = -CITY_HALF + 2; t < CITY_HALF - 1; t += 2.5) {
            if (CITY_ROADS.some(function (cross) { return Math.abs(t - cross) < 5.2; })) {
                continue;
            }
            b.box('#f2f2f2', t, 0.012, road, 1.2, 0.02, 0.14);
            b.box('#f2f2f2', road, 0.012, t, 0.14, 0.02, 1.2);
        }
    });
    [-11, 11].forEach(function (x) {
        [-11, 11].forEach(function (z) {
            [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (way) {
                for (let k = 0; k < 7; k++) {
                    let across = -2.4 + k * 0.8;
                    if (way[0]) {
                        b.box('#f2f2f2', x + way[0] * 4.3, 0.012, z + across, 1.4, 0.02, 0.4);
                    } else {
                        b.box('#f2f2f2', x + across, 0.012, z + way[1] * 4.3, 0.4, 0.02, 1.4);
                    }
                }
            });
        });
    });

    // a pole on every block corner, wires along each side and across the roads
    let corner = function (i, j, sx, sz) {
        return [i * CITY_SPACING + sx * (CITY_BLOCK / 2 - 0.35), j * CITY_SPACING + sz * (CITY_BLOCK / 2 - 0.35)];
    };
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c, k) {
                let spot = corner(i, j, c[0], c[1]);
                cityPole(b, spot[0], spot[1], Math.atan2(c[0], c[1]), (i + j + k) % 3 === 0);
                poles++;
                let next = [[-1, -1], [1, -1], [1, 1], [-1, 1]][(k + 1) % 4];
                cityWires(THREE, b, spot, corner(i, j, next[0], next[1]), 3 + (i + j + k + 3) % 2);
            });
            if (i < 1) {
                cityWires(THREE, b, corner(i, j, 1, -1), corner(i + 1, j, -1, -1), 3);
                cityWires(THREE, b, corner(i, j, 1, 1), corner(i + 1, j, -1, 1), 2);
            }
            if (j < 1) {
                cityWires(THREE, b, corner(i, j, -1, 1), corner(i, j + 1, -1, -1), 2);
                cityWires(THREE, b, corner(i, j, 1, 1), corner(i, j + 1, 1, -1), 3);
            }
        }
    }

    // the skytrain line runs along one road, with a station over the square
    b.place(0, 0, 0);
    citySkytrainLine(b, CITY_SKYTRAIN_ROAD, -CITY_HALF, CITY_HALF, [-27, -19, -4.5, 4.5, 19, 27]);

    // the temple square: the hall, a spirit house, trees, noodle carts
    b.place(-1, 0, -1.6);
    cityTemple(b);
    b.place(5.8, 0, 0.6, -Math.PI / 2);
    citySpiritHouse(b);
    [[-6.6, -6.6], [6.6, -6.6], [-6.6, -3]].forEach(function (spot) {
        b.place(0, 0, 0);
        cityTree(b, spot[0], spot[1], 1, CITY_KERB);
    });
    [[-6, 6.9], [-3.2, 6.9]].forEach(function (spot) {
        b.place(spot[0], 0, spot[1]);
        cityFoodCart(b);
    });

    // the corner shop Nang Kwak sits on
    let shopSigns = [];
    b.place(5, CITY_KERB, 5);
    cityCornerShop(b, 4, 4, '#c62828', shopSigns);

    // the park's pavilion, benches and a cart
    let park = [CITY_PARK_SLOT[0] * CITY_SPACING, CITY_PARK_SLOT[1] * CITY_SPACING];
    b.place(park[0] - 4.6, CITY_KERB, park[1] + 5.2);
    [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].forEach(function (post) {
        b.box('#8b5a3c', post[0], 0.8, post[1], 0.14, 1.6, 0.14);
    });
    b.box('#c9a77c', 0, 0.3, 0, 2.6, 0.12, 2.6);
    b.put(shapes.prism, '#c8432b', [0, 1.6, 0], [3.0, 1.1, 3.0]);
    b.put(shapes.spire, '#e6c14a', [0, 2.9, 0], [0.15, 0.5, 0.15]);
    [0.5, 3].forEach(function (x) {
        b.place(park[0] + x, CITY_KERB, park[1] + 6.2);
        b.box('#8b5a3c', 0, 0.35, 0, 1.4, 0.08, 0.4);
        b.box('#8b5a3c', 0, 0.55, -0.18, 1.4, 0.3, 0.06);
        b.box('#5b6770', -0.6, 0.17, 0, 0.08, 0.34, 0.35);
        b.box('#5b6770', 0.6, 0.17, 0, 0.08, 0.34, 0.35);
    });
    b.place(park[0] + 5.6, 0, park[1] + 6.9);
    cityFoodCart(b);
    b.place(0, 0, 0);
    for (let i = 0; i < 12; i++) {
        cityTree(b, park[0] - 6 + (i % 4) * 4, park[1] - 6 + Math.floor(i / 4) * 3.6, 0.9 + (i * 7 % 5) * 0.06, CITY_KERB);
    }

    let mesh = cityBrushMesh(THREE, merge, b, cityState.materials);
    world.add(mesh);

    let sheet = citySignSheet(THREE, ['ร้านโชห่วย'], ['#c62828']);
    let signMaterial = new THREE.MeshStandardMaterial({ map: sheet, emissiveMap: sheet, emissive: 0xffffff, emissiveIntensity: 0 });
    world.add(citySignMesh(THREE, merge, shopSigns, signMaterial));
    cityState.shopSign = signMaterial;
    cityState.materials.signs = [signMaterial];

    // Nang Kwak on the shop roof, turned a little towards the street
    let nangKwak = cityNangKwak(THREE);
    nangKwak.position.set(5, CITY_KERB + CITY_SHOP_FLOORS * CITY_FLOOR + 0.25, 4.8);
    nangKwak.rotation.y = Math.PI / 7;
    nangKwak.scale.setScalar(0.85);
    world.add(nangKwak);

    // the paths the streak's cars and robots follow
    CITY_LANES.concat([CITY_ROBOT_LANE]).forEach(function (lane) {
        lane.curve = cityLoop(THREE, lane.half, 2.2);
        lane.length = lane.curve.getLength();
    });

    // and the train
    let train = cityBrush(THREE, shapes);
    citySkytrain(train);
    let skytrain = cityBrushMesh(THREE, merge, train, cityState.materials);
    skytrain.position.set(0, 6.6, CITY_SKYTRAIN_ROAD);
    world.add(skytrain);

    Object.values(shapes).forEach(function (shape) { shape.dispose(); });

    buildCityPeople(world);
    buildCitySky(world);

    cityState.world = world;
    cityState.occluders = [mesh];
    cityState.skytrain = skytrain;
    cityState.nangKwak = nangKwak;
    cityState.poles = poles;
    cityState.scene.add(world);
    placeCityLife(0);
}

// People out and about: most walking round the blocks and the rim, a few
// standing at the noodle carts, at the spirit house or playing in the park.
// One instanced mesh each for bodies, heads and hair, so the whole crowd costs
// three draws however many there are.
function buildCityPeople(world) {
    let THREE = cityState.three.THREE;
    let walkers = [];
    let n = 0;
    let lane = function (half, radius, cx, cz, count, reverse) {
        let curve = cityLoop(THREE, half, radius);
        let length = curve.getLength();
        for (let k = 0; k < count; k++) {
            walkers.push({ curve: curve, length: length, cx: cx, cz: cz, offset: (k + n * 0.37) / count % 1, speed: 0.7 + (n % 3) * 0.15, reverse: reverse, size: n % 5 === 0 ? 0.78 : 1, phase: n });
            n++;
        }
    };

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            lane(CITY_WALK_OUT, 1.6, i * CITY_SPACING, j * CITY_SPACING, CITY_WALKERS_PER_LANE, false);
            lane(CITY_WALK_IN, 1.6, i * CITY_SPACING, j * CITY_SPACING, CITY_WALKERS_PER_LANE, true);
        }
    }
    lane(CITY_HALF - 0.3, 5.7, 0, 0, CITY_RIM_WALKERS, false);
    lane(CITY_HALF - 0.7, 5.3, 0, 0, CITY_RIM_WALKERS, true);

    // [x, z, facing, size, robe]: customers, a monk before the temple, someone
    // at the spirit house, children playing in the park (they hop)
    let park = [CITY_PARK_SLOT[0] * CITY_SPACING, CITY_PARK_SLOT[1] * CITY_SPACING];
    let standers = [
        { x: -4.85, z: 6.9, angle: -Math.PI / 2, size: 1 },
        { x: -2.05, z: 6.9, angle: -Math.PI / 2, size: 1 },
        { x: park[0] + 4.5, z: park[1] + 6.9, angle: Math.PI / 2, size: 1 },
        { x: 4.9, z: 0.6, angle: Math.PI / 2, size: 1 },
        { x: -1, z: 4.4, angle: Math.PI, size: 1, robe: '#f39c12' },
        { x: park[0], z: park[1] + 4.4, angle: 0, size: 0.75, hop: true },
        { x: park[0] + 1.3, z: park[1] + 4.9, angle: -Math.PI / 2, size: 0.75, hop: true },
        { x: park[0] - 0.8, z: park[1] + 5, angle: Math.PI / 2, size: 0.75, hop: true },
    ];

    let total = walkers.length + standers.length;
    let make = function (geometry) {
        let mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({ roughness: 0.8 }), total);
        mesh.castShadow = true;
        mesh.frustumCulled = false;     // they move about, so the first box drawn round them would not hold
        world.add(mesh);
        return mesh;
    };
    let people = {
        walkers: walkers, standers: standers,
        bodies: make(new THREE.CylinderGeometry(0.15, 0.2, 0.62, 8)),
        heads: make(new THREE.SphereGeometry(0.17, 10, 8)),
        hair: make(new THREE.SphereGeometry(0.18, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2)),
        base: new THREE.Matrix4(), part: new THREE.Matrix4(),
        at: new THREE.Vector3(), size: new THREE.Vector3(), turn: new THREE.Quaternion(), up: new THREE.Vector3(0, 1, 0),
        offsets: {
            body: new THREE.Matrix4().makeTranslation(0, 0.31, 0),
            head: new THREE.Matrix4().makeTranslation(0, 0.8, 0),
            hair: new THREE.Matrix4().makeTranslation(0, 0.83, -0.02),
        },
    };
    let colour = new THREE.Color();
    for (let i = 0; i < total; i++) {
        let stander = standers[i - walkers.length];
        people.bodies.setColorAt(i, colour.set(stander && stander.robe ? stander.robe : CITY_SHIRTS[i * 7 % CITY_SHIRTS.length]));
        people.heads.setColorAt(i, colour.set(CITY_SKINS[i * 3 % CITY_SKINS.length]));
        // the monk's head is shaved
        people.hair.setColorAt(i, colour.set(stander && stander.robe ? CITY_SKINS[i * 3 % CITY_SKINS.length] : CITY_HAIRS[i % CITY_HAIRS.length]));
    }
    cityState.people = people;
}

function placeCityPeople(time) {
    let people = cityState.people;
    let place = function (i, x, z, angle, size, lift) {
        people.turn.setFromAxisAngle(people.up, angle);
        people.base.compose(people.at.set(x, CITY_KERB + lift, z), people.turn, people.size.setScalar(size));
        people.bodies.setMatrixAt(i, people.part.multiplyMatrices(people.base, people.offsets.body));
        people.heads.setMatrixAt(i, people.part.multiplyMatrices(people.base, people.offsets.head));
        people.hair.setMatrixAt(i, people.part.multiplyMatrices(people.base, people.offsets.hair));
    };

    people.walkers.forEach(function (walker, i) {
        let u = ((walker.offset + time * walker.speed / walker.length) % 1 + 1) % 1;
        if (walker.reverse) {
            u = 1 - u;
        }
        let at = walker.curve.getPointAt(u);
        let ahead = walker.curve.getTangentAt(u);
        if (walker.reverse) {
            ahead.negate();
        }
        place(i, walker.cx + at.x, walker.cz + at.z, Math.atan2(ahead.x, ahead.z), walker.size, Math.abs(Math.sin(time * 7 + walker.phase)) * 0.05);
    });
    people.standers.forEach(function (stander, k) {
        place(people.walkers.length + k, stander.x, stander.z, stander.angle, stander.size, stander.hop ? Math.abs(Math.sin(time * 4 + k)) * 0.3 : 0);
    });
    [people.bodies, people.heads, people.hair].forEach(function (mesh) { mesh.instanceMatrix.needsUpdate = true; });
}

function buildCitySky(world) {
    let THREE = cityState.three.THREE, merge = cityState.three.merge;
    let shapes = cityShapes(THREE);
    let clouds = [];

    for (let i = 0; i < CITY_CLOUDS; i++) {
        // just beyond the town's edge and low, where a camera looking down on the
        // streets still sees them over the far side
        clouds.push({ phase: i / CITY_CLOUDS, y: 6 + i * 37 % 9, radius: 58 + (i % 3) * 8, speed: 0.006 + (i % 3) * 0.003, size: 1.8 + (i % 4) * 0.4 });
    }
    let cloudMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.45, roughness: 1, flatShading: true, transparent: true, opacity: 0.85, depthWrite: false }), CITY_CLOUDS * CITY_PUFFS.length);
    cloudMesh.frustumCulled = false;
    world.add(cloudMesh);

    // a bird is two wings meeting at its body, each flapping about the middle
    let left = new THREE.BoxGeometry(0.9, 0.05, 0.4).translate(-0.45, 0, 0);
    let right = new THREE.BoxGeometry(0.9, 0.05, 0.4).translate(0.45, 0, 0);
    let birdMaterial = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 0.8 });
    let count = CITY_FLOCKS.length * CITY_FLOCK_SHAPE.length;
    let wings = [new THREE.InstancedMesh(left, birdMaterial, count), new THREE.InstancedMesh(right, birdMaterial, count)];
    wings.forEach(function (mesh) {
        mesh.frustumCulled = false;
        world.add(mesh);
    });

    let balloons = CITY_BALLOONS.map(function (colours, i) {
        let b = cityBrush(THREE, shapes);
        cityBalloon(b, colours[0], colours[1]);
        let mesh = cityBrushMesh(THREE, merge, b, cityState.materials);
        mesh.receiveShadow = false;
        world.add(mesh);
        return { mesh: mesh, radius: 36 + i * 6, height: 28 + i * 4, phase: i * 2.1, speed: 0.02 + i * 0.006 };
    });
    Object.values(shapes).forEach(function (shape) { shape.dispose(); });

    cityState.sky = {
        clouds: clouds, cloudMesh: cloudMesh, wings: wings, balloons: balloons,
        base: new THREE.Matrix4(), part: new THREE.Matrix4(), flap: new THREE.Matrix4(), out: new THREE.Matrix4(),
        at: new THREE.Vector3(), size: new THREE.Vector3(), turn: new THREE.Quaternion(), up: new THREE.Vector3(0, 1, 0),
    };
}

function placeCitySky(time) {
    let sky = cityState.sky;
    let k = 0;

    // clouds drift along the horizon beyond the town, on the far side from
    // wherever the camera is, so they never come between it and the streets;
    // each wraps round at the edge of the view, out of sight
    let target = cityState.controls ? cityState.controls.target : sky.at.set(0, 0, 0);
    let camera = cityState.camera.position;
    let far = Math.atan2(target.x - camera.x, target.z - camera.z);
    let tx = target.x, tz = target.z;
    sky.clouds.forEach(function (cloud) {
        let along = ((cloud.phase + time * cloud.speed) % 1 + 1) % 1;
        let angle = far + (along - 0.5) * 2.4;
        let x = tx + Math.sin(angle) * cloud.radius, z = tz + Math.cos(angle) * cloud.radius;
        CITY_PUFFS.forEach(function (puff) {
            sky.base.compose(sky.at.set(x + puff[0] * cloud.size * 1.6, cloud.y + puff[1] * cloud.size, z + puff[2] * cloud.size * 1.6), sky.turn.identity(), sky.size.setScalar(puff[3] * cloud.size));
            sky.cloudMesh.setMatrixAt(k++, sky.base);
        });
    });
    sky.cloudMesh.instanceMatrix.needsUpdate = true;

    // each flock flies a circle in a V, facing the way it goes
    let n = 0;
    CITY_FLOCKS.forEach(function (flock, f) {
        let angle = time * flock.speed + f * Math.PI;
        let way = flock.speed > 0 ? 1 : -1;
        sky.turn.setFromAxisAngle(sky.up, Math.atan2(-Math.sin(angle) * way, Math.cos(angle) * way));
        sky.base.compose(sky.at.set(Math.cos(angle) * flock.radius, flock.height + Math.sin(time * 0.5 + f) * 1.5, Math.sin(angle) * flock.radius), sky.turn, sky.size.setScalar(1));
        CITY_FLOCK_SHAPE.forEach(function (spot, i) {
            let beat = Math.sin(time * 9 + i * 0.7 + f) * 0.6;
            sky.part.multiplyMatrices(sky.base, sky.out.makeTranslation(spot[0], (i % 2) * 0.3, spot[1]));
            sky.wings[0].setMatrixAt(n, sky.out.multiplyMatrices(sky.part, sky.flap.makeRotationZ(beat)));
            sky.wings[1].setMatrixAt(n, sky.out.multiplyMatrices(sky.part, sky.flap.makeRotationZ(-beat)));
            n++;
        });
    });
    sky.wings.forEach(function (mesh) { mesh.instanceMatrix.needsUpdate = true; });

    sky.balloons.forEach(function (balloon) {
        let a = time * balloon.speed + balloon.phase;
        balloon.mesh.position.set(Math.cos(a) * balloon.radius, balloon.height + Math.sin(time * 0.3 + balloon.phase) * 2, Math.sin(a) * balloon.radius);
        balloon.mesh.rotation.y = time * 0.05 + balloon.phase;
    });

    // the sailboat tacks to and fro across the harbour
    cityState.boats.forEach(function (boat) {
        let swing = time * boat.speed;
        boat.mesh.position.set(boat.x + Math.sin(swing) * boat.range, CITY_KERB + 0.08 + Math.sin(time * 2) * 0.04, boat.z);
        boat.mesh.rotation.y = Math.cos(swing) >= 0 ? Math.PI / 2 : -Math.PI / 2;
    });
}

// Where the cars, the robots, the people, the train and Nang Kwak's arm are
// `time` seconds in.
function placeCityLife(time) {
    cityState.vehicles.forEach(function (mover) {
        let lane = mover.lane;
        let u = ((mover.offset + time * lane.speed / lane.length) % 1 + 1) % 1;
        if (lane.reverse) {
            u = 1 - u;
        }
        let at = lane.curve.getPointAt(u);
        let ahead = lane.curve.getTangentAt(u);
        if (lane.reverse) {
            ahead.negate();
        }
        // a robot animal bobs as it walks
        let lift = mover.robot ? Math.abs(Math.sin(time * 6 + mover.offset * 20)) * 0.18 : 0;
        mover.mesh.position.set(at.x, lift, at.z);
        mover.mesh.lookAt(at.x + ahead.x, lift, at.z + ahead.z);
    });

    if (cityState.people) {
        placeCityPeople(time);
    }
    if (cityState.sky) {
        placeCitySky(time);
    }

    // the train glides end to end, slowing for each end of the line
    if (cityState.skytrain) {
        cityState.skytrain.position.x = 29 * Math.sin(time * 2 * Math.PI / 36);
        cityState.nangKwak.userData.arm.rotation.x = -0.35 + Math.sin(time * 3) * 0.35;
    }
}

function cityMover(THREE, merge, shapes, build, lane, offset, robot) {
    let v = cityBrush(THREE, shapes);
    build(v);
    return { mesh: cityBrushMesh(THREE, merge, v, cityState.materials), lane: lane, offset: offset, robot: robot };
}

// ---------- each child's own town ----------

function disposeCityTown() {
    if (!cityState.town) {
        return;
    }
    cityState.scene.remove(cityState.town);
    cityState.town.traverse(function (node) {
        if (node.userData.shared) {
            return;
        }
        if (node.geometry) {
            node.geometry.dispose();
        }
        if (node.material && node.userData.ownMaterial) {
            if (node.material.map) {
                node.material.map.dispose();
            }
            node.material.dispose();
        }
    });
    cityState.town = null;
    cityState.pickables = [];
    cityState.vehicles = [];
    cityState.boats = [];
}

// Rebuilt on every open: what a child has done changes between visits.
function buildCityTown(data) {
    let THREE = cityState.three.THREE, merge = cityState.three.merge;
    let shapes = cityShapes(THREE);
    let b = cityBrush(THREE, shapes);
    let town = new THREE.Group();
    let counts = { landmarks: 0, finished: 0, lessons: 0, new: 0, started: 0, practising: 0, strong: 0, trophies: 0, cars: 0, robots: 0, tiers: {} };
    let proxyShape = new THREE.BoxGeometry(1, 1, 1);
    let proxyMaterial = new THREE.MeshBasicMaterial();
    let pickables = [];
    let cup = new THREE.CylinderGeometry(0.32, 0.14, 0.5, 14);

    CITY_GROUPS.forEach(function (group, index) {
        let cx = CITY_SLOTS[index][0] * CITY_SPACING;
        let cz = CITY_SLOTS[index][1] * CITY_SPACING;
        let colour = cityColour(CITY_DISTRICT_COLOURS[group]);
        let lessons = data.lessons[group];
        let place = CITY_WORLD[group];
        let tier = cityTier(lessons);

        b.place(cx, CITY_KERB, cz);
        let height = place.build(b, tier, colour);
        lessons.forEach(function (lesson) {
            counts[lesson.stage]++;
            counts.lessons++;
        });
        counts.tiers[group] = tier;
        counts.landmarks++;
        counts.finished += tier === 5 ? 1 : 0;

        // an unseen box round the landmark is what a tap finds
        let proxy = new THREE.Mesh(proxyShape, proxyMaterial);
        proxy.visible = false;
        proxy.scale.set(CITY_BLOCK - 2, height + 1, CITY_BLOCK - 2);
        proxy.position.set(cx, CITY_KERB + (height + 1) / 2, cz);
        proxy.userData.district = {
            group: group, city: place.city, landmark: place.landmark, tier: tier, total: lessons.length,
            strong: lessons.filter(function (lesson) { return lesson.stage === 'strong'; }).length,
            next: cityNextLesson(lessons),
        };
        proxy.userData.shared = true;
        town.add(proxy);
        pickables.push(proxy);

        let sign = citySign(THREE, place.city + ' ' + '★'.repeat(tier) + '☆'.repeat(5 - tier), colour);
        // on the front edge, low, so it names the landmark without hiding it
        sign.position.set(cx, 3.2, cz + CITY_BLOCK / 2 + 0.4);
        sign.userData.ownMaterial = true;
        town.add(sign);
    });

    // the square: one cup for every trophy held, gold first, before the temple
    let cups = [];
    FINAL_QUIZ_TROPHIES.forEach(function (trophy) {
        for (let i = 0; i < (data.trophies ? data.trophies[trophy.id] : 0); i++) {
            cups.push(cityColour('--trophy-' + trophy.id));
        }
    });
    cups.forEach(function (colour, position) {
        b.place(-6.6 + position * 1.05, CITY_KERB, 5.6);
        b.box('#f3efe6', 0, 0.3, 0, 0.8, 0.6, 0.8);
        b.put(shapes.cylinder, colour, [0, 0.66, 0], [0.5, 0.12, 0.5], null, 'metal');
        b.put(shapes.post, colour, [0, 0.86, 0], [0.12, 0.35, 0.12], null, 'metal');
        b.put(cup, colour, [0, 1.25, 0], null, null, 'metal');
        counts.trophies++;
    });
    town.add(cityBrushMesh(THREE, merge, b, cityState.materials));

    // the town's own few cars, then the streak's: a car for every day in a row,
    // and every seventh day a robot animal as well, spaced evenly along lanes
    let cars = Math.min(data.streak, CITY_MAX_CARS);
    let robots = Math.min(Math.floor(data.streak / 7), CITY_MAX_ROBOTS);
    let lanes = CITY_LANES.map(function () { return []; });
    let vehicles = [];
    let kinds = CITY_BASE_CARS.map(function (kind) { return CITY_CAR_KINDS[kind]; });
    for (let i = 0; i < cars; i++) {
        kinds.push(CITY_CAR_KINDS[i % CITY_CAR_KINDS.length]);
    }
    kinds.forEach(function (kind, i) {
        lanes[CITY_LANE_ORDER[i % CITY_LANE_ORDER.length]].push(kind);
    });
    lanes.forEach(function (kinds, lane) {
        kinds.forEach(function (kind, k) {
            vehicles.push(cityMover(THREE, merge, shapes, kind, CITY_LANES[lane], k / kinds.length, false));
        });
    });
    for (let i = 0; i < robots; i++) {
        vehicles.push(cityMover(THREE, merge, shapes, CITY_ROBOT_KINDS[i % CITY_ROBOT_KINDS.length], CITY_ROBOT_LANE, i / robots, true));
    }
    vehicles.forEach(function (mover) { town.add(mover.mesh); });
    counts.cars = cars;
    counts.robots = robots;

    let parkX = CITY_PARK_SLOT[0] * CITY_SPACING, parkZ = CITY_PARK_SLOT[1] * CITY_SPACING;
    let parkSign = citySign(THREE, 'ฝึกต่อเนื่อง ' + data.streak + ' วัน', cityColour('--green'));
    parkSign.position.set(parkX, 3.2, parkZ + CITY_BLOCK / 2 + 0.4);
    parkSign.userData.ownMaterial = true;
    town.add(parkSign);

    let boats = [];
    if (counts.tiers.extra >= 4) {
        let sydney = CITY_SLOTS[CITY_GROUPS.indexOf('extra')];
        let sail = cityBrush(THREE, shapes);
        citySailboat(sail);
        let mesh = cityBrushMesh(THREE, merge, sail, cityState.materials);
        town.add(mesh);
        boats.push({ mesh: mesh, x: sydney[0] * CITY_SPACING, z: sydney[1] * CITY_SPACING + 5.45, range: 4.5, speed: 0.25 });
    }

    Object.values(shapes).forEach(function (shape) { shape.dispose(); });
    cup.dispose();

    disposeCityTown();
    cityState.town = town;
    cityState.pickables = pickables;
    cityState.vehicles = vehicles;
    cityState.boats = boats;
    cityState.scene.add(town);
    cityState.counts = Object.assign(counts, { vehicles: vehicles.length, poles: cityState.poles });
    cityState.fireworksOn = data.goalMet;
    cityState.selectedRing.visible = false;
    placeCityLife(cityState.clock);
    applyCitySky();
    $('#citySelected').hide();
}

function setupCityScene() {
    let THREE = cityState.three.THREE;
    let box = document.getElementById('cityStage');
    let renderer;

    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch (e) {
        return false;
    }

    let coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute('role', 'img');
    box.appendChild(renderer.domElement);

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(45, 1, 0.5, 600);
    camera.position.set(30, 36, 40);

    let sky = new THREE.HemisphereLight(0xfff4e0, 0x7a6a55, 1.2);
    let sun = new THREE.DirectionalLight(0xfff1d6, 2.2);
    sun.position.set(40, 60, 25);     // moved with the hour by applyCitySky
    sun.castShadow = true;
    sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
    sun.shadow.camera.left = -48;
    sun.shadow.camera.right = 48;
    sun.shadow.camera.top = 48;
    sun.shadow.camera.bottom = -48;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 160;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.03;
    scene.add(sky, sun);

    cityState.materials = {
        body: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82 }),
        glow: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.35, emissive: 0xffc76b, emissiveIntensity: 0 }),
        net: new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }),
        metal: new THREE.MeshStandardMaterial({ vertexColors: true, metalness: 0.3, roughness: 0.3 }),
        signs: [],
    };

    let ring = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.75, 32), new THREE.MeshBasicMaterial({ color: 0xffd60a, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = CITY_KERB + 0.04;
    ring.visible = false;
    scene.add(ring);

    // like a map: one finger or the mouse moves the town about, two fingers or
    // the right button turn it, a pinch or the wheel zooms; arrow keys move it
    // once the picture has focus
    let controls = new cityState.three.MapControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 10;
    controls.maxDistance = 170;
    controls.maxPolarAngle = Math.PI / 2.3;
    controls.autoRotate = !cityStill();
    controls.autoRotateSpeed = 0.5;
    // the town turns by itself only until the child takes hold of it
    controls.addEventListener('start', function () {
        controls.autoRotate = false;
        cityState.touched = true;
        $('#cityRecenterBtn').show();
    });
    // never so far that the town slides out of sight
    controls.addEventListener('change', function () {
        let target = controls.target;
        let x = Math.max(-CITY_PAN_LIMIT, Math.min(CITY_PAN_LIMIT, target.x));
        let z = Math.max(-CITY_PAN_LIMIT, Math.min(CITY_PAN_LIMIT, target.z));
        if (x !== target.x || z !== target.z) {
            camera.position.x += x - target.x;
            camera.position.z += z - target.z;
            target.set(x, target.y, z);
        }
    });
    renderer.domElement.tabIndex = 0;
    controls.listenToKeyEvents(renderer.domElement);
    $('#cityHint').text(coarse
        ? 'ลากนิ้วเดียวเพื่อเลื่อนดูเมือง · สองนิ้วเพื่อหมุนและซูม · แตะแลนด์มาร์กเพื่อดูความคืบหน้า'
        : 'ลากเพื่อเลื่อนดูเมือง · คลิกขวาค้างแล้วลากเพื่อหมุน · ลูกกลิ้งเพื่อซูม · คลิกแลนด์มาร์กเพื่อดูความคืบหน้า');

    Object.assign(cityState, { renderer: renderer, scene: scene, camera: camera, controls: controls, selectedRing: ring, lights: { sky: sky, sun: sun } });
    buildCityNight(scene);
    buildCityWorld();
    applyCitySky();
    sizeCity();
    new ResizeObserver(sizeCity).observe(box);
    bindCityTaps(renderer.domElement);
    return true;
}

// The sky at an hour, blended from the two nearest in CITY_DAY.
function cityDayAt(hour) {
    let THREE = cityState.three.THREE;
    let i = 1;
    while (i < CITY_DAY.length - 1 && CITY_DAY[i].hour <= hour) {
        i++;
    }
    let a = CITY_DAY[i - 1], b = CITY_DAY[i];
    let t = (hour - a.hour) / (b.hour - a.hour);
    let mix = function (key) { return new THREE.Color(a[key]).lerp(new THREE.Color(b[key]), t); };
    let blend = function (key) { return a[key] + (b[key] - a[key]) * t; };

    return {
        sky: mix('sky'), hemiColour: mix('hemiColour'), sunColour: mix('sunColour'), cloud: mix('cloud'),
        hemi: blend('hemi'), sun: blend('sun'), glow: blend('glow'),
    };
}

// The town at the hour it shows: the sky's colour, the sun (or the moon) across
// the sky from east to west, windows, signs and lamps lit as it grows dark, and
// stars and the moon out at night. Rerun every second or so by the draw loop.
function applyCitySky() {
    if (!cityState.scene) {
        return;
    }
    let hour = cityHour();
    let look = cityDayAt(hour);
    let night = Math.min(1, look.glow / 1.1);

    cityState.scene.background = look.sky;
    if (cityState.scene.fog) {
        cityState.scene.fog.color.copy(look.sky);
    } else {
        cityState.scene.fog = new cityState.three.THREE.Fog(look.sky, 150, 320);
    }
    cityState.lights.sky.intensity = look.hemi;
    cityState.lights.sky.color.copy(look.hemiColour);
    cityState.lights.sun.intensity = look.sun;
    cityState.lights.sun.color.copy(look.sunColour);

    // the sun crosses from 6:00 to 18:30, the moon through the night
    let up = hour >= 6 && hour < 18.5;
    let across = up ? (hour - 6) / 12.5 : ((hour - 18.5 + 24) % 24) / 11.5;
    cityState.lights.sun.position.set(Math.cos(Math.PI * across) * 60, 18 + Math.sin(Math.PI * across) * 50, 25);

    cityState.materials.glow.emissiveIntensity = look.glow;
    cityState.materials.signs.forEach(function (material) {
        material.emissiveIntensity = 0.05 + look.glow * 0.73;
    });
    if (cityState.sky) {
        // they glow a little in their own colour, so a dim sky does not turn them brown
        cityState.sky.cloudMesh.material.color.copy(look.cloud);
        cityState.sky.cloudMesh.material.emissive.copy(look.cloud);
    }
    if (cityState.night) {
        cityState.night.stars.material.opacity = night;
        cityState.night.moon.material.opacity = night;
        cityState.night.stars.visible = cityState.night.moon.visible = night > 0.02;
    }
    cityState.skyAt = performance.now();
    cityState.hourShown = hour;

    let mode = cityTimeMode();
    let label = CITY_TIME_LABELS[mode];
    if (mode === 'auto') {
        let minutes = Math.floor(hour * 60);
        label += ' ' + Math.floor(minutes / 60) + ':' + String(minutes % 60).padStart(2, '0');
    }
    $('#cityTimeIcon').attr('class', 'bi ' + CITY_TIME_ICONS[mode]);
    $('#cityTimeText').text(label);
    $('#cityTimeBtn').attr('aria-label', 'เวลาในเมือง: ' + label + ' แตะเพื่อเปลี่ยน');
}

// Stars all round the floating town, and a moon kept on the far side of it from
// the camera, low enough that a camera looking down still sees it.
function buildCityNight(scene) {
    let THREE = cityState.three.THREE;
    let count = 500;
    let points = new Float32Array(count * 3);
    let spot = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
        // spread evenly over a sphere: a golden-angle spiral
        let y = 1 - (i + 0.5) * 2 / count;
        let r = Math.sqrt(1 - y * y);
        let a = i * 2.39996;
        spot.set(Math.cos(a) * r, y, Math.sin(a) * r).multiplyScalar(300);
        points.set([spot.x, spot.y, spot.z], i * 3);
    }
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
    let stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 1.8, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
    let moon = new THREE.Mesh(new THREE.SphereGeometry(6, 20, 14), new THREE.MeshBasicMaterial({ color: 0xfff6d5, transparent: true, opacity: 0, fog: false }));

    scene.add(stars, moon);
    cityState.night = { stars: stars, moon: moon };
}

function placeCityMoon() {
    let target = cityState.controls.target, camera = cityState.camera.position;
    let far = Math.atan2(target.x - camera.x, target.z - camera.z) + 0.35;
    cityState.night.moon.position.set(target.x + Math.sin(far) * 150, -15, target.z + Math.cos(far) * 150);
}

// Back to the view the page opened with, turning slowly again.
function resetCityView() {
    if (!cityState.controls) {
        return;
    }
    cityState.touched = false;
    cityState.controls.target.set(0, 0, 0);
    cityState.camera.position.set(30, 36, 40);
    cityState.controls.autoRotate = !cityStill();
    sizeCity();
    cityState.controls.update();
    $('#cityRecenterBtn').hide();
}

function sizeCity() {
    let box = document.getElementById('cityStage');
    let width = box.clientWidth, height = box.clientHeight;

    if (!cityState.renderer || !width || !height) {
        return;
    }
    cityState.renderer.setSize(width, height);
    cityState.camera.aspect = width / height;
    cityState.camera.updateProjectionMatrix();

    // a phone held upright sees less across, so the camera stands further back
    if (!cityState.touched) {
        let across = Math.atan(Math.tan(cityState.camera.fov * Math.PI / 360) * cityState.camera.aspect);
        cityState.camera.position.setLength(Math.max(78, CITY_FIT_RADIUS / Math.sin(across)));
    }
}

function bindCityTaps(canvas) {
    let down = null;

    canvas.addEventListener('pointerdown', function (e) { down = { x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('pointerup', function (e) {
        if (!down || Math.abs(e.clientX - down.x) > CITY_TAP_SLOP || Math.abs(e.clientY - down.y) > CITY_TAP_SLOP) {
            return;
        }
        let rect = canvas.getBoundingClientRect();
        pickCityBuilding((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    });
}

// x and y in normalised device coordinates, -1 to 1. The nearest thing under
// the finger wins: a landmark, or the street or temple in front of one.
function pickCityBuilding(x, y) {
    let THREE = cityState.three.THREE;
    let raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(new THREE.Vector2(x, y), cityState.camera);
    let hit = raycaster.intersectObjects(cityState.pickables.concat(cityState.occluders), false)[0];

    if (!hit || !hit.object.userData.district) {
        cityState.selectedRing.visible = false;
        $('#citySelected').hide();
        return null;
    }
    showCitySelection(hit.object);
    return hit.object.userData.district;
}

function showCitySelection(proxy) {
    let place = proxy.userData.district;
    let meta = `${CITY_DISTRICT_NAMES[place.group]} · เก่งแล้ว ${place.strong} จาก ${place.total} บท · ระดับ ${place.tier}/5`;

    cityState.selectedRing.position.set(proxy.position.x, CITY_KERB + 0.06, proxy.position.z);
    cityState.selectedRing.scale.setScalar(4.3);
    cityState.selectedRing.visible = true;
    $('#citySelectedName').text(place.landmark + ' · ' + place.city);
    $('#citySelectedMeta').text(place.next ? meta + ' · บทต่อไป: ' + place.next.name : meta + ' · ครบทุกบทแล้ว');
    $('#citySelectedBtn').attr('data-menu-id', place.next ? place.next.menuId : '').toggle(!!place.next);
    $('#citySelected').show();
}

// A burst of sparks over the square, falling and fading.
function launchCityFirework(now) {
    let THREE = cityState.three.THREE;
    let count = 70;
    let positions = new Float32Array(count * 3);
    let speeds = [];
    let colour = new THREE.Color().setHSL(Math.random(), 0.9, 0.6);
    let origin = new THREE.Vector3((Math.random() - 0.5) * 24, 26 + Math.random() * 8, (Math.random() - 0.5) * 24);

    for (let i = 0; i < count; i++) {
        let direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        speeds.push(direction.multiplyScalar(7 + Math.random() * 3));
        positions.set([origin.x, origin.y, origin.z], i * 3);
    }

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    let points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: colour, size: 0.55, transparent: true, fog: false }));
    cityState.scene.add(points);
    cityState.fireworks.push({ points: points, speeds: speeds, born: now });
}

const CITY_FIREWORK_LIFE = 1800;
const CITY_FIREWORK_GAP = 1400;

function stepCityFireworks(now, seconds) {
    if (cityState.fireworksOn && now >= cityState.nextBurstAt) {
        launchCityFirework(now);
        // calmer for someone who has asked for less motion
        cityState.nextBurstAt = now + CITY_FIREWORK_GAP * (cityStill() ? 2.5 : 1);
    }

    cityState.fireworks = cityState.fireworks.filter(function (burst) {
        let age = now - burst.born;
        if (age > CITY_FIREWORK_LIFE) {
            cityState.scene.remove(burst.points);
            burst.points.geometry.dispose();
            burst.points.material.dispose();
            return false;
        }

        let position = burst.points.geometry.attributes.position;
        burst.speeds.forEach(function (speed, i) {
            speed.y -= 9 * seconds;
            position.setXYZ(i, position.getX(i) + speed.x * seconds, position.getY(i) + speed.y * seconds, position.getZ(i) + speed.z * seconds);
        });
        position.needsUpdate = true;
        burst.points.material.opacity = 1 - age / CITY_FIREWORK_LIFE;
        return true;
    });
}

// Drawn only while the page is open and the browser tab is showing, so an iPad
// left on another page is not kept busy.
function runCity() {
    if (cityState.running || !cityState.renderer) {
        return;
    }
    cityState.running = true;

    let last = performance.now();
    let frame = function (now) {
        if (!cityState.running) {
            return;
        }
        // a frame's time can be from just before the loop began, so never below zero
        let seconds = Math.max(0, Math.min(0.05, (now - last) / 1000));
        last = now;

        if (!cityStill()) {
            cityState.clock += seconds;
            placeCityLife(cityState.clock);
        }
        cityState.controls.update();
        placeCityMoon();
        if (now - cityState.skyAt > 1000) {
            applyCitySky();
        }
        stepCityFireworks(now, seconds);
        cityState.renderer.render(cityState.scene, cityState.camera);
        cityState.drawCalls = cityState.renderer.info.render.calls;
        cityState.frames++;
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}

function stopCity() {
    cityState.running = false;
}

function cityIsShowing() {
    return $('#content_city').hasClass('active') && !document.hidden;
}

function citySummary(data, counts) {
    let parts = ['เก่งแล้ว ' + counts.strong + ' จาก ' + counts.lessons + ' บท', 'แลนด์มาร์กเสร็จ ' + counts.finished + ' จาก ' + counts.landmarks + ' แห่ง'];

    if (data.trophies) {
        parts.push('ถ้วย ' + counts.trophies + ' ใบ');
    }
    parts.push('ฝึกต่อเนื่อง ' + data.streak + ' วัน');
    if (counts.cars) {
        parts.push('รถ ' + counts.cars + ' คัน' + (counts.robots ? ' หุ่นยนต์ ' + counts.robots + ' ตัว' : ''));
    }
    if (data.goalMet) {
        parts.push('ถึงเป้าวันนี้แล้ว');
    }
    return parts.join(' · ');
}

function readCityData() {
    return Promise.all([fetchLessonStats('all'), fetchFinalQuizResults(), fetchMockExamResults(), syncDailyActivity()])
        .then(function (results) {
            progressAllStats = results[0];
            let lessons = {};
            CITY_GROUPS.forEach(function (group) { lessons[group] = progressGroupLessons(group); });

            return {
                lessons: lessons,
                // a count from only one of the two would be short, so neither is used
                trophies: results[1] && results[2] ? progressTrophyTally(results[1], results[2]) : null,
                streak: getDayStreak(),
                goalMet: getDailyCount() >= getDailyGoal(),
            };
        });
}

function openCity() {
    let owner = currentUserId;

    if (!owner) {
        return;
    }
    cityState.owner = owner;
    showCityStatus('loading');

    Promise.all([loadCityThree(), readCityData()]).then(function (results) {
        // a slow answer for one child must not build the next one's town
        if (cityState.owner !== owner || currentUserId !== owner) {
            return;
        }
        if (!cityState.renderer && !setupCityScene()) {
            showCityStatus('nowebgl');
            return;
        }

        let data = results[1];
        let started = performance.now();
        buildCityTown(data);
        cityState.buildMs = Math.round(performance.now() - started);
        let summary = citySummary(data, cityState.counts);
        $('#citySummary').text(summary);
        cityState.renderer.domElement.setAttribute('aria-label', 'เมืองของฉัน: ' + summary);
        showCityStatus('ready');
        sizeCity();
        if (cityIsShowing()) {
            runCity();
        }
    }).catch(function () {
        if (cityState.owner === owner) {
            showCityStatus('failed');
        }
    });
}

$(document).on('shown.bs.tab', '#menu_city', openCity);
$(document).on('hide.bs.tab', '#menu_city', stopCity);

document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        stopCity();
    } else if (cityIsShowing() && cityState.town) {
        runCity();
    }
});

$('#cityRetryBtn').on('click', openCity);
$('#cityRecenterBtn').on('click', resetCityView);

// auto, then day, then night, then auto again
$('#cityTimeBtn').on('click', function () {
    let next = CITY_TIME_MODES[(CITY_TIME_MODES.indexOf(cityTimeMode()) + 1) % CITY_TIME_MODES.length];
    try {
        localStorage.setItem(CITY_TIME_KEY, next);
    } catch (e) {
        // no storage: the choice lasts until the page is closed
        cityState.timeFallback = next;
    }
    applyCitySky();
});

$('#citySelectedBtn').on('click', function () {
    let menu = document.getElementById($(this).attr('data-menu-id'));
    if (menu) {
        bootstrap.Tab.getOrCreateInstance(menu).show();
    }
});

// a different child's town is not left on screen for the next to find
supabaseClient.auth.onAuthStateChange(function (event, session) {
    let user = session ? session.user.id : null;
    if (user !== cityState.owner) {
        cityState.owner = null;
        stopCity();
        disposeCityTown();
        $('#citySummary').text('');
        $('#citySelected').hide();
    }
});
