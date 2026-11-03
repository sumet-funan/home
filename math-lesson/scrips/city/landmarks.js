// The seven world landmarks of "เมืองของฉัน", one for each grade's district,
// and the cars and robot animals a streak of days puts on the roads.
//
// A landmark is built in tiers, 0 to 5 (see cityTier in index.js): a building
// site first, then the landmark rising part by part, its grounds filling in
// with paving, trees, lamps and fountains, and at 5, once every lesson in the
// grade is strong, its finishing touches. Each builder draws in the frame its
// block is placed in, y = 0 on the pavement, the front towards +z, and returns
// how tall it stands. These are simplified toy versions, not plans.

// A box from one point to another, for lattice and arches.
function cityBeam(b, hex, from, to, thick, kind) {
    let THREE = b.THREE;
    let start = new THREE.Vector3(from[0], from[1], from[2]);
    let end = new THREE.Vector3(to[0], to[1], to[2]);
    let length = start.distanceTo(end);
    let turn = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
    let euler = new THREE.Euler().setFromQuaternion(turn);
    let middle = start.add(end).multiplyScalar(0.5);

    b.put(b.shapes.box, hex, [middle.x, middle.y, middle.z], [thick, length, thick], [euler.x, euler.y, euler.z], kind);
}

// A tapering iron frame: four corner legs from `w0` across at y0 to `w1` at y1,
// a ring and a cross brace on every face for each row, rows alternating colour
// when `band` is given.
function cityLattice(b, colour, y0, y1, w0, w1, rows, thick, band) {
    let corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    let half = function (y) { return (w0 + (w1 - w0) * (y - y0) / (y1 - y0)) / 2; };

    for (let r = 0; r < rows; r++) {
        let ya = y0 + (y1 - y0) * r / rows, yb = y0 + (y1 - y0) * (r + 1) / rows;
        let ha = half(ya), hb = half(yb);
        let hex = band && r % 2 ? band : colour;

        corners.forEach(function (c, k) {
            let n = corners[(k + 1) % 4];
            cityBeam(b, hex, [c[0] * ha, ya, c[1] * ha], [c[0] * hb, yb, c[1] * hb], thick);
            cityBeam(b, hex, [c[0] * hb, yb, c[1] * hb], [n[0] * hb, yb, n[1] * hb], thick * 0.7);
            cityBeam(b, hex, [c[0] * ha, ya, c[1] * ha], [n[0] * hb, yb, n[1] * hb], thick * 0.45);
        });
    }
}

// String lights down a frame's legs, lit at night.
function cityLegLights(b, y0, y1, w0, w1, count, hex) {
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) {
        for (let i = 0; i <= count; i++) {
            let y = y0 + (y1 - y0) * i / count;
            let h = (w0 + (w1 - w0) * i / count) / 2 + 0.12;
            b.box(hex, c[0] * h, y, c[1] * h, 0.16, 0.16, 0.16, 'glow');
        }
    });
}

// ---------- trees and grounds ----------

function cityRoundTree(b, x, z) {
    cityTree(b, x, z, 1, 0);
}

function citySakura(b, x, z) {
    let s = b.shapes;
    b.put(s.post, '#6d4c3a', [x, 0.5, z], [0.22, 1, 0.22]);
    b.put(s.bush, '#f7a8c4', [x, 1.4, z], [1.6, 1.1, 1.6]);
    b.put(s.bush, '#fbc8da', [x + 0.35, 1.75, z - 0.2], [0.9, 0.7, 0.9]);
}

function cityPalm(b, x, z) {
    let s = b.shapes;
    cityBeam(b, '#9b7a4f', [x, 0, z], [x + 0.3, 2.6, z], 0.2);
    for (let i = 0; i < 6; i++) {
        let a = i * Math.PI / 3;
        cityBeam(b, '#3f9b4a', [x + 0.3, 2.6, z], [x + 0.3 + Math.cos(a) * 1.2, 2.2, z + Math.sin(a) * 1.2], 0.14);
    }
    b.put(s.ball, '#7a5a35', [x + 0.3, 2.55, z], [0.35, 0.35, 0.35]);
}

function cityTopiary(b, x, z) {
    let s = b.shapes;
    b.put(s.cylinder, '#c0603c', [x, 0.2, z], [0.6, 0.4, 0.6]);
    b.put(s.cone, '#2e7d4f', [x, 1.1, z], [0.9, 1.4, 0.9]);
}

function cityLamp(b, x, z) {
    b.put(b.shapes.post, '#3b4148', [x, 1.1, z], [0.1, 2.2, 0.1]);
    b.box('#fff3c4', x, 2.3, z, 0.3, 0.3, 0.3, 'glow');
}

function cityFountain(b, x, z) {
    let s = b.shapes;
    b.put(s.cylinder, '#e8e4da', [x, 0.2, z], [2.0, 0.4, 2.0]);
    b.put(s.cylinder, '#6cc6f0', [x, 0.42, z], [1.7, 0.06, 1.7], null, 'glow');
    b.put(s.post, '#e8e4da', [x, 0.8, z], [0.2, 0.8, 0.2]);
    b.put(s.cone, '#bfe8ff', [x, 1.35, z], [0.5, 0.5, 0.5], [Math.PI, 0, 0], 'glow');
}

// What grows round a landmark as its grade fills in. The landmark keeps within
// about 5 of the block's centre and the district's own buildings stand along
// the back (cityFillers), so these go in front and down the front of each side.
// A waterfront keeps its front edge clear for the water.
function cityGrounds(b, tier, paving, tree, waterfront) {
    if (tier >= 1) {
        b.box(paving, 0, 0.02, 0, 13.8, 0.04, 13.8);
    }
    if (tier >= 2 && !waterfront) {
        tree(b, -6.2, 6.2);
        tree(b, 6.2, 6.2);
    }
    if (tier >= 3) {
        cityLamp(b, -6.5, 2.6);
        cityLamp(b, 6.5, 2.6);
        tree(b, -6.3, 4.4);
        tree(b, 6.3, 4.4);
        if (!waterfront) {
            cityLamp(b, -2.2, 6.7);
            cityLamp(b, 2.2, 6.7);
        }
    }
    if (tier >= 4 && !waterfront) {
        cityFountain(b, -4.2, 6);
        cityFountain(b, 4.2, 6);
    }
}

// ---------- the city round each landmark ----------

// Where a district's own buildings stand, along the back and down the back of
// each side, filled in this order: two from the start, one more for each tier.
const CITY_FILLER_SLOTS = [[-6.1, -6.3], [6.1, -6.3], [-6.3, -3.4], [6.3, -3.4], [-3.3, -6.3], [3.3, -6.3], [-6.3, -0.9], [6.3, -0.9]];

// Builds them, each about 2 across, and says how tall the tallest is.
function cityFillers(b, tier, build, slots) {
    return (slots || CITY_FILLER_SLOTS).slice(0, 2 + tier).reduce(function (tallest, slot, i) {
        return Math.max(tallest, build(b, slot[0], slot[1], i));
    }, 0);
}

// A band of lit windows round a building for each storey.
function cityWindowBands(b, x, z, w, d, from, to, step, hex) {
    for (let y = from; y < to; y += step) {
        b.box(hex || '#5d86a8', x, y, z, w + 0.04, step * 0.4, d + 0.04, 'glow');
    }
}

// กรุงเทพฯ: open pavilions with tiered roofs, inside the palace walls.
const CITY_PALACE_SLOTS = [[-5.6, -5.4], [5.6, -5.4], [-3.4, -5.4], [3.4, -5.4], [-5.6, -3.2], [5.6, -3.2]];

function cityThaiPavilion(b, x, z, i) {
    let s = b.shapes;
    b.box('#f4f1ea', x, 0.2, z, 1.8, 0.4, 1.8);
    [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]].forEach(function (post) {
        b.box('#fbf8f2', x + post[0], 1, z + post[1], 0.14, 1.2, 0.14);
    });
    b.put(s.prism, i % 2 ? '#2e7d4f' : '#e0662c', [x, 1.6, z], [2.1, 0.8, 2.1]);
    b.put(s.prism, '#e9772f', [x, 2.1, z], [1.4, 0.7, 1.5]);
    b.put(s.spire, '#d4af37', [x, 3.1, z], [0.12, 0.6, 0.12], null, 'metal');
    return 3.4;
}

// โตเกียว: narrow shops and offices with a red noren and a neon sign.
function cityTokyoShop(b, x, z, i) {
    let h = [3.4, 5, 2.8, 4.2, 3.6, 5.6, 3, 4.4][i];
    let neon = ['#ff2d55', '#5ac8fa', '#ffcc00', '#af52de'][i % 4];
    b.box(['#e8e4dc', '#cfd8dc', '#f2e6d0', '#d7ccc8'][i % 4], x, h / 2, z, 2, h, 2);
    cityWindowBands(b, x, z, 2, 2, 1.6, h - 0.3, 0.9);
    b.box('#c62828', x, 1.0, z + 1.02, 1.5, 0.35, 0.04);
    b.box(neon, x + 0.75, h - 1.1, z + 1.15, 0.24, 1.4, 0.3, 'glow');
    b.box('#4b4f54', x, h + 0.1, z, 2.2, 0.2, 2.2);
    b.box('#d9dde0', x - 0.4, h + 0.4, z - 0.4, 0.6, 0.4, 0.6);
    return h + 0.6;
}

// ปารีส: cream stone with black balconies and a slate mansard roof.
function cityParisBuilding(b, x, z, i) {
    let h = [3.6, 4.2, 3.9, 4.4, 3.7, 4.0, 3.8, 4.3][i];
    b.box('#efe4cc', x, h / 2, z, 2, h, 2);
    cityWindowBands(b, x, z, 2, 2, 1.3, h - 0.2, 0.9, '#7d93a8');
    for (let y = 1.2; y < h - 0.3; y += 0.9) {
        b.box('#1d1d1d', x, y, z + 1.08, 1.8, 0.06, 0.18);
    }
    b.box('#5d6d7e', x, h + 0.4, z, 1.8, 0.8, 1.8);
    b.box('#5d6d7e', x, h + 0.85, z, 1.2, 0.1, 1.2);
    [-0.45, 0.45].forEach(function (dx) { b.box('#efe4cc', x + dx, h + 0.45, z + 0.92, 0.35, 0.45, 0.2); });
    b.box('#b5653a', x + 0.6, h + 1.0, z - 0.4, 0.25, 0.5, 0.25);
    return h + 1.25;
}

// ลอนดอน: brick terraces, white window frames, chimney pots.
function cityLondonTerrace(b, x, z, i) {
    let h = [3.2, 3.6, 3.0, 3.8, 3.4, 3.2, 3.6, 3.0][i];
    b.box(i % 2 ? '#9c4a32' : '#b5653a', x, h / 2, z, 2, h, 2);
    for (let y = 1.1; y < h - 0.3; y += 1.0) {
        [-0.5, 0.5].forEach(function (dx) {
            b.box('#f7f3ea', x + dx, y, z + 1.01, 0.5, 0.65, 0.03);
            b.box('#5d86a8', x + dx, y, z + 1.03, 0.36, 0.5, 0.03, 'glow');
        });
    }
    b.box(['#1d3557', '#2e7d4f', '#8b1e1e'][i % 3], x, 0.55, z + 1.02, 0.5, 1.1, 0.04);
    b.put(b.shapes.prism, '#4b4f54', [x, h, z], [2.1, 0.8, 2.1]);
    b.box('#9c4a32', x + 0.6, h + 0.7, z, 0.3, 0.7, 0.5);
    return h + 1.05;
}

// นิวยอร์ก: brick and brownstone towers, wooden water tanks on the roofs.
function cityNewYorkTower(b, x, z, i) {
    let s = b.shapes;
    let h = [6, 9, 5, 11, 7, 8.5, 5.5, 10][i];
    b.box(['#a0522d', '#8d6e63', '#b0a089', '#c9b79c'][i % 4], x, h / 2, z, 2, h, 2);
    cityWindowBands(b, x, z, 2, 2, 1.2, h - 0.3, 0.8);
    b.box('#6d4c3a', x, h + 0.05, z, 2.1, 0.1, 2.1);
    [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(function (leg) {
        b.box('#3b4148', x + leg[0], h + 0.35, z + leg[1], 0.06, 0.6, 0.06);
    });
    b.put(s.cylinder, '#8b6b4a', [x, h + 1, z], [0.9, 0.8, 0.9]);
    b.put(s.cone, '#5d4037', [x, h + 1.4, z], [1.0, 0.4, 1.0]);
    return h + 1.6;
}

// ดูไบ: sand-coloured blocks with domes, and glass towers.
function cityDubaiBuilding(b, x, z, i) {
    let s = b.shapes;
    let h = [3, 7, 4, 9, 3.5, 6, 3, 8][i];
    if (i % 2) {
        b.box('#8fb3c9', x, h / 2, z, 1.9, h, 1.9);
        cityWindowBands(b, x, z, 1.9, 1.9, 0.6, h, 0.7, '#cfe8ff');
        b.put(s.spire, '#dfe6ea', [x, h + 0.6, z], [0.2, 1.2, 0.2]);
        return h + 1.2;
    }
    b.box('#e6d2a8', x, h / 2, z, 2, h, 2);
    [-0.5, 0.5].forEach(function (dx) {
        b.box('#5c4a3a', x + dx, 1.0, z + 1.01, 0.5, 1.1, 0.03, 'glow');
        b.put(s.ball, '#5c4a3a', [x + dx, 1.55, z + 1.0], [0.5, 0.5, 0.06], null, 'glow');
    });
    b.put(s.ball, '#f3f0e8', [x, h, z], [1.3, 1.1, 1.3]);
    b.put(s.spire, '#d4af37', [x, h + 0.75, z], [0.1, 0.5, 0.1], null, 'metal');
    return h + 1;
}

// ซิดนีย์: bright low modern buildings with roof gardens.
function citySydneyBuilding(b, x, z, i) {
    let h = [2.6, 3.6, 4.2, 3, 3.8, 2.8, 4.4, 3.2][i];
    b.box(['#f6f4ee', '#e7d9c2', '#dfe6ea'][i % 3], x, h / 2, z, 2, h, 2);
    cityWindowBands(b, x, z, 2, 2, 0.8, h - 0.2, 0.8, '#7fa6c4');
    b.box('#ffffff', x, h + 0.05, z, 2.1, 0.1, 2.1);
    b.put(b.shapes.bush, '#4caf50', [x - 0.4, h + 0.3, z - 0.3], [0.8, 0.5, 0.8]);
    b.put(b.shapes.bush, '#66bb6a', [x + 0.4, h + 0.3, z + 0.3], [0.6, 0.45, 0.6]);
    return h + 0.6;
}

// Tier 0: a fenced site with a crane, waiting for the first lesson.
function cityBuildingSite(b) {
    let s = b.shapes;
    b.box('#b5653a', 0, 0.03, 0, 9, 0.06, 9);
    [[0, 4.5, 9, 0.05], [0, -4.5, 9, 0.05], [4.5, 0, 0.05, 9], [-4.5, 0, 0.05, 9]].forEach(function (side) {
        b.box('#4a86c8', side[0], 0.5, side[1], side[2], 1, side[3]);
    });
    b.box('#b9b5ad', 0, 0.2, 0, 4, 0.4, 4);
    b.box('#f2b705', -2.5, 5, -2.5, 0.35, 10, 0.35);
    b.box('#f2b705', -0.6, 10.1, -2.5, 6.6, 0.3, 0.35);
    b.box('#8a8f94', -4.2, 9.8, -2.5, 1, 0.6, 0.6);
    b.box('#c0392b', -2.5, 10.6, -2.5, 0.5, 0.6, 0.5);
    b.box('#555555', 1.8, 8.4, -2.5, 0.04, 3.2, 0.04);
    b.box('#c0603c', 1.5, 0.3, 1.5, 1.2, 0.5, 0.8);
    [-1, 1].forEach(function (x) {
        b.put(s.cone, '#ff7a1a', [x * 1.4, 0.22, 4.9], [0.22, 0.44, 0.22]);
    });
    return 10.6;
}

// A small flag in the district's colour, for the finished landmarks.
function cityFlag(b, x, z, height, hex) {
    b.put(b.shapes.post, '#d9dde0', [x, height / 2, z], [0.06, height, 0.06]);
    b.box(hex, x + 0.4, height - 0.3, z, 0.8, 0.5, 0.03);
}

// ---------- the landmarks ----------

// ป.1 กรุงเทพฯ: the Grand Palace. A white wall with crenellations, then the
// throne hall under stepped roofs, a golden chedi, prang towers, and in gold.
function cityGrandPalace(b, tier, colour) {
    let s = b.shapes;
    let gold = '#d4af37';
    if (tier === 0) {
        return Math.max(cityBuildingSite(b), cityFillers(b, 0, cityThaiPavilion, CITY_PALACE_SLOTS));
    }
    cityGrounds(b, tier, '#efe8da', cityTopiary);
    let around = cityFillers(b, tier, cityThaiPavilion, CITY_PALACE_SLOTS);

    // the wall, open at the front for the gate
    let wall = '#f4f1ea';
    [[0, -7, 14, 0.4], [-7, 0, 0.4, 14], [7, 0, 0.4, 14]].forEach(function (side) {
        b.box(wall, side[0], 0.7, side[1], side[2], 1.4, side[3]);
    });
    [-1, 1].forEach(function (side) {
        b.box(wall, side * 4.4, 0.7, 7, 5.2, 1.4, 0.4);
        b.box(wall, side * 1.4, 1.2, 7, 0.6, 2.4, 0.6);
    });
    for (let i = -6; i <= 6; i += 1.2) {
        b.box(wall, i, 1.55, -7, 0.5, 0.3, 0.45);
        b.box(wall, -7, 1.55, i, 0.45, 0.3, 0.5);
        b.box(wall, 7, 1.55, i, 0.45, 0.3, 0.5);
    }
    b.put(s.prism, '#2e7d4f', [0, 2.4, 7], [3.4, 0.9, 1]);
    b.put(s.spire, gold, [0, 3.9, 7], [0.2, 1.4, 0.2], null, 'metal');
    let height = 4.6;

    if (tier >= 2) {
        // the throne hall, its roofs in tiers, ridges along x
        b.box('#f6f2ea', 0, 0.35, -0.5, 6.2, 0.7, 4);
        b.box('#fbf8f2', 0, 1.8, -0.5, 5, 2.2, 3);
        b.box('#8b1e1e', 0, 1.5, 1.02, 1, 1.6, 0.04);
        [[6.2, 1.1, 4, 2.9, '#2e7d4f'], [5, 1.4, 3.4, 3.3, '#e0662c'], [3.6, 1.3, 2.6, 4.2, '#e9772f']].forEach(function (roof) {
            b.put(s.prism, roof[4], [0, roof[3], -0.5], [roof[2], roof[1], roof[0]], [0, Math.PI / 2, 0]);
        });
        height = 6;
    }
    if (tier >= 3) {
        // the golden chedi behind the hall
        b.put(s.cylinder, gold, [0, 0.25, -4.6], [3.2, 0.5, 3.2], null, 'metal');
        b.put(s.cylinder, gold, [0, 0.7, -4.6], [2.6, 0.4, 2.6], null, 'metal');
        b.put(s.ball, gold, [0, 1.9, -4.6], [2.5, 2.3, 2.5], null, 'metal');
        b.box(gold, 0, 3.15, -4.6, 0.8, 0.4, 0.8, 'metal');
        b.put(s.cone, gold, [0, 5, -4.6], [0.7, 3.4, 0.7], null, 'metal');
        height = 6.7;
    }
    if (tier >= 4) {
        // prang towers either side, a spired prasat on the hall
        [-4.3, 4.3].forEach(function (x) {
            [[1.6, 0.8], [1.3, 0.8], [1.0, 0.8], [0.75, 0.7]].forEach(function (step, i) {
                b.box('#f1ede2', x, 0.4 + i * 0.8, -0.5, step[0], step[1], step[0]);
            });
            b.put(s.cone, '#f1ede2', [x, 4.2, -0.5], [0.9, 1.8, 0.9]);
            b.put(s.spire, gold, [x, 5.4, -0.5], [0.15, 0.8, 0.15], null, 'metal');
        });
        b.box('#fbf8f2', 0, 5.3, -0.5, 1.2, 0.8, 1.2);
        b.put(s.prism, '#e9772f', [0, 5.7, -0.5], [1.6, 0.8, 1.6]);
        b.put(s.spire, gold, [0, 7.2, -0.5], [0.25, 2.4, 0.25], null, 'metal');
        height = 8.4;
    }
    if (tier >= 5) {
        // gold along the hall's edges, white elephants at the gate, flags
        b.box(gold, 0, 0.72, -0.5, 6.3, 0.06, 4.1, 'metal');
        b.box(gold, 0, 2.95, -0.5, 5.1, 0.08, 3.1, 'metal');
        [-2.6, 2.6].forEach(function (x) {
            b.box('#f7f5ef', x, 0.75, 5.4, 0.8, 0.7, 1.4);
            b.box('#f7f5ef', x, 1.15, 6.1, 0.6, 0.6, 0.5);
            b.box('#f7f5ef', x, 0.75, 6.45, 0.18, 0.8, 0.18);
            [[-0.25, -0.5], [0.25, -0.5], [-0.25, 0.4], [0.25, 0.4]].forEach(function (leg) {
                b.box('#f7f5ef', x + leg[0], 0.2, 5.4 + leg[1], 0.22, 0.4, 0.22);
            });
            b.box(colour, x, 1.15, 5.4, 0.85, 0.12, 0.9);
        });
        [-6.4, 6.4].forEach(function (x) { cityFlag(b, x, 0.9, 4, colour); });
    }
    return Math.max(height, around);
}

// ป.2 โตเกียว: Tokyo Tower, red and white, its decks lit, a torii and cherry trees.
function cityTokyoTower(b, tier, colour) {
    let s = b.shapes;
    let red = '#e2421f', white = '#f3f3f3';
    if (tier === 0) {
        return Math.max(cityBuildingSite(b), cityFillers(b, 0, cityTokyoShop));
    }
    cityGrounds(b, tier, '#d9d2c5', citySakura);
    let around = cityFillers(b, tier, cityTokyoShop);

    cityLattice(b, red, 0, tier >= 2 ? 8 : 4, 9, tier >= 2 ? 4.2 : 6.6, tier >= 2 ? 4 : 2, 0.3, white);
    let height = tier >= 2 ? 8 : 4;
    if (tier >= 2) {
        b.box(white, 0, 8.8, 0, 5, 1.6, 5);
        b.box('#5d86a8', 0, 9, 0, 5.06, 0.6, 5.06, 'glow');
        b.box(red, 0, 9.7, 0, 5.2, 0.2, 5.2);
        height = 9.8;
    }
    if (tier >= 3) {
        cityLattice(b, red, 9.8, 17, 3.6, 1.6, 4, 0.22, white);
        b.box(white, 0, 17.4, 0, 2.2, 1, 2.2);
        b.box('#5d86a8', 0, 17.5, 0, 2.26, 0.4, 2.26, 'glow');
        height = 17.9;
    }
    if (tier >= 4) {
        cityLattice(b, red, 17.9, 21, 1.2, 0.5, 2, 0.14, white);
        b.put(s.post, white, [0, 23, 0], [0.12, 4, 0.12]);
        b.box('#ff3b30', 0, 25.1, 0, 0.2, 0.2, 0.2, 'glow');
        height = 25.2;
    }
    if (tier >= 5) {
        cityLegLights(b, 0.3, 8, 9, 4.2, 10, '#ffb347');
        // a torii gate in front
        [-1.4, 1.4].forEach(function (x) { b.put(s.post, '#d7261e', [x, 1.4, 5.6], [0.3, 2.8, 0.3]); });
        b.box('#d7261e', 0, 2.95, 5.6, 4, 0.3, 0.4);
        b.box('#1d1d1d', 0, 3.15, 5.6, 4.4, 0.12, 0.5);
        b.box('#d7261e', 0, 2.3, 5.6, 3.2, 0.2, 0.3);
        cityFlag(b, 6.6, 0.9, 4, colour);
    }
    return Math.max(height, around);
}

// ป.3 ปารีส: the Eiffel Tower in bronze, arches at its feet, lights that sparkle.
function cityEiffelTower(b, tier, colour) {
    let s = b.shapes;
    let iron = '#7a5c3e';
    if (tier === 0) {
        return Math.max(cityBuildingSite(b), cityFillers(b, 0, cityParisBuilding));
    }
    cityGrounds(b, tier, '#cdbb94', cityRoundTree);
    let around = cityFillers(b, tier, cityParisBuilding);

    cityLattice(b, iron, 0, tier >= 2 ? 6 : 3, 10, tier >= 2 ? 5.6 : 7.8, tier >= 2 ? 3 : 2, 0.36);
    let height = tier >= 2 ? 6 : 3;
    if (tier >= 2) {
        // an arch under each face
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (face) {
            let points = [];
            for (let i = 0; i <= 6; i++) {
                let t = i / 6, across = -3.6 + 7.2 * t, up = 1.2 + Math.sin(t * Math.PI) * 2.2;
                let out = 4.2 - Math.sin(t * Math.PI) * 0.3;
                points.push(face[0] ? [face[0] * out, up, across] : [across, up, face[1] * out]);
            }
            for (let i = 0; i < 6; i++) {
                cityBeam(b, iron, points[i], points[i + 1], 0.22);
            }
        });
        b.box(iron, 0, 6.2, 0, 6.6, 0.5, 6.6);
        height = 6.5;
    }
    if (tier >= 3) {
        cityLattice(b, iron, 6.5, 12, 4.8, 2.8, 3, 0.26);
        b.box(iron, 0, 12.2, 0, 3.4, 0.4, 3.4);
        height = 12.4;
    }
    if (tier >= 4) {
        cityLattice(b, iron, 12.4, 20, 2.4, 0.7, 4, 0.18);
        b.box(iron, 0, 20.4, 0, 1.1, 0.8, 1.1);
        b.put(s.post, iron, [0, 22, 0], [0.12, 2.6, 0.12]);
        height = 23.3;
    }
    if (tier >= 5) {
        cityLegLights(b, 0.4, 6, 10, 5.6, 8, '#ffd27a');
        cityLegLights(b, 6.6, 12, 4.8, 2.8, 6, '#ffd27a');
        b.box('#ffe9a8', 0, 21, 0, 0.5, 0.5, 0.5, 'glow');
        // café umbrellas on the lawn
        [[-1.8, 4.7], [1.8, 4.7]].forEach(function (spot) {
            b.put(s.post, '#555555', [spot[0], 0.7, spot[1]], [0.06, 1.4, 0.06]);
            b.put(s.cone, '#c62828', [spot[0], 1.55, spot[1]], [1.6, 0.45, 1.6]);
            b.put(s.cylinder, '#f3efe6', [spot[0], 0.5, spot[1]], [0.9, 0.06, 0.9]);
        });
        cityFlag(b, 6.6, 0.9, 4, colour);
    }
    return Math.max(height, around);
}

// ป.4 ลอนดอน: Big Ben and the Houses of Parliament, phone boxes and a red bus.
function cityBigBen(b, tier, colour) {
    let s = b.shapes;
    let stone = '#d4bd85', rib = '#b89c62', slate = '#55606a';
    let x = 2.8, z = -1.2;
    if (tier === 0) {
        return Math.max(cityBuildingSite(b), cityFillers(b, 0, cityLondonTerrace));
    }
    cityGrounds(b, tier, '#d6d2c8', cityRoundTree);
    let around = cityFillers(b, tier, cityLondonTerrace);

    b.box(stone, x, 2, z, 3, 4, 3);
    let height = 4;
    if (tier >= 2) {
        b.box(stone, x, 7.5, z, 2.6, 7, 2.6);
        [-0.7, 0, 0.7].forEach(function (offset) {
            b.box(rib, x + offset, 7.5, z + 1.32, 0.14, 7, 0.06);
            b.box(rib, x + 1.32, 7.5, z + offset, 0.06, 7, 0.14);
            b.box(rib, x - 1.32, 7.5, z + offset, 0.06, 7, 0.14);
            b.box('#5d86a8', x + offset + 0.35, 7.5, z + 1.31, 0.18, 5, 0.04, 'glow');
        });
        height = 11;
    }
    if (tier >= 3) {
        // the clock stage, a face on every side
        b.box(stone, x, 12.5, z, 3.2, 3, 3.2);
        [[0, 1.62, 0], [0, -1.62, Math.PI], [1.62, 0, Math.PI / 2], [-1.62, 0, -Math.PI / 2]].forEach(function (face) {
            b.put(s.cylinder, '#fdf8e6', [x + face[0], 12.5, z + face[1]], [2.2, 0.06, 2.2], [Math.PI / 2, 0, face[2]], 'glow');
            b.box('#1d1d1d', x + face[0] * 1.02, 12.85, z + face[1] * 1.02, 0.1, 0.8, 0.05, 'body', [0, face[2], 0]);
            b.box('#1d1d1d', x + face[0] * 1.02, 12.5, z + face[1] * 1.02, 0.6, 0.1, 0.05, 'body', [0, face[2], 0]);
            b.box('#d4af37', x + face[0], 12.5, z + face[1], 2.5, 0.12, 0.08, 'metal', [0, face[2], 0]);
        });
        height = 14;
    }
    if (tier >= 4) {
        b.box('#8a7a55', x, 14.8, z, 2.6, 1.6, 2.6);
        b.put(s.pyramid, slate, [x, 15.6, z], [3.6, 5.2, 3.6]);
        [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(function (c) {
            b.put(s.spire, '#d4af37', [x + c[0] * 1.25, 16.1, z + c[1] * 1.25], [0.18, 1, 0.18], null, 'metal');
        });
        b.put(s.post, '#d4af37', [x, 21.4, z], [0.08, 1.2, 0.08], null, 'metal');
        // Parliament, long and low beside the tower
        b.box(stone, -2, 1.7, z, 6, 3.4, 3);
        b.put(s.prism, slate, [-2, 3.4, z], [3, 1, 6], [0, Math.PI / 2, 0]);
        for (let i = 0; i < 6; i++) {
            b.box('#5d86a8', -4.6 + i * 1.05, 1.9, z + 1.51, 0.4, 1.6, 0.04, 'glow');
            b.put(s.spire, rib, [-5 + i * 1.2, 3.9, z + 1.3], [0.14, 1, 0.14]);
        }
        height = 22;
    }
    if (tier >= 5) {
        [-2.6, -1.8].forEach(function (bx) {
            b.box('#d0021b', bx, 1.1, 5.4, 0.8, 2.2, 0.8);
            b.box('#cfe8ff', bx, 1.3, 5.81, 0.55, 1.1, 0.02, 'glow');
        });
        b.box('#d0021b', 1.5, 1.5, 4.9, 3.6, 2.4, 1.3);
        b.box('#3a4a5a', 1.5, 1.2, 4.9, 3.62, 0.5, 1.32, 'glow');
        b.box('#3a4a5a', 1.5, 2.2, 4.9, 3.62, 0.5, 1.32, 'glow');
        [[0.3, 5.55], [2.7, 5.55], [0.3, 4.25], [2.7, 4.25]].forEach(function (w) { cityWheel(b, w[0], w[1], 0.28); });
        cityFlag(b, -4.6, z - 1.2, 5.6, colour);
    }
    return Math.max(height, around);
}

// ป.5 นิวยอร์ก: the Statue of Liberty on her star fort, and a skyline behind.
function cityStatueOfLiberty(b, tier, colour) {
    let s = b.shapes;
    let THREE = b.THREE;
    let copper = '#6fae96', granite = '#cfc7b6';
    if (tier === 0) {
        return Math.max(cityBuildingSite(b), cityFillers(b, 0, cityNewYorkTower));
    }
    cityGrounds(b, tier, '#d7d3c9', cityRoundTree);
    let around = cityFillers(b, tier, cityNewYorkTower);

    b.box('#b9b2a4', 0, 0.4, 0, 8.4, 0.8, 8.4);
    b.box('#b9b2a4', 0, 0.4, 0, 8.4, 0.8, 8.4, 'body', [0, Math.PI / 4, 0]);
    let height = 0.8;
    if (tier >= 2) {
        b.box(granite, 0, 3, 0, 3.4, 4.4, 3.4);
        b.box(granite, 0, 5.4, 0, 3.9, 0.4, 3.9);
        b.box('#bdb4a2', 0, 1.2, 0, 4, 0.8, 4);
        height = 5.6;
    }
    // the figure, drawn from the top of the pedestal and scaled up to stand
    // tall on it
    let k = 1.35, base = 5.6;
    let at = function (x, y, z) { return [x * k, base + y * k, z * k]; };
    let size = function (x, y, z) { return [x * k, y * k, z * k]; };
    if (tier >= 3) {
        let robe = new THREE.CylinderGeometry(0.75 * k, 1.25 * k, 4.2 * k, 14);
        b.put(robe, copper, at(0, 2.1, 0));
        robe.dispose();
        b.put(s.ball, copper, at(0, 4.2, 0), size(1.8, 0.9, 1.3));
        [-0.6, 0, 0.6].forEach(function (fold) {
            b.put(s.box, '#5f9e86', at(fold, 2, 1.05), size(0.12, 3.8, 0.1));
        });
        height = base + 4.6 * k;
    }
    if (tier >= 4) {
        b.put(s.ball, copper, at(0, 5, 0), size(1.1, 1.2, 1.1));
        for (let i = 0; i < 7; i++) {
            let a = -Math.PI / 2 + (i - 3) * 0.42;
            // each spike leans out the way it faces
            b.put(s.spire, copper, at(Math.cos(a) * 0.5, 5.7, -Math.sin(a) * 0.5), size(0.14, 0.9, 0.14), [-Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9]);
        }
        cityBeam(b, copper, at(0.6, 4.2, 0), at(0.9, 7, 0.2), 0.36 * k);
        b.put(s.cylinder, '#d4af37', at(0.9, 7.3, 0.2), size(0.4, 0.5, 0.4), null, 'metal');
        b.put(s.box, copper, at(-0.85, 3.6, 0.55), size(0.8, 1.1, 0.25), [0, 0, 0.3]);
        height = base + 8 * k;
    }
    if (tier >= 5) {
        b.put(s.cone, '#ffcf4a', at(0.9, 7.9, 0.2), size(0.5, 0.9, 0.5), null, 'glow');
        // a yellow cab parked along the front
        b.box('#f5c518', 0, 0.5, 6.6, 2.1, 0.5, 1.1);
        b.box('#f5c518', -0.1, 0.9, 6.6, 1.1, 0.4, 0.95);
        b.box('#3a4a5a', -0.1, 0.92, 6.6, 0.9, 0.26, 0.97, 'glow');
        cityFlag(b, 6.6, 0.9, 4, colour);
    }
    return Math.max(height, around);
}

// ป.6 ดูไบ: the Burj Khalifa, rising in steps on three wings to its spire, by a
// lake of fountains and palms.
function cityBurjKhalifa(b, tier, colour) {
    let s = b.shapes;
    let skin = '#c9d3da', glass = '#7fa6c4';
    let sections = 12, step = 2.2;
    if (tier === 0) {
        return Math.max(cityBuildingSite(b), cityFillers(b, 0, cityDubaiBuilding));
    }
    cityGrounds(b, tier, '#e6dcc6', cityPalm);
    let around = cityFillers(b, tier, cityDubaiBuilding);

    let built = tier >= 4 ? sections : tier * 3;
    for (let k = 0; k < built; k++) {
        let r = 2.6 * (1 - 0.8 * k / sections);
        let y = k * step + step / 2;
        b.put(s.post, skin, [0, y, 0], [r * 2, step, r * 2]);
        b.put(s.post, glass, [0, y + 0.3, 0], [r * 2 + 0.06, 0.6, r * 2 + 0.06], null, 'glow');
        if (k < 8) {
            for (let w = 0; w < 3; w++) {
                let a = w * Math.PI * 2 / 3 + Math.PI / 2;
                let wing = r * (0.55 - k * 0.04);
                b.put(s.post, skin, [Math.cos(a) * r * 0.7, y - (k % 2) * 0.3, Math.sin(a) * r * 0.7], [wing * 2, step, wing * 2]);
            }
        }
    }
    if (tier < 4) {
        // still going up: a crane on the top
        let top = built * step;
        b.box('#f2b705', 0.4, top + 1.6, 0, 0.25, 3.2, 0.25);
        b.box('#f2b705', 1.6, top + 3.2, 0, 3.6, 0.2, 0.25);
    }
    let height = built * step;
    if (tier >= 4) {
        b.put(s.spire, '#dfe6ea', [0, height + 3.5, 0], [0.5, 7, 0.5]);
        height += 7;
    }
    if (tier >= 5) {
        b.box('#ffffff', 0, height + 0.1, 0, 0.18, 0.18, 0.18, 'glow');
        b.box('#5fc6f0', 0, 0.06, 5.2, 6, 0.08, 2.2, 'glow');
        [-2.2, -0.7, 0.7, 2.2].forEach(function (x) {
            b.put(s.post, '#e8f7ff', [x, 0.8, 5.2], [0.1, 1.6, 0.1], null, 'glow');
        });
        cityFlag(b, 6.6, 0.9, 4, colour);
    }
    return Math.max(height, around);
}

// A sail of the opera house: a quarter of a sphere, stretched tall and leaning
// back, closed on its open side.
function citySail(b, x, z, size, facing) {
    let THREE = b.THREE;
    let shell = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI, 0, Math.PI / 2);
    let back = new THREE.CircleGeometry(1, 16, 0, Math.PI);
    back.rotateY(Math.PI);
    let scale = [size * 0.75, size * 1.7, size * 1.1];
    let turn = [-0.3, facing, 0];

    b.put(shell, '#f6f4ee', [x, 1.2, z], scale, turn);
    b.put(back, '#e9e4d6', [x, 1.2, z], scale, turn);
    shell.dispose();
    back.dispose();
}

// เสริม ซิดนีย์: the Opera House's sails on their podium by the harbour, and at
// the last the Harbour Bridge.
function citySydneyOpera(b, tier, colour) {
    let s = b.shapes;
    let THREE = b.THREE;
    if (tier === 0) {
        return Math.max(cityBuildingSite(b), cityFillers(b, 0, citySydneyBuilding));
    }
    cityGrounds(b, tier, '#ddd3bf', cityRoundTree, true);
    let around = cityFillers(b, tier, citySydneyBuilding);

    b.box('#d9c7a6', 0, 0.6, -1.4, 10, 1.2, 5.6);
    b.box('#cdb995', 0, 0.3, 1.8, 4, 0.6, 1);
    let height = 1.2;
    [[2, -2.8, 2.6], [3, 0.2, 2.2], [4, 3, 1.7]].forEach(function (group) {
        if (tier >= group[0]) {
            citySail(b, group[1], -0.4, group[2], 0);
            citySail(b, group[1], -2.2, group[2] * 0.75, Math.PI);
            height = Math.max(height, 1.2 + group[2] * 1.7);
        }
    });
    if (tier >= 4) {
        // the harbour along the front
        b.box('#3f8fd0', 0, 0.05, 5.95, 13.6, 0.06, 1.9, 'metal');
    }
    if (tier >= 5) {
        b.box('#ffe9a8', 0, 1.25, 1.4, 9.6, 0.08, 0.1, 'glow');
        // the bridge's arch over the water
        let arch = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-6.4, 0.2, 5.95), new THREE.Vector3(0, 8.4, 5.95), new THREE.Vector3(6.4, 0.2, 5.95)), 20, 0.18, 5, false);
        b.put(arch, '#7d868c', [0, 0, 0]);
        arch.dispose();
        b.box('#7d868c', 0, 1.6, 5.95, 13.4, 0.25, 1);
        [-4, -2, 0, 2, 4].forEach(function (hx) {
            b.box('#7d868c', hx, 1.6 + (4.2 - hx * hx * 0.105) / 2, 5.95, 0.06, 4.2 - hx * hx * 0.105, 0.06);
        });
        b.box('#2e9d4e', -3, 0.3, 5.95, 1.6, 0.5, 0.7);
        b.box('#f5c518', -3, 0.65, 5.95, 0.9, 0.3, 0.5);
        cityFlag(b, 6.6, 0.9, 4, colour);
    }
    return Math.max(height, around);
}

// ---------- the streak's cars and robot animals ----------

function cityBus(b) {
    b.box('#2e9d4e', 0, 0.85, 0, 1.2, 1.2, 3.2);
    b.box('#3a4a5a', 0, 1.05, 0, 1.22, 0.45, 3, 'glow');
    b.box('#f2f2f2', 0, 1.5, 0, 1.1, 0.1, 3.1);
    b.box('#fff3c4', -0.35, 0.55, 1.61, 0.2, 0.12, 0.02, 'glow');
    b.box('#fff3c4', 0.35, 0.55, 1.61, 0.2, 0.12, 0.02, 'glow');
    [[-0.6, 1.1], [0.6, 1.1], [-0.6, -1.1], [0.6, -1.1]].forEach(function (w) { cityWheel(b, w[0], w[1], 0.25); });
}

function cityIceCreamTruck(b) {
    b.box('#ffffff', 0, 0.8, -0.2, 1.1, 1.1, 1.8);
    b.box('#ff8fb1', 0, 0.55, -0.2, 1.12, 0.3, 1.82);
    b.box('#ffffff', 0, 0.6, 1.05, 1.0, 0.7, 0.7);
    b.box('#3a4a5a', 0, 0.82, 1.2, 0.9, 0.3, 0.42, 'glow');
    b.put(b.shapes.cone, '#e8b06a', [0, 1.6, -0.3], [0.4, 0.6, 0.4], [Math.PI, 0, 0]);
    b.put(b.shapes.ball, '#ff8fb1', [0, 2.0, -0.3], [0.5, 0.45, 0.5]);
    [[-0.55, 0.8], [0.55, 0.8], [-0.55, -0.8], [0.55, -0.8]].forEach(function (w) { cityWheel(b, w[0], w[1], 0.2); });
}

function cityFireTruck(b) {
    b.box('#d0021b', 0, 0.75, -0.3, 1.15, 0.9, 2.2);
    b.box('#d0021b', 0, 0.85, 1.05, 1.1, 1.1, 0.8);
    b.box('#3a4a5a', 0, 1.05, 1.3, 1.0, 0.4, 0.32, 'glow');
    b.box('#c9ced3', 0, 1.3, -0.3, 0.3, 0.12, 2.3);
    for (let i = 0; i < 5; i++) {
        b.box('#c9ced3', 0, 1.3, -1.2 + i * 0.45, 0.6, 0.06, 0.06);
    }
    b.box('#ff3b30', 0, 1.47, 1.05, 0.5, 0.12, 0.2, 'glow');
    [[-0.58, 0.9], [0.58, 0.9], [-0.58, -0.9], [0.58, -0.9]].forEach(function (w) { cityWheel(b, w[0], w[1], 0.24); });
}

function citySportsCar(b, hex) {
    b.box(hex, 0, 0.38, 0, 1.05, 0.32, 2.1);
    b.box(hex, 0, 0.62, -0.2, 0.85, 0.26, 0.9);
    b.box('#3a4a5a', 0, 0.63, -0.15, 0.87, 0.18, 0.75, 'glow');
    b.box('#1d1d1d', 0, 0.62, -1.0, 1.0, 0.06, 0.2);
    b.box('#fff3c4', -0.35, 0.4, 1.06, 0.22, 0.08, 0.02, 'glow');
    b.box('#fff3c4', 0.35, 0.4, 1.06, 0.22, 0.08, 0.02, 'glow');
    [[-0.52, 0.7], [0.52, 0.7], [-0.52, -0.7], [0.52, -0.7]].forEach(function (w) { cityWheel(b, w[0], w[1], 0.2); });
}

const CITY_CAR_KINDS = [
    function (v) { cityTukTuk(v, '#1f6fd1', '#ffd23f'); },
    cityTaxi,
    cityBus,
    cityIceCreamTruck,
    cityFireTruck,
    function (v) { citySportsCar(v, '#ff9500'); },
    function (v) { cityTukTuk(v, '#2e9d4e', '#ffd23f'); },
    function (v) { citySportsCar(v, '#5e5ce6'); },
];

// Robot animals: brushed metal, a coloured panel, glowing eyes. Built facing +z.
function cityRobotLegs(b, hex, spots, height) {
    spots.forEach(function (spot) {
        b.box(hex, spot[0], height / 2, spot[1], 0.24, height, 0.24);
        b.box('#3b4148', spot[0], 0.06, spot[1], 0.3, 0.12, 0.34);
    });
}

function cityRobotDog(b) {
    let metal = '#b9c3cc';
    b.box(metal, 0, 0.75, 0, 0.7, 0.55, 1.4);
    b.box('#ff9500', 0, 1.04, -0.1, 0.5, 0.04, 0.8);
    b.box(metal, 0, 1.15, 0.85, 0.55, 0.5, 0.55);
    b.box('#8a949c', 0, 1.0, 1.2, 0.3, 0.22, 0.25);
    [-0.15, 0.15].forEach(function (x) {
        b.box('#5ce1ff', x, 1.25, 1.13, 0.1, 0.1, 0.02, 'glow');
        b.box('#8a949c', x * 1.6, 1.5, 0.78, 0.12, 0.3, 0.12, 'body', [0, 0, x * 2]);
    });
    b.box('#8a949c', 0, 1.1, -0.85, 0.08, 0.5, 0.08, 'body', [-0.6, 0, 0]);
    b.box('#ff3b30', 0, 1.36, -1.0, 0.12, 0.12, 0.12, 'glow');
    cityRobotLegs(b, '#8a949c', [[-0.25, 0.5], [0.25, 0.5], [-0.25, -0.5], [0.25, -0.5]], 0.5);
}

function cityRobotCat(b) {
    let metal = '#d7dde2';
    b.box(metal, 0, 0.6, 0, 0.6, 0.45, 1.2);
    b.box('#ff5fa2', 0, 0.84, 0, 0.4, 0.04, 0.6);
    b.box(metal, 0, 0.95, 0.72, 0.52, 0.46, 0.46);
    [-0.16, 0.16].forEach(function (x) {
        b.box('#a6ff5c', x, 1.0, 0.96, 0.1, 0.08, 0.02, 'glow');
        b.put(b.shapes.cone, metal, [x, 1.3, 0.72], [0.18, 0.3, 0.18]);
    });
    cityBeam(b, '#9aa3ab', [0, 0.75, -0.6], [0, 1.5, -0.95], 0.09);
    b.put(b.shapes.ball, '#ff5fa2', [0, 1.52, -0.96], [0.16, 0.16, 0.16], null, 'glow');
    cityRobotLegs(b, '#9aa3ab', [[-0.2, 0.42], [0.2, 0.42], [-0.2, -0.42], [0.2, -0.42]], 0.4);
}

function cityRobotDino(b) {
    let metal = '#8fbf9f';
    b.box(metal, 0, 1.4, 0, 0.9, 0.9, 1.5, 'body', [0.25, 0, 0]);
    b.box(metal, 0, 2.1, 0.85, 0.7, 0.6, 0.9);
    b.box('#6f9f80', 0, 1.9, 1.3, 0.6, 0.2, 0.5);
    [-0.2, 0.2].forEach(function (x) { b.box('#ffcf4a', x, 2.25, 1.31, 0.12, 0.1, 0.02, 'glow'); });
    cityBeam(b, metal, [0, 1.3, -0.7], [0, 0.6, -2.0], 0.4);
    for (let i = 0; i < 4; i++) {
        b.put(b.shapes.cone, '#ff7043', [0, 1.95 - i * 0.18, 0.4 - i * 0.45], [0.2, 0.4, 0.2]);
    }
    [-0.3, 0.3].forEach(function (x) { b.box('#6f9f80', x, 1.5, 0.65, 0.12, 0.12, 0.4, 'body', [0.6, 0, 0]); });
    cityRobotLegs(b, '#6f9f80', [[-0.32, -0.1], [0.32, -0.1]], 0.95);
}

function cityRobotElephant(b) {
    let metal = '#9fb3c8';
    b.box(metal, 0, 1.3, 0, 1.1, 0.95, 1.7);
    b.box('#5e5ce6', 0, 1.79, 0, 0.8, 0.04, 1.0);
    b.box(metal, 0, 1.55, 1.05, 0.8, 0.75, 0.6);
    [-1, 1].forEach(function (side) {
        b.box('#7f93a8', side * 0.6, 1.6, 0.95, 0.06, 0.7, 0.55);
        b.box('#5ce1ff', side * 0.2, 1.7, 1.36, 0.1, 0.1, 0.02, 'glow');
    });
    cityBeam(b, '#7f93a8', [0, 1.35, 1.35], [0, 0.6, 1.6], 0.22);
    cityBeam(b, '#7f93a8', [0, 0.6, 1.6], [0, 0.4, 1.85], 0.18);
    cityRobotLegs(b, '#7f93a8', [[-0.35, 0.55], [0.35, 0.55], [-0.35, -0.55], [0.35, -0.55]], 0.85);
}

const CITY_ROBOT_KINDS = [cityRobotDog, cityRobotCat, cityRobotDino, cityRobotElephant];
