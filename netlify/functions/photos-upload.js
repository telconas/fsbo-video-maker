// netlify/functions/photos-upload.js
import fs from 'fs';
import path from 'path';
import multiparty from 'multiparty';

export const config = {
  bodyParser: false
};

export async function handler(event) {
  const form = new multiparty.Form();

  return new Promise((resolve, reject) => {
    form.parse(event, (err, fields, files) => {
      if (err) {
        return resolve({ statusCode: 500, body: 'Upload error' });
      }

      const file = files.photo?.[0];
      const storedName = `${Date.now()}-${file.originalFilename}`;
      const uploadsPath = path.resolve('public/uploads');
      const newFilePath = path.join(uploadsPath, storedName);

      fs.copyFile(file.path, newFilePath, (err) => {
        if (err) {
          return resolve({ statusCode: 500, body: 'Failed to save file' });
        }

        return resolve({
          statusCode: 200,
          body: JSON.stringify({
            id: Date.now(),
            originalName: file.originalFilename,
            storedName: storedName
          })
        });
      });
    });
  });
}
