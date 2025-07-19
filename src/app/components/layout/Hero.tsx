'use client';

import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
}

export default function Hero({ title, subtitle, imageUrl, imageAlt }: HeroProps) {
  return (
    <section className="relative text-white py-24 md:py-32">
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4">{title}</h1>
        <p className="text-xl md:text-2xl text-yellow-400 font-semibold">{subtitle}</p>
      </div>
    </section>
  );
}