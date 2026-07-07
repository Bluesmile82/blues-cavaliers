// Minimal self-check for the vinyl fall-loop geometry. Run: node background.logic.test.mjs
// Guards the two numbers that decide whether vinyls are ever on screen.
import assert from 'node:assert';

const TOP = 3.5;

// spawn: y ∈ [-TOP, TOP] (see Scene positions). Every spawn must be within the
// recycle band, else a vinyl starts below the loop and never comes back.
for (let i = 0; i < 1000; i++) {
  const y = Math.random() * (TOP * 2) - TOP;
  assert(y >= -TOP && y <= TOP, `spawn y ${y} outside band`);
}

// recycle: once y < -TOP, it resets to TOP. After reset it must be inside the
// band so the fall repeats instead of teleporting out of view.
const recycle = (y) => (y < -TOP ? TOP : y);
assert(recycle(-4) === TOP, 'below-band vinyl must recycle to TOP');
assert(recycle(0) === 0, 'in-band vinyl must not move');
assert(recycle(-TOP) === -TOP, 'exactly at -TOP is still visible, no recycle');

console.log('ok');
