// "เมืองของฉัน": a small 3D town that grows with the child's learning. Every
// lesson is a plot, built up as its stage rises; trophies stand in the square,
// each day of the streak plants a tree in the park, and a day's goal met sets
// off fireworks. Everything is drawn from three.js primitives, no models.
//
// three.js is the one large library here, so it is fetched only when the page is
// first opened (the import map in index.html names it). The reload guard in the
// head only watches files the page asks for itself, so a failed fetch here gets
// its own message and retry button.

const CITY_GROUPS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'extra'];
const CITY_DISTRICT_COLOURS = { p1: '--green', p2: '--orange', p3: '--purple', p4: '--pink', p5: '--cyan', p6: '--blue', extra: '--yellow' };
const CITY_DISTRICT_NAMES = { p1: 'ป.1', p2: 'ป.2', p3: 'ป.3', p4: 'ป.4', p5: 'ป.5', p6: 'ป.6', extra: 'เสริม' };

// districts sit on a 3 x 3 grid around the square; the last place is the park
const CITY_BLOCK = 18;
const CITY_TILE = 15;
const CITY_SLOTS = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1]];
const CITY_PARK_SLOT = [1, 1];
const CITY_LOT_COLUMNS = 5;
const CITY_LOT_SPACING = 2.7;
const CITY_MAX_TREES = 30;
const CITY_TAP_SLOP = 6;           // pixels a finger can move and still be a tap
const CITY_FIT_RADIUS = 28;        // how much of the town has to fit across the stage

var cityState = {
    three: null,          // { THREE, OrbitControls } once loaded
    loading: null,
    renderer: null,
    scene: null,
    camera: null,
    controls: null,
    town: null,           // the group rebuilt from each child's data
    selectedRing: null,
    fireworks: [],
    fireworksOn: false,
    nextBurstAt: 0,
    running: false,
    frames: 0,
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

function loadCityThree() {
    if (!cityState.loading) {
        cityState.loading = Promise.all([import('three'), import('three/addons/controls/OrbitControls.js')])
            .then(function (modules) {
                cityState.three = { THREE: modules[0], OrbitControls: modules[1].OrbitControls };
                return cityState.three;
            })
            .catch(function (error) {
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
    context.font = 'bold 52px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 50);

    let sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthWrite: false }));
    sprite.scale.set(7.6, 2.85, 1);
    return sprite;
}

// Lit windows for a tall building: one texture, shared by every tower.
function cityWindowTexture(THREE) {
    let canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 128;
    let context = canvas.getContext('2d');

    context.fillStyle = '#000';
    context.fillRect(0, 0, 64, 128);
    context.fillStyle = '#fff';
    for (let row = 0; row < 6; row++) {
        for (let column = 0; column < 3; column++) {
            context.fillRect(8 + column * 18, 10 + row * 19, 11, 11);
        }
    }
    return new THREE.CanvasTexture(canvas);
}

function cityKit(THREE) {
    return {
        slab: new THREE.BoxGeometry(2.2, 0.12, 2.2),
        post: new THREE.BoxGeometry(0.12, 1.3, 0.12),
        board: new THREE.BoxGeometry(0.9, 0.5, 0.08),
        footing: new THREE.BoxGeometry(1.7, 0.45, 1.7),
        pole: new THREE.CylinderGeometry(0.05, 0.05, 1.4, 6),
        house: new THREE.BoxGeometry(1.7, 1.3, 1.7),
        roof: new THREE.ConeGeometry(1.35, 0.9, 4),
        tower: new THREE.BoxGeometry(1.5, 1, 1.5),
        cap: new THREE.BoxGeometry(1.7, 0.2, 1.7),
        flag: new THREE.BoxGeometry(0.6, 0.35, 0.04),
        trunk: new THREE.CylinderGeometry(0.15, 0.2, 0.8, 6),
        crown: new THREE.ConeGeometry(0.75, 1.6, 7),
        plinth: new THREE.BoxGeometry(1.6, 0.6, 1.6),
        cup: new THREE.CylinderGeometry(0.65, 0.3, 0.9, 16),
        stem: new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8),
        foot: new THREE.CylinderGeometry(0.4, 0.45, 0.15, 16),
        windows: cityWindowTexture(THREE),
        pale: new THREE.MeshStandardMaterial({ color: 0xd9d4c7 }),
        wood: new THREE.MeshStandardMaterial({ color: 0xb98a55 }),
        concrete: new THREE.MeshStandardMaterial({ color: 0x9a9a9a }),
        white: new THREE.MeshStandardMaterial({ color: 0xffffff }),
        leaf: new THREE.MeshStandardMaterial({ color: 0x2f9e44 }),
        bark: new THREE.MeshStandardMaterial({ color: 0x7a4f2a }),
    };
}

// The four stages of a lesson, from an empty plot to a tower.
function cityBuilding(THREE, kit, lesson, colour) {
    let group = new THREE.Group();
    let paint = new THREE.MeshStandardMaterial({ color: colour });
    let add = function (geometry, material, x, y, z) {
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        group.add(mesh);
        return mesh;
    };

    add(kit.slab, kit.pale, 0, 0.06, 0);

    if (lesson.stage === 'new') {
        add(kit.post, kit.wood, 0.6, 0.65, 0.6);
        add(kit.board, paint, 0.6, 1.1, 0.64);
    } else if (lesson.stage === 'started') {
        add(kit.footing, kit.concrete, 0, 0.34, 0);
        [[-0.85, -0.85], [0.85, -0.85], [-0.85, 0.85], [0.85, 0.85]].forEach(function (corner) {
            add(kit.post, kit.wood, corner[0], 0.77, corner[1]);
        });
    } else if (lesson.stage === 'practising') {
        add(kit.house, paint, 0, 0.77, 0);
        let roof = add(kit.roof, kit.wood, 0, 1.87, 0);
        roof.rotation.y = Math.PI / 4;
    } else {
        // the height varies a little so a finished district is a skyline, not a wall
        let height = 2.6 + (lesson.id.length % 3) * 0.6;
        let body = add(kit.tower, new THREE.MeshStandardMaterial({ color: colour, emissive: 0xffe08a, emissiveMap: kit.windows, emissiveIntensity: 0.55 }), 0, 0.12 + height / 2, 0);
        body.scale.y = height;
        add(kit.cap, kit.white, 0, 0.22 + height, 0);
        add(kit.pole, kit.white, 0.5, 1.02 + height, 0.5);
        add(kit.flag, paint, 0.8, 1.55 + height, 0.5);
    }

    group.userData.lesson = lesson;
    return group;
}

function cityTrophy(THREE, kit, colour) {
    let group = new THREE.Group();
    let metal = new THREE.MeshStandardMaterial({ color: colour, metalness: 0.6, roughness: 0.3 });
    let parts = [[kit.plinth, kit.white, 0.3], [kit.foot, metal, 0.68], [kit.stem, metal, 0.98], [kit.cup, metal, 1.6]];

    parts.forEach(function (part) {
        let mesh = new THREE.Mesh(part[0], part[1]);
        mesh.position.y = part[2];
        group.add(mesh);
    });
    return group;
}

function cityTree(THREE, kit) {
    let group = new THREE.Group();
    let trunk = new THREE.Mesh(kit.trunk, kit.bark);
    let crown = new THREE.Mesh(kit.crown, kit.leaf);

    trunk.position.y = 0.4;
    crown.position.y = 1.5;
    group.add(trunk, crown);
    return group;
}

function cityTile(THREE, colour, x, z) {
    let tile = new THREE.Mesh(new THREE.BoxGeometry(CITY_TILE, 0.3, CITY_TILE), new THREE.MeshStandardMaterial({ color: colour }));
    tile.position.set(x, -0.15, z);
    return tile;
}

// Rebuilt from scratch on every open: what a child has done changes between
// visits, and a town of a few hundred boxes is quick to make.
function buildCityTown(data) {
    let THREE = cityState.three.THREE;
    let kit = cityKit(THREE);
    let town = new THREE.Group();
    let counts = { buildings: 0, new: 0, started: 0, practising: 0, strong: 0, trophies: 0, trees: 0 };

    CITY_GROUPS.forEach(function (group, index) {
        let x = CITY_SLOTS[index][0] * CITY_BLOCK;
        let z = CITY_SLOTS[index][1] * CITY_BLOCK;
        let colour = cityColour(CITY_DISTRICT_COLOURS[group]);
        let lessons = data.lessons[group];
        let rows = Math.ceil(lessons.length / CITY_LOT_COLUMNS);

        town.add(cityTile(THREE, cityIsDark() ? 0x2d4a33 : 0xb7dfa8, x, z));
        lessons.forEach(function (lesson, position) {
            let column = position % CITY_LOT_COLUMNS, row = Math.floor(position / CITY_LOT_COLUMNS);
            let building = cityBuilding(THREE, kit, Object.assign({ group: group }, lesson), colour);
            building.position.set(x + (column - (CITY_LOT_COLUMNS - 1) / 2) * CITY_LOT_SPACING, 0, z + (row - (rows - 1) / 2) * CITY_LOT_SPACING);
            town.add(building);
            counts.buildings++;
            counts[lesson.stage]++;
        });

        let sign = citySign(THREE, CITY_DISTRICT_NAMES[group], colour);
        sign.position.set(x, 7, z - CITY_TILE / 2 + 0.5);
        town.add(sign);
    });

    // the square: one monument for every trophy held, gold first
    town.add(cityTile(THREE, cityIsDark() ? 0x5b5346 : 0xe9dfc8, 0, 0));
    let cups = [];
    FINAL_QUIZ_TROPHIES.forEach(function (trophy) {
        for (let i = 0; i < (data.trophies ? data.trophies[trophy.id] : 0); i++) {
            cups.push(cityColour('--trophy-' + trophy.id));
        }
    });
    cups.forEach(function (colour, position) {
        let monument = cityTrophy(THREE, kit, colour);
        monument.position.set(((position % 4) - 1.5) * 3, 0, (Math.floor(position / 4) - 0.5) * 4);
        town.add(monument);
        counts.trophies++;
    });

    // the park: a tree for each day in a row, up to what the park can hold
    let parkX = CITY_PARK_SLOT[0] * CITY_BLOCK, parkZ = CITY_PARK_SLOT[1] * CITY_BLOCK;
    town.add(cityTile(THREE, cityIsDark() ? 0x1f5130 : 0x8fd18a, parkX, parkZ));
    for (let i = 0; i < Math.min(data.streak, CITY_MAX_TREES); i++) {
        let tree = cityTree(THREE, kit);
        tree.position.set(parkX + ((i % 6) - 2.5) * 2.3, 0, parkZ + (Math.floor(i / 6) - 2) * 2.6);
        town.add(tree);
        counts.trees++;
    }
    let parkSign = citySign(THREE, 'สวน ' + data.streak + ' วัน', cityColour('--green'));
    parkSign.position.set(parkX, 7, parkZ - CITY_TILE / 2 + 0.5);
    town.add(parkSign);

    if (cityState.town) {
        cityState.scene.remove(cityState.town);
    }
    cityState.town = town;
    cityState.scene.add(town);
    cityState.counts = counts;
    cityState.fireworksOn = data.goalMet;
    cityState.selectedRing.visible = false;
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.setAttribute('role', 'img');
    box.appendChild(renderer.domElement);

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(45, 1, 1, 500);
    camera.position.set(30, 36, 40);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x556655, 1.1));
    let sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(30, 60, 20);
    scene.add(sun);

    let ground = new THREE.Mesh(new THREE.BoxGeometry(3 * CITY_BLOCK + 6, 0.4, 3 * CITY_BLOCK + 6), new THREE.MeshStandardMaterial({ color: 0x6b6f76 }));
    ground.position.y = -0.5;
    scene.add(ground);

    let ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.85, 32), new THREE.MeshBasicMaterial({ color: 0xffd60a, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.15;
    ring.visible = false;
    scene.add(ring);

    let controls = new cityState.three.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 22;
    controls.maxDistance = 120;
    controls.maxPolarAngle = Math.PI / 2.25;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    // the town turns by itself only until the child takes hold of it
    controls.addEventListener('start', function () {
        controls.autoRotate = false;
        cityState.touched = true;
    });

    Object.assign(cityState, { renderer: renderer, scene: scene, camera: camera, controls: controls, selectedRing: ring });
    applyCitySky();
    sizeCity();
    new ResizeObserver(sizeCity).observe(box);
    bindCityTaps(renderer.domElement);
    return true;
}

function applyCitySky() {
    if (cityState.scene) {
        cityState.scene.background = new cityState.three.THREE.Color(cityIsDark() ? 0x0d1b2a : 0xbfe3ff);
    }
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
        cityState.camera.position.setLength(Math.max(64, CITY_FIT_RADIUS / Math.sin(across)));
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

// x and y in normalised device coordinates, -1 to 1
function pickCityBuilding(x, y) {
    let THREE = cityState.three.THREE;
    let raycaster = new THREE.Raycaster();

    raycaster.setFromCamera(new THREE.Vector2(x, y), cityState.camera);
    let hit = raycaster.intersectObjects(cityState.town.children, true).find(function (item) {
        for (let node = item.object; node; node = node.parent) {
            if (node.userData.lesson) {
                return true;
            }
        }
        return false;
    });

    if (!hit) {
        cityState.selectedRing.visible = false;
        $('#citySelected').hide();
        return null;
    }

    let building = hit.object;
    while (!building.userData.lesson) {
        building = building.parent;
    }
    showCitySelection(building);
    return building.userData.lesson;
}

function showCitySelection(building) {
    let lesson = building.userData.lesson;

    cityState.selectedRing.position.set(building.position.x, 0.15, building.position.z);
    cityState.selectedRing.visible = true;
    $('#citySelectedName').text(lesson.name);
    $('#citySelectedMeta').text(CITY_DISTRICT_NAMES[lesson.group] + ' · ' + lessonStageText(lesson.stage, lesson.stats));
    $('#citySelectedBtn').attr('data-menu-id', lesson.menuId);
    $('#citySelected').show();
}

// A burst of sparks over the square, falling and fading.
function launchCityFirework(now) {
    let THREE = cityState.three.THREE;
    let count = 60;
    let positions = new Float32Array(count * 3);
    let speeds = [];
    let colour = new THREE.Color().setHSL(Math.random(), 0.9, 0.6);
    let origin = new THREE.Vector3((Math.random() - 0.5) * 10, 16 + Math.random() * 6, (Math.random() - 0.5) * 10);

    for (let i = 0; i < count; i++) {
        let direction = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
        speeds.push(direction.multiplyScalar(6 + Math.random() * 3));
        positions.set([origin.x, origin.y, origin.z], i * 3);
    }

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    let points = new THREE.Points(geometry, new THREE.PointsMaterial({ color: colour, size: 0.45, transparent: true }));
    cityState.scene.add(points);
    cityState.fireworks.push({ points: points, speeds: speeds, born: now });
}

const CITY_FIREWORK_LIFE = 1800;
const CITY_FIREWORK_GAP = 1400;

function stepCityFireworks(now, seconds) {
    if (cityState.fireworksOn && now >= cityState.nextBurstAt) {
        launchCityFirework(now);
        cityState.nextBurstAt = now + CITY_FIREWORK_GAP;
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

        cityState.controls.update();
        stepCityFireworks(now, seconds);
        cityState.renderer.render(cityState.scene, cityState.camera);
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
        buildCityTown(data);
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
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        applyCitySky();
    });
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
        if (cityState.town) {
            cityState.scene.remove(cityState.town);
            cityState.town = null;
        }
        $('#citySummary').text('');
        $('#citySelected').hide();
    }
});
