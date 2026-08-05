import qrcode from 'qrcode-generator';
import { twMerge } from 'tailwind-merge';

export interface QrCodeProps {
  /** What a phone camera should end up opening. */
  value: string;
  /** Read out instead of the pattern — a QR is an image with no alt text of its own. */
  label: string;
  className?: string;
}

/**
 * A QR code, drawn as one SVG path.
 *
 * Deliberately black on white with a real quiet zone, on a screen where
 * everything else is dark and translucent: a camera reads contrast and margin,
 * not taste, and a QR styled to match the theme is a QR nobody can scan. The
 * card around it is what carries the app's look.
 *
 * One `<path>` rather than a rect per module — a 41×41 code is ~800 dark cells,
 * and that many nodes is a visible cost on a screen whose whole job is to
 * appear instantly.
 *
 * Error correction stays at «M»: nothing is drawn over the middle (no logo), so
 * the extra redundancy of «H» would only make the pattern denser and harder to
 * read from across a desk.
 */
export function QrCode({ value, label, className }: QrCodeProps) {
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();

  const count = qr.getModuleCount();
  // The standard four-module silent border. Without it a code sitting flush
  // against the edge of its card is unreadable at an angle.
  const quiet = 4;
  const size = count + quiet * 2;

  let path = '';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.isDark(row, col)) path += `M${col + quiet} ${row + quiet}h1v1h-1z`;
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      shapeRendering="crispEdges"
      className={twMerge('h-44 w-44', className)}
    >
      <rect width={size} height={size} fill="#ffffff" />
      <path d={path} fill="#000000" />
    </svg>
  );
}
