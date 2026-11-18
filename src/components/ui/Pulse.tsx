/** The Adpulse signature line: one heartbeat that rises into a growth curve. Drawn when it scrolls into view. */
export const PULSE_PATH =
  'M0 96 H330 L352 96 L366 62 L380 112 L396 22 L412 96 L446 96 C540 96 610 92 690 76 S860 36 1000 12';

export function Pulse({ className }: { className: string }) {
  return (
    <svg className={`pulse ${className}`} viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
      <path className="trace" pathLength={1} d={PULSE_PATH} />
    </svg>
  );
}
