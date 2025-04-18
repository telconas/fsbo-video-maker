// netlify/functions/upload.js
import { parse } from 'multiparty';
import fs from 'fs';
import path from 'path';

export const config = {
  bodyParser: false, // Required for file uploads
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.resolve('./public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new parse.Form({ uploadDir });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: 'File upload failed' });
    }

    const uploadedFiles = files?.photos?.map((file) => {
      const targetPath = path.join(uploadDir, file.originalFilename);
      fs.renameSync(file.path, targetPath);
      return `/uploads/${file.originalFilename}`;
    }) || [];

    return res.status(200).json({ message: 'Files uploaded successfully', files: uploadedFiles });
  });
}
