// The pieces "เมืองของฉัน" is built from: a little Bangkok of shophouses, power
// poles hung with wires, tuk-tuks, pink taxis, a skytrain, a temple and a giant
// Nang Kwak on a shop roof. Everything is three.js primitives, coloured per
// vertex and merged, so the whole town draws in a handful of calls (see
// cityBrush). index.js lays the pieces out and brings them to life.
//
// Every builder works in its own frame, facing +z, and is placed with
// brush.place(); sizes are in the same units as the town plan in index.js.

const CITY_WALLS = ['#f1e4c8', '#cfe5d6', '#f3c9b8', '#f5e3a3', '#dfe3ea', '#ead3e4', '#cde3ec'];
const CITY_FLOOR = 1.3;            // one storey
const CITY_KERB = 0.25;            // a pavement's height above the road
const CITY_TOWER_FLOOR = 0.75;     // a high-rise storey, drawn thinner than a shop's
const CITY_TOWERS = ['#e8eef2', '#cfd8dc', '#b9cbd8', '#f2e6d0', '#d7e3e8', '#e9dcd3'];
const CITY_SIGN_COLUMNS = 4;
const CITY_SIGN_ROWS = 32;

// Shared shapes, scaled to size when placed.
function cityShapes(THREE) {
    let prism = new THREE.ExtrudeGeometry(new THREE.Shape([new THREE.Vector2(-0.5, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0, 1)]), { depth: 1, bevelEnabled: false });
    prism.translate(0, 0, -0.5);

    return {
        box: new THREE.BoxGeometry(1, 1, 1),
        cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 12),
        post: new THREE.CylinderGeometry(0.5, 0.5, 1, 6),
        cone: new THREE.ConeGeometry(0.5, 1, 12),
        spire: new THREE.ConeGeometry(0.5, 1, 6),
        ball: new THREE.SphereGeometry(0.5, 12, 8),
        bush: new THREE.IcosahedronGeometry(0.5, 1),
        prism: prism,           // a gable: 1 wide, 1 high, 1 long, base at y = 0
        plane: new THREE.PlaneGeometry(1, 1),
    };
}

function cityHash(text) {
    let hash = 7;
    for (let i = 0; i < text.length; i++) {
        hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }
    return hash;
}

// Collects coloured pieces by material, to be merged into one mesh. A piece is
// a shape, its colour, where it sits, its size and its turn, all in the frame
// set by place().
function cityBrush(THREE, shapes) {
    let lists = {};
    let frame = new THREE.Matrix4();
    let local = new THREE.Matrix4();
    let turn = new THREE.Quaternion();
    let euler = new THREE.Euler();
    let position = new THREE.Vector3();
    let size = new THREE.Vector3();
    let colour = new THREE.Color();

    let brush = {
        shapes: shapes,
        lists: lists,
        place: function (x, y, z, angle) {
            frame.makeRotationY(angle || 0).setPosition(x, y, z);
        },
        frame: function () {
            return frame.clone();
        },
        // colour may be [top and bottom, sides] for an extruded shape
        put: function (shape, hex, at, scale, rotation, kind) {
            let piece = shape.index ? shape.toNonIndexed() : shape.clone();
            let count = piece.attributes.position.count;
            let colours = new Float32Array(count * 3);

            euler.set(rotation ? rotation[0] : 0, rotation ? rotation[1] : 0, rotation ? rotation[2] : 0);
            turn.setFromEuler(euler);
            position.set(at[0], at[1], at[2]);
            size.set(scale ? scale[0] : 1, scale ? scale[1] : 1, scale ? scale[2] : 1);
            piece.applyMatrix4(local.compose(position, turn, size));
            piece.applyMatrix4(frame);

            let sides = Array.isArray(hex) && piece.groups.length > 1 ? piece.groups[1] : null;
            colour.set(Array.isArray(hex) ? hex[0] : hex);
            for (let i = 0; i < count; i++) {
                colours.set([colour.r, colour.g, colour.b], i * 3);
            }
            if (sides) {
                colour.set(hex[1]);
                for (let i = sides.start; i < sides.start + sides.count; i++) {
                    colours.set([colour.r, colour.g, colour.b], i * 3);
                }
            }
            piece.setAttribute('color', new THREE.BufferAttribute(colours, 3));
            piece.clearGroups();
            (lists[kind || 'body'] = lists[kind || 'body'] || []).push(piece);
        },
        box: function (hex, x, y, z, w, h, d, kind, rotation) {
            brush.put(shapes.box, hex, [x, y, z], [w, h, d], rotation, kind);
        },
    };
    return brush;
}

// One mesh from everything a brush holds, a material group per kind.
function cityBrushMesh(THREE, merge, brush, materials) {
    let parts = [], used = [];

    ['body', 'glow', 'net', 'metal'].forEach(function (kind) {
        let list = brush.lists[kind];
        if (list && list.length) {
            parts.push(merge(list, false));
            used.push(materials[kind]);
            list.forEach(function (piece) { piece.dispose(); });
        }
    });
    let geometry = merge(parts, true);
    parts.forEach(function (part) { part.dispose(); });

    let mesh = new THREE.Mesh(geometry, used);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

// A rounded rectangle, for the base and the pavements.
function cityRoundedShape(THREE, half, radius) {
    let shape = new THREE.Shape();
    shape.moveTo(-half + radius, -half);
    shape.lineTo(half - radius, -half);
    shape.quadraticCurveTo(half, -half, half, -half + radius);
    shape.lineTo(half, half - radius);
    shape.quadraticCurveTo(half, half, half - radius, half);
    shape.lineTo(-half + radius, half);
    shape.quadraticCurveTo(-half, half, -half, half - radius);
    shape.lineTo(-half, -half + radius);
    shape.quadraticCurveTo(-half, -half, -half + radius, -half);
    return shape;
}

// A flat rounded slab lying on y = 0, `depth` thick.
function citySlab(THREE, shape, depth) {
    let geometry = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false, curveSegments: 6 });
    geometry.rotateX(-Math.PI / 2);
    return geometry;
}

// ---------- shophouses ----------

// How tall a finished lesson's tower stands: 8 to 20 storeys over its shop.
function cityTowerFloors(id) {
    return 8 + cityHash(id) % 13;
}

function cityTowerHeight(id) {
    return CITY_FLOOR + cityTowerFloors(id) * CITY_TOWER_FLOOR;
}

// One lesson's plot, `w` wide and `d` deep, its front on the street at +z.
// signCell is where its name sits in the sign sheet, for a finished shop.
function cityShophouse(b, lesson, w, d, colour, signCell, signs) {
    let s = b.shapes;
    let hash = cityHash(lesson.id);
    let front = d / 2;

    if (lesson.stage === 'new') {
        // an empty lot behind a blue tin fence
        b.box('#b5653a', 0, 0.03, 0, w - 0.1, 0.06, d - 0.1);
        b.box('#4a86c8', 0, 0.45, front - 0.08, w - 0.1, 0.9, 0.05);
        b.box('#4a86c8', -w / 2 + 0.08, 0.45, 0, 0.05, 0.9, d - 0.1);
        b.box('#4a86c8', w / 2 - 0.08, 0.45, 0, 0.05, 0.9, d - 0.1);
        for (let i = 1; i < 4; i++) {
            b.box('#6aa0d6', -w / 2 + i * w / 4, 0.45, front - 0.05, 0.06, 0.9, 0.04);
        }
        b.box('#8a6a4a', 0.3, 0.75, front - 0.6, 0.06, 1.5, 0.06);
        b.box('#ffffff', 0.3, 1.35, front - 0.56, 0.8, 0.42, 0.04);
        b.box(colour, 0.3, 1.2, front - 0.53, 0.8, 0.1, 0.03);
        [[-0.5, -0.6], [0.4, 0.5], [-0.2, 0.9]].forEach(function (spot) {
            b.put(s.bush, '#5f9e3c', [spot[0] * w / 2, 0.12, spot[1]], [0.45, 0.3, 0.45]);
        });
        return;
    }

    if (lesson.stage === 'started') {
        // concrete frame going up, wrapped in green safety net, cones out front
        for (let level = 0; level < 3; level++) {
            b.box('#b9b5ad', 0, level * CITY_FLOOR + 0.06, 0, w - 0.1, 0.12, d - 0.1);
        }
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (corner) {
            let x = corner[0] * (w / 2 - 0.15), z = corner[1] * (d / 2 - 0.15);
            b.box('#a7a29a', x, CITY_FLOOR, z, 0.16, CITY_FLOOR * 2, 0.16);
            b.box('#7a4b32', x, CITY_FLOOR * 2 + 0.3, z, 0.04, 0.5, 0.04);
        });
        b.box('#2e9d4e', 0, CITY_FLOOR + 0.05, front - 0.02, w - 0.04, CITY_FLOOR * 2 - 0.1, 0.03, 'net');
        b.box('#2e9d4e', w / 2 - 0.02, CITY_FLOOR + 0.05, 0, 0.03, CITY_FLOOR * 2 - 0.1, d - 0.1, 'net');
        [-1, 1].forEach(function (side) {
            b.box('#c8a15a', side * (w / 2 - 0.1), 1.45, front + 0.15, 0.06, 2.9, 0.06);
        });
        [1, 2].forEach(function (level) {
            b.box('#c8a15a', 0, level * 1.0, front + 0.15, w - 0.1, 0.05, 0.05);
        });
        b.box('#c0603c', -0.3, 0.2, -0.4, 0.6, 0.28, 0.4);
        b.box('#c0603c', -0.2, 0.45, -0.4, 0.4, 0.22, 0.35);
        [-0.5, 0.5].forEach(function (x) {
            b.put(s.cone, '#ff7a1a', [x, 0.22, front + 0.42], [0.22, 0.44, 0.22]);
            b.put(s.cylinder, '#ffffff', [x, 0.25, front + 0.42], [0.15, 0.06, 0.15]);
        });
        if (hash % 2 === 0) {
            // a tower crane: what is going up here will be tall
            b.box('#f2b705', -w / 4, 5, -d / 4, 0.3, 10, 0.3);
            b.box('#f2b705', -w / 4 + 1.6, 10.1, -d / 4, 5.6, 0.25, 0.3);
            b.box('#8a8f94', -w / 4 - 1.2, 9.85, -d / 4, 0.8, 0.5, 0.5);
            b.box('#c0392b', -w / 4, 10.5, -d / 4, 0.4, 0.5, 0.4);
            b.box('#555555', -w / 4 + 3.6, 8.6, -d / 4, 0.03, 3, 0.03);
        }
        return;
    }

    // a finished lesson is a high-rise over its shop; the corner shop stays low
    let strong = lesson.stage === 'strong';
    if (strong && !lesson.shophouse) {
        cityTower(b, lesson, w, d, colour, signCell, signs);
        return;
    }

    // a shophouse: two storeys while practising, three or four for the corner shop
    let floors = strong ? 3 + hash % 2 : 2;
    let height = floors * CITY_FLOOR;
    let wall = CITY_WALLS[hash % CITY_WALLS.length];
    let trim = '#f7f3ea';

    b.box(wall, 0, height / 2, 0, w - 0.06, height, d - 0.1);
    for (let f = 1; f < floors; f++) {
        b.box(trim, 0, f * CITY_FLOOR, 0, w, 0.08, d - 0.04);
    }
    b.box(trim, 0, height + 0.12, 0, w, 0.25, d);

    // the shop front: shutters down, or open with the lights on inside
    if (strong) {
        b.box('#5c4a3a', 0, 0.55, front - 0.03, w * 0.78, 0.95, 0.04, 'glow');
        b.box('#b7bec4', 0, 1.1, front - 0.02, w * 0.8, 0.16, 0.05);
        b.box('#8b5a3c', 0, 0.3, front + 0.12, w * 0.6, 0.45, 0.3);
    } else {
        for (let i = 0; i < 4; i++) {
            b.box(i % 2 ? '#9aa3ab' : '#b7bec4', 0, 0.24 + i * 0.25, front - 0.03, w * 0.78, 0.25, 0.04);
        }
    }

    // a striped awning in the district's colour
    for (let i = 0; i < 4; i++) {
        b.box(i % 2 ? '#ffffff' : colour, -w / 2 + w / 8 + i * w / 4, 1.2, front + 0.3, w / 4, 0.05, 0.75, 'body', [0.35, 0, 0]);
    }

    // windows upstairs, lit at night
    for (let f = 1; f < floors; f++) {
        let y = f * CITY_FLOOR + 0.78;
        b.box('#ffffff', 0, y, front - 0.03, w * 0.6, 0.62, 0.05);
        b.box('#4f6f86', 0, y, front - 0.01, w * 0.5, 0.52, 0.05, 'glow');
        if (!strong) {
            for (let i = -1; i <= 1; i++) {
                b.box('#e8e1d0', 0, y + i * 0.15, front + 0.02, w * 0.5, 0.04, 0.03);
            }
        } else if ((hash + f) % 2 === 0) {
            // an air conditioner hung on the wall
            b.box('#f4f4f4', w / 2 - 0.32, f * CITY_FLOOR + 0.28, front + 0.12, 0.42, 0.3, 0.26);
            b.box('#7c8287', w / 2 - 0.32, f * CITY_FLOOR + 0.28, front + 0.26, 0.28, 0.2, 0.02);
        }
    }

    if (!strong) {
        b.box(colour, 0, 1.52, front + 0.01, w * 0.6, 0.3, 0.05);
        if (hash % 2) {
            let roof = b.shapes.prism;
            b.put(roof, '#9aa7ad', [0, height + 0.25, -0.3], [w * 0.7, 0.5, d * 0.5]);
        }
        return;
    }

    // a finished shop: its name on a sign, a balcony of plants, a tank on the roof
    b.box('#2b2b2b', 0, 1.55, front + 0.03, w * 0.94, 0.46, 0.06);
    signs.push({ cell: signCell, x: 0, y: 1.55, z: front + 0.065, w: w * 0.9, h: 0.42, frame: b.frame() });

    if (floors > 2) {
        let y = 2 * CITY_FLOOR;
        b.box(trim, 0, y + 0.04, front + 0.22, w * 0.9, 0.08, 0.45);
        b.box('#5b6770', 0, y + 0.25, front + 0.43, w * 0.9, 0.35, 0.03);
        [-0.3, 0.05, 0.35].forEach(function (x) {
            b.put(s.cylinder, '#c0603c', [x * w, y + 0.17, front + 0.25], [0.18, 0.18, 0.18]);
            b.put(s.bush, '#3f9b4a', [x * w, y + 0.36, front + 0.25], [0.32, 0.3, 0.32]);
        });
    }

    // the corner shop keeps its roof clear for Nang Kwak
    if (lesson.plainRoof) {
        return;
    }
    let top = height + 0.25;
    b.box('#8a8f94', -w / 4, top + 0.15, -d / 4, 0.6, 0.3, 0.6);
    b.put(s.cylinder, hash % 3 ? '#d9dde0' : '#3f7fbf', [-w / 4, top + 0.6, -d / 4], [0.6, 0.65, 0.6]);
    if (hash % 3 === 0) {
        // a little room on the roof under a red gable
        b.box(wall, w / 5, top + 0.4, d / 6, w * 0.45, 0.8, 1.0);
        b.put(s.prism, '#c8432b', [w / 5, top + 0.8, d / 6], [w * 0.55, 0.45, 1.1]);
    } else if (hash % 3 === 1) {
        [-0.2, 0.15].forEach(function (x) {
            b.box('#8b5a3c', x * w + w / 5, top + 0.12, d / 4, 0.4, 0.24, 0.3);
            b.put(s.bush, '#4caf50', [x * w + w / 5, top + 0.35, d / 4], [0.45, 0.35, 0.4]);
        });
    } else {
        b.box('#555555', w / 4, top + 0.6, 0, 0.04, 1.2, 0.04);
        b.box('#555555', w / 4, top + 1.0, 0, 0.6, 0.03, 0.03);
    }
}

// A condo or office tower on a shop: the ground floor keeps its awning and its
// sign with the lesson's name, glass bands climb above, and the top is one of
// a setback, a spire or a helipad.
function cityTower(b, lesson, w, d, colour, signCell, signs) {
    let s = b.shapes;
    let hash = cityHash(lesson.id);
    let front = d / 2;
    let floors = cityTowerFloors(lesson.id);
    let base = CITY_FLOOR;
    let bw = w - 0.3, bd = d - 0.3;
    let skin = CITY_TOWERS[hash % CITY_TOWERS.length];
    let top = base + floors * CITY_TOWER_FLOOR;
    let setback = hash % 3 === 0 ? Math.floor(floors * 0.7) : floors;

    // the shop at the foot
    b.box('#f7f3ea', 0, base / 2, 0, w - 0.06, base, d - 0.1);
    b.box('#5c4a3a', 0, 0.55, front - 0.03, w * 0.78, 0.95, 0.04, 'glow');
    for (let i = 0; i < 4; i++) {
        b.box(i % 2 ? '#ffffff' : colour, -w / 2 + w / 8 + i * w / 4, 1.2, front + 0.3, w / 4, 0.05, 0.75, 'body', [0.35, 0, 0]);
    }
    b.box('#2b2b2b', 0, 1.55, front + 0.03, w * 0.94, 0.46, 0.06);
    signs.push({ cell: signCell, x: 0, y: 1.55, z: front + 0.065, w: w * 0.9, h: 0.42, frame: b.frame() });

    // the tower, a band of windows for every storey, some of them dark at night
    for (let f = 0; f < floors; f++) {
        let narrow = f >= setback ? 0.7 : 1;
        let y = base + f * CITY_TOWER_FLOOR;
        b.box(skin, 0, y + CITY_TOWER_FLOOR / 2, 0, bw * narrow, CITY_TOWER_FLOOR, bd * narrow);
        b.box('#5d86a8', 0, y + 0.42, 0, bw * narrow + 0.04, 0.4, bd * narrow + 0.04, (hash + f) % 4 ? 'glow' : 'body');
    }
    b.box(colour, 0, base + 0.08, 0, bw + 0.1, 0.16, bd + 0.1);
    b.box(skin, 0, top + 0.12, 0, bw * (setback < floors ? 0.7 : 1) + 0.06, 0.25, bd * (setback < floors ? 0.7 : 1) + 0.06);

    if (hash % 3 === 1) {
        b.box('#d9dde0', 0, top + 0.6, 0, bw * 0.5, 0.8, bd * 0.5);
        b.put(s.spire, '#cfd6db', [0, top + 2.0, 0], [0.18, 2.2, 0.18]);
        b.box('#e53935', 0, top + 3.15, 0, 0.12, 0.12, 0.12, 'glow');
    } else if (hash % 3 === 2) {
        b.put(s.cylinder, '#6b7378', [0, top + 0.3, 0], [Math.min(bw, bd) * 0.9, 0.08, Math.min(bw, bd) * 0.9]);
        b.put(s.cylinder, '#f2b705', [0, top + 0.35, 0], [Math.min(bw, bd) * 0.6, 0.02, Math.min(bw, bd) * 0.6]);
    } else {
        b.put(s.cylinder, '#d9dde0', [bw * 0.15, top + 0.6, 0], [0.5, 0.6, 0.5]);
    }
}

// Lesson names, one cell each, on a sheet the finished shops' signs share.
function citySignSheet(THREE, names, colours) {
    let canvas = document.createElement('canvas');
    let cellW = 256, cellH = 64;
    canvas.width = cellW * CITY_SIGN_COLUMNS;
    canvas.height = cellH * CITY_SIGN_ROWS;
    let context = canvas.getContext('2d');
    let font = getComputedStyle(document.body).fontFamily;

    names.forEach(function (name, cell) {
        let x = (cell % CITY_SIGN_COLUMNS) * cellW, y = Math.floor(cell / CITY_SIGN_COLUMNS) * cellH;
        let size = 40;

        context.fillStyle = colours[cell];
        context.fillRect(x, y, cellW, cellH);
        context.strokeStyle = '#ffe9a8';
        context.lineWidth = 4;
        context.strokeRect(x + 4, y + 4, cellW - 8, cellH - 8);
        context.fillStyle = '#ffffff';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        do {
            context.font = 'bold ' + size + 'px ' + font;
            size -= 2;
        } while (context.measureText(name).width > cellW - 24 && size > 16);
        context.fillText(name, x + cellW / 2, y + cellH / 2 + 2, cellW - 20);
    });

    let texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
}

// The signs as one mesh, each a plane showing its cell of the sheet.
function citySignMesh(THREE, merge, signs, material) {
    if (!signs.length) {
        return null;
    }
    let pieces = signs.map(function (sign) {
        let plane = new THREE.PlaneGeometry(sign.w, sign.h);
        let uv = plane.attributes.uv;
        let column = sign.cell % CITY_SIGN_COLUMNS, row = Math.floor(sign.cell / CITY_SIGN_COLUMNS);

        for (let i = 0; i < uv.count; i++) {
            uv.setXY(i, (column + uv.getX(i)) / CITY_SIGN_COLUMNS, 1 - (row + 1 - uv.getY(i)) / CITY_SIGN_ROWS);
        }
        plane.translate(sign.x, sign.y, sign.z);
        plane.applyMatrix4(sign.frame);
        return plane;
    });
    let mesh = new THREE.Mesh(merge(pieces, false), material);
    pieces.forEach(function (piece) { piece.dispose(); });
    return mesh;
}

// ---------- the street ----------

function cityTree(b, x, z, size, y) {
    let s = b.shapes;
    let base = y || 0;
    b.put(s.post, '#7a4f2a', [x, base + 0.45 * size, z], [0.22 * size, 0.9 * size, 0.22 * size]);
    b.put(s.bush, '#3f9b4a', [x, base + 1.25 * size, z], [1.3 * size, 1.1 * size, 1.3 * size]);
    b.put(s.bush, '#58b65a', [x + 0.3 * size, base + 1.6 * size, z - 0.15 * size], [0.8 * size, 0.7 * size, 0.8 * size]);
}

// A concrete pole with a cross-arm and a street lamp leaning towards `lean`.
function cityPole(b, x, z, lean, transformer) {
    let s = b.shapes;
    let base = CITY_KERB;

    b.put(s.post, '#a19e97', [x, base + 2.6, z], [0.22, 5.2, 0.22]);
    b.box('#77746f', x, base + 4.6, z, 1.1, 0.09, 0.09, 'body', [0, lean + Math.PI / 4, 0]);
    if (transformer) {
        b.put(s.cylinder, '#7f8a92', [x + 0.25, base + 3.7, z], [0.42, 0.6, 0.42]);
    }
    let lx = x + Math.sin(lean) * 0.7, lz = z + Math.cos(lean) * 0.7;
    b.box('#77746f', (x + lx) / 2, base + 4.0, (z + lz) / 2, 0.06, 0.06, 0.75, 'body', [0, lean, 0]);
    b.box('#fff3c4', lx, base + 3.9, lz, 0.28, 0.1, 0.18, 'glow', [0, lean, 0]);
}

// Wires sagging from one pole top to another, a few at a time and never quite
// in line, the way they hang over a Bangkok soi.
function cityWires(THREE, b, from, to, count) {
    for (let i = 0; i < count; i++) {
        let lift = 4.2 + i * 0.16 + CITY_KERB;
        let shift = (i - count / 2) * 0.09;
        let start = new THREE.Vector3(from[0] + shift, lift, from[1] - shift);
        let end = new THREE.Vector3(to[0] - shift, lift + (i % 2) * 0.1, to[1] + shift);
        let sag = 0.45 + i * 0.18;
        let middle = start.clone().add(end).multiplyScalar(0.5);
        middle.y -= sag * 2;

        let tube = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(start, middle, end), 12, 0.035, 3, false);
        b.put(tube, '#1f1f22', [0, 0, 0]);
        tube.dispose();
    }
}

function cityCone(b, x, z) {
    b.put(b.shapes.cone, '#ff7a1a', [x, CITY_KERB + 0.22, z], [0.22, 0.44, 0.22]);
    b.put(b.shapes.cylinder, '#ffffff', [x, CITY_KERB + 0.25, z], [0.15, 0.06, 0.15]);
}

// A noodle cart under a striped umbrella.
function cityFoodCart(b) {
    let s = b.shapes;
    let base = CITY_KERB;

    b.box('#c9ced3', 0, base + 0.55, 0, 1.2, 0.5, 0.6);
    b.box('#9fd3e6', 0.2, base + 0.95, 0, 0.6, 0.3, 0.5, 'glow');
    b.box('#d8452b', -0.35, base + 0.92, 0, 0.35, 0.25, 0.35);
    [-0.45, 0.45].forEach(function (x) {
        b.put(s.cylinder, '#222222', [x, base + 0.2, 0.32], [0.36, 0.06, 0.36], [Math.PI / 2, 0, 0]);
    });
    b.put(s.post, '#7d7d7d', [-0.5, base + 1.3, 0], [0.05, 1.5, 0.05]);
    b.put(s.cone, '#e74c3c', [-0.5, base + 2.05, 0], [1.6, 0.4, 1.6]);
    b.put(s.cone, '#ffffff', [-0.5, base + 2.06, 0], [0.9, 0.42, 0.9]);
    b.box('#7a7f85', 0.9, base + 0.25, 0.2, 0.3, 0.35, 0.3);
}

// A spirit house on its post, garlands of marigolds and red drinks as offerings.
function citySpiritHouse(b) {
    let s = b.shapes;
    let base = CITY_KERB;

    b.box('#f3efe6', 0, base + 0.55, 0, 0.16, 1.1, 0.16);
    b.box('#d4af37', 0, base + 1.12, 0, 0.95, 0.08, 0.95);
    b.box('#f8f4ea', 0, base + 1.4, 0, 0.5, 0.48, 0.5);
    b.box('#c0392b', 0, base + 1.33, 0.26, 0.2, 0.3, 0.02);
    b.put(s.prism, '#d4af37', [0, base + 1.64, 0], [0.7, 0.45, 0.65]);
    b.put(s.spire, '#e6c14a', [0, base + 2.3, 0], [0.12, 0.6, 0.12]);
    for (let i = 0; i < 5; i++) {
        b.put(s.ball, '#ff9f1a', [-0.36 + i * 0.18, base + 1.2, 0.44], [0.12, 0.12, 0.12]);
    }
    [-0.3, -0.15].forEach(function (x) {
        b.put(s.cylinder, '#e53935', [x, base + 1.25, -0.32], [0.08, 0.18, 0.08]);
    });
}

// A temple hall: white walls, roofs stepping up in orange and green, gold finials.
function cityTemple(b) {
    let s = b.shapes;
    let base = CITY_KERB;

    b.box('#f6f2ea', 0, base + 0.25, 0, 7.2, 0.5, 9.4);
    b.box('#ece5d6', 0, base + 0.12, 5.1, 3, 0.24, 0.9);
    b.box('#fbf8f2', 0, base + 1.6, 0, 5.2, 2.2, 7.4);
    for (let i = -2; i <= 2; i++) {
        b.box('#fbf8f2', 2.75, base + 1.6, i * 1.7, 0.3, 2.2, 0.3);
        b.box('#fbf8f2', -2.75, base + 1.6, i * 1.7, 0.3, 2.2, 0.3);
    }
    b.box('#8b1e1e', 0, base + 1.4, 3.71, 1.2, 1.8, 0.04);
    b.box('#d4af37', 0, base + 1.4, 3.73, 1.3, 1.9, 0.02);
    b.box('#8b1e1e', 0, base + 1.4, 3.74, 1.1, 1.7, 0.02);

    let tiers = [
        { colour: '#2e7d4f', w: 7.2, h: 1.4, l: 9.2, y: 2.7 },
        { colour: '#e0662c', w: 5.8, h: 1.9, l: 8.2, y: 3.2 },
        { colour: '#e9772f', w: 4.2, h: 1.8, l: 7.0, y: 4.2 },
    ];
    tiers.forEach(function (tier) {
        b.put(s.prism, tier.colour, [0, base + tier.y, 0], [tier.w, tier.h, tier.l]);
    });
    let top = tiers[2];
    let peak = base + top.y + top.h;
    // the gable's gold face and the chofa curling up at each end of the ridge
    b.put(s.prism, '#d4af37', [0, base + top.y + 0.05, top.l / 2 + 0.02], [top.w - 0.4, top.h - 0.15, 0.04]);
    [-1, 1].forEach(function (end) {
        b.box('#e6c14a', 0, peak + 0.35, end * (top.l / 2 + 0.1), 0.14, 0.8, 0.14, 'body', [end * -0.45, 0, 0]);
    });
    for (let i = -2; i <= 2; i++) {
        b.put(s.spire, '#e6c14a', [0, peak + 0.15, i * 1.2], [0.12, 0.35, 0.12]);
    }
}

// Nang Kwak, the lucky lady who beckons customers in, sitting on a shop roof.
// Her raised arm is returned on its own so index.js can make it wave.
function cityNangKwak(THREE) {
    let group = new THREE.Group();
    let part = function (geometry, colour, x, y, z, sx, sy, sz, parent) {
        let mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: colour, roughness: 0.6 }));
        mesh.position.set(x, y, z);
        mesh.scale.set(sx, sy, sz);
        mesh.castShadow = true;
        (parent || group).add(mesh);
        return mesh;
    };
    let ball = new THREE.SphereGeometry(0.5, 20, 14);
    let cylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    let cone = new THREE.ConeGeometry(0.5, 1, 16);

    part(cylinder, '#b71c1c', 0, 0.15, 0, 2.3, 0.3, 2.3);
    part(ball, '#c62828', 0, 0.6, 0.1, 2.0, 1.0, 1.9);                 // kneeling, in a red sarong
    part(new THREE.CylinderGeometry(0.42, 0.62, 1.1, 16), '#f3d9a4', 0, 1.45, 0, 1, 1, 1);
    part(cylinder, '#d4af37', 0, 1.55, 0.02, 1.06, 0.18, 1.06).rotation.z = 0.5;
    part(ball, '#f6d2b0', 0, 2.35, 0, 1.05, 1.1, 1.0);                   // head
    part(ball, '#1d1d1d', 0, 2.55, -0.12, 0.95, 0.75, 0.85);              // hair
    part(cone, '#e6c14a', 0, 3.15, -0.05, 0.42, 0.95, 0.42);             // crown
    part(ball, '#1d1d1d', -0.17, 2.38, 0.47, 0.09, 0.11, 0.05);
    part(ball, '#1d1d1d', 0.17, 2.38, 0.47, 0.09, 0.11, 0.05);
    part(ball, '#f48fb1', -0.3, 2.22, 0.42, 0.14, 0.09, 0.05);
    part(ball, '#f48fb1', 0.3, 2.22, 0.42, 0.14, 0.09, 0.05);
    part(ball, '#c2185b', 0, 2.12, 0.5, 0.14, 0.05, 0.04);
    part(ball, '#f6d2b0', -0.35, 1.05, 0.62, 0.32, 0.22, 0.3);           // a hand resting in her lap

    // the beckoning arm turns about the shoulder
    let arm = new THREE.Group();
    arm.position.set(0.5, 1.8, 0.05);
    part(cylinder, '#f3d9a4', 0.12, 0.3, 0.05, 0.24, 0.65, 0.24, arm).rotation.z = -0.35;
    part(ball, '#f6d2b0', 0.25, 0.72, 0.12, 0.3, 0.34, 0.2, arm);
    group.add(arm);

    group.userData.arm = arm;
    group.userData.dispose = [ball, cylinder, cone];
    return group;
}

// ---------- vehicles ----------

function cityWheel(b, x, z, radius) {
    b.put(b.shapes.cylinder, '#1f1f1f', [x, radius, z], [radius * 2, 0.16, radius * 2], [0, 0, Math.PI / 2]);
}

function cityTukTuk(b, body, trim) {
    b.box(body, 0, 0.55, -0.15, 0.95, 0.45, 1.3);
    b.box(body, 0, 0.5, 0.75, 0.5, 0.35, 0.55);
    b.box('#2f2f2f', 0, 0.85, -0.25, 0.8, 0.25, 0.6);
    b.box(trim, 0, 1.3, -0.05, 1.05, 0.08, 1.55);
    b.box(trim, 0, 1.36, -0.05, 0.9, 0.06, 1.3);
    [[-0.45, -0.75], [0.45, -0.75], [-0.25, 0.55], [0.25, 0.55]].forEach(function (post) {
        b.box('#c9ced3', post[0], 1.0, post[1], 0.05, 0.6, 0.05);
    });
    b.box('#9fd3e6', 0, 1.0, 0.62, 0.48, 0.32, 0.04, 'glow');
    b.box('#fff3c4', 0, 0.55, 1.04, 0.16, 0.12, 0.04, 'glow');
    cityWheel(b, 0, 0.82, 0.2);
    cityWheel(b, -0.45, -0.45, 0.22);
    cityWheel(b, 0.45, -0.45, 0.22);
}

function cityTaxi(b) {
    b.box('#ff5fa2', 0, 0.48, 0, 1.05, 0.42, 2.2);
    b.box('#ff5fa2', 0, 0.86, -0.1, 0.95, 0.36, 1.2);
    b.box('#3a4a5a', 0, 0.88, -0.1, 0.97, 0.24, 1.0, 'glow');
    b.box('#f5f5f5', 0, 1.1, -0.1, 0.45, 0.14, 0.22);
    b.box('#fff3c4', -0.35, 0.5, 1.11, 0.2, 0.1, 0.02, 'glow');
    b.box('#fff3c4', 0.35, 0.5, 1.11, 0.2, 0.1, 0.02, 'glow');
    [[-0.5, 0.7], [0.5, 0.7], [-0.5, -0.7], [0.5, -0.7]].forEach(function (wheel) {
        cityWheel(b, wheel[0], wheel[1], 0.2);
    });
}

// Three skytrain cars, white with a green band; no line's livery.
function citySkytrain(b) {
    for (let car = -1; car <= 1; car++) {
        let x = car * 3.6;
        b.box('#f4f6f7', x, 0.65, 0, 3.4, 1.3, 1.35);
        b.box('#2e9d4e', x, 0.32, 0, 3.42, 0.22, 1.37);
        b.box('#3a4a5a', x, 0.85, 0, 3.0, 0.4, 1.37, 'glow');
        b.box('#cfd6db', x, 1.34, 0, 3.2, 0.08, 1.1);
    }
}

// The elevated line: a deck on twin pillars, and a station over the square.
function citySkytrainLine(b, z, from, to, pillars) {
    let deck = 6.2;
    b.box('#c9c5bd', (from + to) / 2, deck, z, to - from, 0.5, 2.4);
    b.box('#b2ada4', (from + to) / 2, deck + 0.3, z - 1.15, to - from, 0.25, 0.1);
    b.box('#b2ada4', (from + to) / 2, deck + 0.3, z + 1.15, to - from, 0.25, 0.1);
    pillars.forEach(function (x) {
        b.box('#bdb8af', x, deck / 2, z, 0.9, deck, 0.9);
        b.box('#bdb8af', x, deck - 0.35, z, 0.9, 0.5, 2.6);
    });
    b.box('#d9d4ca', 0, deck + 0.05, z, 9, 0.35, 4.6);
    b.box('#2e9d4e', 0, deck + 2.3, z, 9.4, 0.18, 5.0);
    [[-4.2, -2.1], [4.2, -2.1], [-4.2, 2.1], [4.2, 2.1]].forEach(function (post) {
        b.box('#9aa0a6', post[0], deck + 1.2, z + post[1], 0.15, 2.2, 0.15);
    });
}
