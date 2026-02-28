import Image from "next/image";

export default function TwoColumnImageGrid() {
  const images = [
    { src: "/images/grid-image/image-02.png", width: 517, height: 295, alt: "Grid image 2" },
    { src: "/images/grid-image/image-03.png", width: 517, height: 295, alt: "Grid image 3" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {images.map((img) => (
        <div
          key={img.src}
          className="overflow-hidden rounded-xl border border-(--token-gray-200) dark:border-(--color-border-dark-soft)"
        >
          <Image
            src={img.src}
            alt={img.alt}
            className="w-full object-cover"
            width={img.width}
            height={img.height}
          />
        </div>
      ))}
    </div>
  );
}
