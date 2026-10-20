import Image from "next/image";

export function LogoMark({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/logo-tsiqa.png"
      alt="Simbol TSIQA"
      width={606}
      height={472}
      className={`object-contain ${className}`}
      priority
    />
  );
}

export function Logo({
  inverse = false,
  className = "",
}: {
  inverse?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo-tsiqa.png"
        alt="Logo TSIQA"
        width={44}
        height={34}
        className="h-8.5 w-auto object-contain"
        priority
      />
      <Image
        src="/tulisan-tsiqa.png"
        alt="TSIQA"
        width={98}
        height={26}
        className={`h-5 w-auto object-contain ${
          inverse ? "brightness-0 invert" : ""
        }`}
        priority
      />
    </span>
  );
}
