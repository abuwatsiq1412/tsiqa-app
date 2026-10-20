/**
 * Pola bintang segi-delapan (dua persegi yang diputar 45°) — ornamen geometris
 * khas seni Islam. Dipakai sangat tipis sebagai tekstur latar.
 * Atur ketebalan kesan lewat warna teks + opasitas pada className.
 */
export function StarPattern({
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        <pattern
          id={id}
          width="72"
          height="72"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="18" y="18" width="36" height="36" />
            <rect
              x="18"
              y="18"
              width="36"
              height="36"
              transform="rotate(45 36 36)"
            />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
