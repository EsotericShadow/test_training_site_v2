import Image from 'next/image';

interface HeroImageProps {
  src: string;
  alt: string;
}

export default function HeroImage({ src, alt }: HeroImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      priority
    />
  );
}
