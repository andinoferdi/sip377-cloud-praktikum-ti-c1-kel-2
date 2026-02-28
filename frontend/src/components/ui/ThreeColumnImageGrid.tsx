import Image from "next/image";

export default function ThreeColumnImageGrid() {
  const images = [
    { src: "/images/grid-image/image-04.png", width: 338, height: 192, alt: "Grid image 4" },
    { src: "/images/grid-image/image-05.png", width: 338, height: 192, alt: "Grid image 5" },
    { src: "/images/grid-image/image-06.png", width: 338, height: 192, alt: "Grid image 6" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
