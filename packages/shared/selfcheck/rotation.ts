import { consumeSteps, normalizeDeg } from '../src/utils/rotation.ts';

const eq = (a: unknown, b: unknown) => {
  if (a !== b) throw new Error(`expected ${String(b)}, got ${String(a)}`);
};

eq(normalizeDeg(0), 0);
eq(normalizeDeg(90), 90);
eq(normalizeDeg(370), 10);
eq(normalizeDeg(-370), -10);
eq(normalizeDeg(190), -170);

eq(consumeSteps(25, 6).steps, 4);
eq(consumeSteps(25, 6).remainder, 1);
eq(consumeSteps(-25, 6).steps, -4);
eq(consumeSteps(-25, 6).remainder, -1);
eq(consumeSteps(5, 6).steps, 0);

console.log('rotation self-check OK');
