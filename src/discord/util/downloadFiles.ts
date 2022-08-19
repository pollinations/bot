import fetch from 'node-fetch';
import fs from 'fs';

const BASE_DIR = '/tmp';

export const downloadFiles = async (fileList: [string, string][], fileEnding: string = '.mp4') => {
  return Promise.all(
    fileList
      .filter(([filename, _url]) => filename.endsWith(fileEnding))
      .map(async ([filename, url]) => {
        console.log('fetching url', url);
        const response = await fetch(url);
        const buffer = await response.buffer();
        // write to local filesystem
        const filePath = `${BASE_DIR}/${filename}`;
        fs.writeFileSync(filePath, buffer);
        console.log('wrote file', filePath);
        return filePath;
      })
  );
};
