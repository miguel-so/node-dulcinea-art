import fs from 'fs';
import path from 'path';

/**
 * Extracts the file extension from a base64 image string.
 * @param base64Data The base64 string containing the image data.
 * @returns The file extension (e.g., '.png', '.jpg') or null if not found.
 */
export const getFileTypeFromBase64 = (base64Data: string): string | null => {
  const mimeTypeMatch = base64Data.match(/^data:image\/([a-zA-Z0-9-+]+);base64,/);

  if (mimeTypeMatch && mimeTypeMatch[1]) {
    const mimeType = mimeTypeMatch[1].toLowerCase();

    switch (mimeType) {
      case 'jpeg':
      case 'jpg':
        return '.jpg';
      case 'png':
        return '.png';
      case 'gif':
        return '.gif';
      case 'bmp':
        return '.bmp';
      case 'webp':
        return '.webp';
      default:
        return '.unknown';
    }
  }

  return null;
};

/**
 * Saves a base64 image string to the filesystem.
 * @param image The base64 image string.
 * @param imagePath The relative or absolute path where the image should be stored.
 * @param id The file name (without extension).
 */
export const uploadImage = (image: string, imagePath: string, id: string): void => {
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const imageType = getFileTypeFromBase64(image);
  if (!imageType) {
    console.error('Unsupported or invalid image format.');
    return;
  }

  const filePath = path.resolve(__dirname, imagePath, `${id}${imageType}`);
  console.log('Saving file to:', filePath);

  fs.writeFile(filePath, buffer, (err) => {
    if (err) {
      console.error('Error saving image:', err);
    }
  });
};
