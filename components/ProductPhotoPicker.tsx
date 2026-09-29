"use client";

import { useEffect, useRef, useState } from "react";

type ExistingImage = {
  id: string;
  url: string;
  is_primary: boolean;
};

type ProductPhotoPickerProps = {
  existingImages?: ExistingImage[];
};

export function ProductPhotoPicker({
  existingImages = [],
}: ProductPhotoPickerProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);

    previews.forEach((url) => URL.revokeObjectURL(url));

    setPreviews(files.map((file) => URL.createObjectURL(file)));
  }

  return (
    <div className="rounded-xl border border-dashed border-ink/15 bg-[#faf8f3] p-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">
          Product photos
        </p>

        <p className="mt-2 text-sm leading-6 text-ink/55">
          Upload up to 4 product photos. Use clear, well-lit jewellery
          photographs.
        </p>
      </div>

      {existingImages.length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">
            Existing photos
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {existingImages.map((image) => (
              <label
                key={image.id}
                className="relative overflow-hidden rounded-xl border border-ink/10 bg-white"
              >
                <img
                  src={image.url}
                  alt="Product"
                  className="aspect-square w-full object-cover"
                />

                {image.is_primary && (
                  <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[.12em]">
                    Primary
                  </span>
                )}

<div className="border-t border-ink/10 p-2 text-[10px] uppercase tracking-[.1em]">
  <label className="flex items-center gap-2">
    <input
      type="radio"
      name="primary_image_id"
      value={image.id}
      defaultChecked={image.is_primary}
      className="h-3.5 w-3.5"
    />
    Set primary
  </label>

  <label className="mt-2 flex items-center gap-2">
    <input
      type="checkbox"
      name="delete_images"
      value={image.id}
      className="h-3.5 w-3.5"
    />
    Delete
  </label>
</div>              </label>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <label
          htmlFor="product-photos"
          className="mb-2 block text-[10px] font-semibold uppercase tracking-[.14em]"
        >
          {existingImages.length > 0
            ? "Add more photos"
            : "Choose photos"}
        </label>

        <input
          ref={inputRef}
          id="product-photos"
          name="product_photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleChange}
          className="block w-full rounded-xl border border-ink/10 bg-white p-3 text-sm"
        />
      </div>

      {previews.length > 0 && (
        <div className="mt-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.14em] text-ink/50">
            New photo preview
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {previews.map((url, index) => (
              <div
                key={url}
                className="relative overflow-hidden rounded-xl border border-ink/10 bg-white"
              >
                <img
                  src={url}
                  alt={`New product photo ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />

                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[.12em]">
                    First photo
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
