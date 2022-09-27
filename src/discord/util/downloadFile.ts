import { default as fetch } from 'node-fetch';
import fs from 'fs';

const BASE_DIR = '/tmp';

export const downloadFile = async ([filename, url]: [string, string]) => {
  const response = await fetch(url);
  const buffer = await response.buffer();
  // write to local filesystem
  const filePath = `${BASE_DIR}/${filename}`;
  fs.writeFileSync(filePath, buffer);
  return filePath;
};
