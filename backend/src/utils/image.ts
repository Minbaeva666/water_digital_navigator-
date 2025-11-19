import sharp from 'sharp';

export async function resizeImageBuffer(
    buffer: Buffer,
    width = 500,
    height = 500,
    mimeType?: string
): Promise<Buffer> {
    // SVG: direkt unverändert zurückgeben
    if (mimeType === "image/svg+xml") {
        return buffer;
    }

    // Rasterbilder: normal resizen
    return sharp(buffer)
        .resize({
            width,
            height,
            fit: "inside",
            withoutEnlargement: true,
        })
        .toBuffer();
}
