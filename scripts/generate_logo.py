#!/usr/bin/env python3
"""Generate logo and favicons with transparent background."""

from PIL import Image
import os

def remove_white_background(image_path, output_path, threshold=240):
    """Remove white background from image and make it transparent."""
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        # If pixel is close to white, make it transparent
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save(output_path, "PNG")
    return img

def generate_favicons(logo_path, output_dir):
    """Generate favicons in multiple sizes."""
    sizes = [16, 32, 192, 512]
    logo = Image.open(logo_path)

    os.makedirs(output_dir, exist_ok=True)

    for size in sizes:
        resized = logo.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(os.path.join(output_dir, f"icon-{size}.png"), "PNG")
        print(f"Generated icon-{size}.png")

    # Also save as favicon.ico (16x16 and 32x32)
    favicon_sizes = [(16, 16), (32, 32)]
    favicon_images = [logo.resize(size, Image.Resampling.LANCZOS) for size in favicon_sizes]
    favicon_images[0].save(
        os.path.join(output_dir, "favicon.ico"),
        format="ICO",
        sizes=favicon_sizes
    )
    print("Generated favicon.ico")

if __name__ == "__main__":
    base_dir = "/Users/levi/dev/levisegal/imposta"
    input_image = os.path.join(base_dir, "Gemini_Generated_Image_oq9k0ooq9k0ooq9k.png")
    logo_output = os.path.join(base_dir, "logo.png")
    public_dir = os.path.join(base_dir, "imposter-game/public")

    print("Removing white background...")
    remove_white_background(input_image, logo_output)
    print(f"Saved logo to {logo_output}")

    print("\nGenerating favicons...")
    generate_favicons(logo_output, public_dir)
    print(f"\nAll icons saved to {public_dir}")
