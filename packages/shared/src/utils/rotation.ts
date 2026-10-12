// Angle math for the virtual dial: normalize a rotation delta to [-180, 180]
// and consume it in fixed-size steps (one step == one minute of tuning).
export function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

export interface StepResult {
  steps: number;
  remainder: number;
}

export function consumeSteps(accumulated: number, degPerStep: number): StepResult {
  const steps = Math.trunc(accumulated / degPerStep);
  return { steps, remainder: accumulated - steps * degPerStep };
}
