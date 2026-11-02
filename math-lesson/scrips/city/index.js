// "เมืองของฉัน": a little Bangkok that grows with the child's learning. Every
// lesson is a shophouse on one of seven blocks, built up as its stage rises; the
// trophies stand in the temple square, each day of the streak plants a tree in
// the park, and a day's goal met sets off fireworks. Tuk-tuks and pink taxis go
// round, the skytrain runs overhead and Nang Kwak beckons from a shop roof.
// The pieces are in parts.js.
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
const CITY_PAVEMENT = 0.6;         // between a shop front and the kerb
const CITY_LOT_DEPTH = 3;
const CITY_SKYTRAIN_ROAD = -11;
const CITY_MAX_TREES = 30;
const CITY_TAP_SLOP = 6;           // pixels a finger can move and still be a tap
const CITY_FIT_RADIUS = 36;        // how much of the town has to fit across the stage
const CITY_SHOP_ID = 'corner-shop';

var cityState = {
    three: null,          // { THREE, OrbitControls, merge } once loaded
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
    touched: false,       // once the child has zoomed, a resize keeps their view
};

function cityColour(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888888';
}

function cityIsDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function cityStill() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function loadCityThree() {
    if (!cityState.loading) {
        cityState.loading = Promise.all([
            import('three'),
            import('three/addons/controls/OrbitControls.js'),
            import('three/addons/utils/BufferGeometryUtils.js'),
        ]).then(function (modules) {
            cityState.three = { THREE: modules[0], OrbitControls: modules[1].OrbitControls, merge: modules[2].mergeGeometries };
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
    canvas.width = 256;
    canvas.height = 96;
    let context = canvas.getContext('2d');

    context.fillStyle = 'rgba(255, 255, 255, 0.92)';
    context.beginPath();
    context.roundRect(4, 4, 248, 88, 28);
    context.fill();
    context.fillStyle = colour;
    context.font = 'bold 52px ' + getComputedStyle(document.body).fontFamily;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 50);

    let texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    let sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false }));
    sprite.scale.set(7.6, 2.85, 1);
    return sprite;
}

// The twenty plots round a block, clockwise from its north-west corner: a
// square plot on each corner and four narrow ones along each side, all facing
// the street.
function cityLots() {
    let edge = CITY_BLOCK / 2 - CITY_PAVEMENT;
    let middle = edge - CITY_LOT_DEPTH / 2;
    let run = (2 * edge - 2 * CITY_LOT_DEPTH) / 4;
    let first = -edge + CITY_LOT_DEPTH + run / 2;
    let lots = [];
    let side = function (cornerX, cornerZ, turn, place) {
        lots.push({ x: cornerX, z: cornerZ, turn: turn, w: CITY_LOT_DEPTH });
        for (let i = 0; i < 4; i++) {
            let spot = place(first + i * run);
            lots.push({ x: spot[0], z: spot[1], turn: turn, w: run });
        }
    };

    side(-middle, -middle, Math.PI, function (along) { return [along, -middle]; });
    side(middle, -middle, Math.PI / 2, function (along) { return [middle, along]; });
    side(middle, middle, 0, function (along) { return [-along, middle]; });
    side(-middle, middle, -Math.PI / 2, function (along) { return [-middle, -along]; });
    return lots;
}

function cityShopFloors(id) {
    return 3 + cityHash(id) % 2;
}

function cityLotHeight(lesson) {
    if (lesson.stage === 'new') {
        return 1.6;
    }
    if (lesson.stage === 'started') {
        return 2.9;
    }
    return lesson.stage === 'strong' ? cityTowerHeight(lesson.id) + 0.6 : 2 * CITY_FLOOR + 0.6;
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
    [[-6, 7.3], [-3.2, 7.3]].forEach(function (spot) {
        b.place(spot[0], 0, spot[1]);
        cityFoodCart(b);
    });

    // the corner shop Nang Kwak sits on
    let shop = { id: CITY_SHOP_ID, stage: 'strong', plainRoof: true, shophouse: true };
    let shopSigns = [];
    b.place(5, CITY_KERB, 5);
    cityShophouse(b, shop, 4, 4, '#c62828', 0, shopSigns);

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

    let mesh = cityBrushMesh(THREE, merge, b, cityState.materials);
    world.add(mesh);

    let sheet = citySignSheet(THREE, ['ร้านโชห่วย'], ['#c62828']);
    let signMaterial = new THREE.MeshStandardMaterial({ map: sheet, emissiveMap: sheet, emissive: 0xffffff, emissiveIntensity: 0 });
    world.add(citySignMesh(THREE, merge, shopSigns, signMaterial));
    cityState.shopSign = signMaterial;
    cityState.materials.signs = [signMaterial];

    // Nang Kwak on the shop roof, turned a little towards the street
    let nangKwak = cityNangKwak(THREE);
    nangKwak.position.set(5, CITY_KERB + cityShopFloors(CITY_SHOP_ID) * CITY_FLOOR + 0.25, 4.8);
    nangKwak.rotation.y = Math.PI / 7;
    nangKwak.scale.setScalar(0.85);
    world.add(nangKwak);

    // the traffic and the train
    let vehicles = [
        { build: function (v) { cityTukTuk(v, '#1f6fd1', '#ffd23f'); }, half: 11 - 1.4, speed: 3.2, reverse: false, offset: 0 },
        { build: cityTaxi, half: 11 + 1.4, speed: 3.8, reverse: true, offset: 0.4 },
        { build: cityTaxi, half: 33 - 1.4, speed: 4.5, reverse: false, offset: 0.15 },
        { build: function (v) { cityTukTuk(v, '#2e9d4e', '#ffd23f'); }, half: 33 + 1.4, speed: 3.4, reverse: true, offset: 0.65 },
        { build: function (v) { cityTukTuk(v, '#d81b60', '#ffffff'); }, half: 33 - 1.4, speed: 4.5, reverse: false, offset: 0.62 },
    ];
    cityState.vehicles = vehicles.map(function (spec) {
        let v = cityBrush(THREE, shapes);
        spec.build(v);
        let car = cityBrushMesh(THREE, merge, v, cityState.materials);
        let curve = cityLoop(THREE, spec.half, 2.2);
        world.add(car);
        return { mesh: car, curve: curve, length: curve.getLength(), speed: spec.speed, reverse: spec.reverse, offset: spec.offset };
    });

    let train = cityBrush(THREE, shapes);
    citySkytrain(train);
    let skytrain = cityBrushMesh(THREE, merge, train, cityState.materials);
    skytrain.position.set(0, 6.6, CITY_SKYTRAIN_ROAD);
    world.add(skytrain);

    Object.values(shapes).forEach(function (shape) { shape.dispose(); });

    cityState.world = world;
    cityState.occluders = [mesh];
    cityState.skytrain = skytrain;
    cityState.nangKwak = nangKwak;
    cityState.poles = poles;
    cityState.scene.add(world);
    placeCityLife(0);
}

// Where the cars, the train and Nang Kwak's arm are `time` seconds in.
function placeCityLife(time) {
    cityState.vehicles.forEach(function (car) {
        let u = (car.offset + time * car.speed / car.length) % 1;
        if (car.reverse) {
            u = 1 - u;
        }
        let at = car.curve.getPointAt(u);
        let ahead = car.curve.getTangentAt(u);
        if (car.reverse) {
            ahead.negate();
        }
        car.mesh.position.set(at.x, 0, at.z);
        car.mesh.lookAt(at.x + ahead.x, 0, at.z + ahead.z);
    });

    // the train glides end to end, slowing for each end of the line
    cityState.skytrain.position.x = 29 * Math.sin(time * 2 * Math.PI / 36);
    cityState.nangKwak.userData.arm.rotation.x = -0.35 + Math.sin(time * 3) * 0.35;
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
}

// Rebuilt on every open: what a child has done changes between visits.
function buildCityTown(data) {
    let THREE = cityState.three.THREE, merge = cityState.three.merge;
    let shapes = cityShapes(THREE);
    let b = cityBrush(THREE, shapes);
    let town = new THREE.Group();
    let counts = { buildings: 0, new: 0, started: 0, practising: 0, strong: 0, trophies: 0, trees: 0 };
    let lots = cityLots();
    let signs = [], names = [], signColours = [];
    let proxyShape = new THREE.BoxGeometry(1, 1, 1);
    let proxyMaterial = new THREE.MeshBasicMaterial();
    let pickables = [];
    let cup = new THREE.CylinderGeometry(0.32, 0.14, 0.5, 14);

    cityState.materials.signs = [cityState.shopSign];

    CITY_GROUPS.forEach(function (group, index) {
        let cx = CITY_SLOTS[index][0] * CITY_SPACING;
        let cz = CITY_SLOTS[index][1] * CITY_SPACING;
        let colour = cityColour(CITY_DISTRICT_COLOURS[group]);
        let lessons = data.lessons[group];
        let tallest = 0;

        lots.forEach(function (lot, position) {
            let x = cx + lot.x, z = cz + lot.z;
            let lesson = lessons[position];

            if (!lesson) {
                // a plot with no lesson yet is a patch of green
                b.place(x, CITY_KERB, z, lot.turn);
                b.box('#86c06a', 0, 0.03, 0, lot.w - 0.2, 0.06, CITY_LOT_DEPTH - 0.2);
                cityTree(b, 0, 0, 0.8, 0.05);
                return;
            }

            if (lesson.stage === 'strong') {
                names.push(lesson.name);
                signColours.push(colour);
            }
            b.place(x, CITY_KERB, z, lot.turn);
            cityShophouse(b, lesson, lot.w, CITY_LOT_DEPTH, colour, names.length - 1, signs);

            // an unseen box round the plot is what a tap finds
            let height = cityLotHeight(lesson);
            tallest = Math.max(tallest, height);
            let proxy = new THREE.Mesh(proxyShape, proxyMaterial);
            proxy.visible = false;
            proxy.scale.set(lot.w, height, CITY_LOT_DEPTH);
            proxy.position.set(x, CITY_KERB + height / 2, z);
            proxy.rotation.y = lot.turn;
            proxy.userData.lesson = Object.assign({ group: group }, lesson);
            proxy.userData.shared = true;
            town.add(proxy);
            pickables.push(proxy);
            counts.buildings++;
            counts[lesson.stage]++;
        });

        b.place(0, 0, 0);
        cityTree(b, cx, cz, 1.3, CITY_KERB);
        let sign = citySign(THREE, CITY_DISTRICT_NAMES[group], colour);
        sign.position.set(cx, Math.max(9.5, tallest + 2.5), cz - CITY_BLOCK / 2 + 1);
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

    // the park: a tree for each day in a row, up to what the park can hold
    let parkX = CITY_PARK_SLOT[0] * CITY_SPACING, parkZ = CITY_PARK_SLOT[1] * CITY_SPACING;
    b.place(0, 0, 0);
    for (let i = 0; i < Math.min(data.streak, CITY_MAX_TREES); i++) {
        let size = 0.9 + (i * 7 % 5) * 0.06;
        cityTree(b, parkX - 6 + (i % 6) * 2.4, parkZ - 6 + Math.floor(i / 6) * 2.2, size, CITY_KERB);
        counts.trees++;
    }
    let parkSign = citySign(THREE, 'สวน ' + data.streak + ' วัน', cityColour('--green'));
    parkSign.position.set(parkX, 9.5, parkZ - CITY_BLOCK / 2 + 1);
    parkSign.userData.ownMaterial = true;
    town.add(parkSign);

    town.add(cityBrushMesh(THREE, merge, b, cityState.materials));
    if (signs.length) {
        let sheet = citySignSheet(THREE, names, signColours);
        let signMaterial = new THREE.MeshStandardMaterial({ map: sheet, emissiveMap: sheet, emissive: 0xffffff, emissiveIntensity: 0 });
        let signMesh = citySignMesh(THREE, merge, signs, signMaterial);
        signMesh.userData.ownMaterial = true;
        town.add(signMesh);
        cityState.materials.signs.push(signMaterial);
    }
    Object.values(shapes).forEach(function (shape) { shape.dispose(); });
    cup.dispose();

    disposeCityTown();
    cityState.town = town;
    cityState.pickables = pickables;
    cityState.scene.add(town);
    cityState.counts = Object.assign(counts, { vehicles: cityState.vehicles.length, poles: cityState.poles });
    cityState.fireworksOn = data.goalMet;
    cityState.selectedRing.visible = false;
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
    sun.position.set(40, 60, 25);
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

    let controls = new cityState.three.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 10;
    controls.maxDistance = 170;
    controls.maxPolarAngle = Math.PI / 2.3;
    controls.autoRotate = !cityStill();
    controls.autoRotateSpeed = 0.5;
    // the town turns by itself only until the child takes hold of it
    controls.addEventListener('start', function () {
        controls.autoRotate = false;
        cityState.touched = true;
    });

    Object.assign(cityState, { renderer: renderer, scene: scene, camera: camera, controls: controls, selectedRing: ring, lights: { sky: sky, sun: sun } });
    buildCityWorld();
    applyCitySky();
    sizeCity();
    new ResizeObserver(sizeCity).observe(box);
    bindCityTaps(renderer.domElement);
    return true;
}

// Day under a clear sky, or night with the windows, signs and lamps lit.
function applyCitySky() {
    if (!cityState.scene) {
        return;
    }
    let THREE = cityState.three.THREE;
    let dark = cityIsDark();
    let sky = dark ? 0x0d1b2a : 0x8ecbef;

    cityState.scene.background = new THREE.Color(sky);
    cityState.scene.fog = new THREE.Fog(sky, 150, 320);
    cityState.lights.sky.intensity = dark ? 0.45 : 1.2;
    cityState.lights.sky.color.set(dark ? 0x8fa8d6 : 0xfff4e0);
    cityState.lights.sun.intensity = dark ? 0.35 : 2.2;
    cityState.materials.glow.emissiveIntensity = dark ? 1.1 : 0;
    cityState.materials.signs.forEach(function (material) {
        material.emissiveIntensity = dark ? 0.85 : 0.05;
    });
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
// the finger wins: a plot, or the street or temple in front of one.
function pickCityBuilding(x, y) {
    let THREE = cityState.three.THREE;
    let raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(new THREE.Vector2(x, y), cityState.camera);
    let hit = raycaster.intersectObjects(cityState.pickables.concat(cityState.occluders), false)[0];

    if (!hit || !hit.object.userData.lesson) {
        cityState.selectedRing.visible = false;
        $('#citySelected').hide();
        return null;
    }
    showCitySelection(hit.object);
    return hit.object.userData.lesson;
}

function showCitySelection(building) {
    let lesson = building.userData.lesson;

    cityState.selectedRing.position.set(building.position.x, CITY_KERB + 0.04, building.position.z);
    cityState.selectedRing.visible = true;
    $('#citySelectedName').text(lesson.name);
    $('#citySelectedMeta').text(CITY_DISTRICT_NAMES[lesson.group] + ' · ' + lessonStageText(lesson.stage, lesson.stats));
    $('#citySelectedBtn').attr('data-menu-id', lesson.menuId);
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
        let seconds = Math.min(0.05, (now - last) / 1000);
        last = now;

        if (!cityStill()) {
            cityState.clock += seconds;
            placeCityLife(cityState.clock);
        }
        cityState.controls.update();
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
    let parts = ['ตึก ' + counts.buildings + ' หลัง', 'เก่งแล้ว ' + counts.strong + ' บท'];

    if (data.trophies) {
        parts.push('ถ้วย ' + counts.trophies + ' ใบ');
    }
    parts.push('ฝึกต่อเนื่อง ' + data.streak + ' วัน');
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

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyCitySky);
}

$('#cityRetryBtn').on('click', openCity);

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
