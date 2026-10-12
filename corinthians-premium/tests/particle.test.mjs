import test from 'node:test';
import assert from 'node:assert/strict';
import Particle from '../src/lib/Particle.ts';

test('a pointer exactly over a confetti particle cannot produce NaN', () => {
  const particle = new Particle(800, 600);
  Object.assign(particle, { x: 100, y: 100, vx: 0, vy: 0, rotation: 0, rVel: 0 });
  particle.update(800, 600, 100, 100);
  for (const value of [particle.x, particle.y, particle.vx, particle.vy, particle.rVel]) {
    assert.ok(Number.isFinite(value));
  }
  particle.update(800, 600, 90, 100);
  assert.ok(particle.vx > 0, 'nearby pointer still repels particles');
});

test('particles outside the viewport return to the opposite edge', () => {
  const particle = new Particle(800, 600);
  Object.assign(particle, { x: -60, y: 660, vx: 0, vy: 0, rotation: 0, rVel: 0 });
  particle.update(800, 600, -1000, -1000);
  assert.equal(particle.x, 850);
  assert.equal(particle.y, -50);
});
