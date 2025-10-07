import fs from 'fs';
import path from 'path';
import { TextDecoder, TextEncoder } from 'util';

const ignoredDirs = new Set(['.git', '.angular', 'dist', 'node_modules']);
const allowedExts = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.json',
  '.html',
  '.scss',
  '.css',
  '.less',
  '.sass',
  '.md',
  '.txt',
  '.yml',
  '.yaml',
]);

const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
const latin1Decoder = new TextDecoder('latin1');
const utf8Encoder = new TextEncoder();

const bomChar = '\ufeff';
const misencodedBom = '\u00ef\u00bb\u00bf';

let convertedCount = 0;

function shouldProcess(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!allowedExts.has(ext)) {
    return false;
  }
  const base = path.basename(filePath);
  if (base.endsWith('.min.js')) {
    return false;
  }
  return true;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (ignoredDirs.has(entry.name)) {
        continue;
      }
      walk(path.join(dir, entry.name));
    } else if (entry.isFile()) {
      const filePath = path.join(dir, entry.name);
      if (!shouldProcess(filePath)) {
        continue;
      }
      const buffer = fs.readFileSync(filePath);
      try {
        const text = utf8Decoder.decode(buffer);
        let normalizedText = text;
        if (text.startsWith(bomChar)) {
          normalizedText = text.slice(1);
        } else if (text.startsWith(misencodedBom)) {
          normalizedText = text.slice(misencodedBom.length);
        }
        if (normalizedText !== text) {
          const encoded = utf8Encoder.encode(normalizedText);
          fs.writeFileSync(filePath, encoded);
          convertedCount += 1;
        } else if (
          buffer.length >= 3 &&
          buffer[0] === 0xef &&
          buffer[1] === 0xbb &&
          buffer[2] === 0xbf
        ) {
          fs.writeFileSync(filePath, buffer.slice(3));
          convertedCount += 1;
        }
        continue;
      } catch (err) {
        // not valid UTF-8, fall through to convert
      }
      const content = latin1Decoder.decode(buffer);
      const encoded = utf8Encoder.encode(content);
      fs.writeFileSync(filePath, encoded);
      convertedCount += 1;
    }
  }
}

const startDir = path.resolve(process.argv[2] ?? 'src');
walk(startDir);
console.log(`Converted ${convertedCount} file(s) to UTF-8 starting from ${startDir}.`);
