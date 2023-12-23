const fsPromises = require("fs").promises;
const fs = require("fs");
module.exports = async (filePath, n = 10) => {
  try {
    const stats = await fsPromises.stat(filePath);
    const fileSizeInBytes = stats.size;

    let lines = [];

    let bytesRemaining = fileSizeInBytes;
    let residualLine = "";

    const fd = await fsPromises.open(filePath, "r");
    const bufferSize = 1024;
    const buffer = Buffer.alloc(bufferSize);

    while (lines.length <= n && bytesRemaining > 0) {
        
      const length = bufferSize < bytesRemaining ? bufferSize : bytesRemaining;
      fs.readSync(fd.fd, buffer, 0, length, bytesRemaining - length);

      // should have handled read using promises(await)
      const bufferString = buffer.toString().slice(0, length) + residualLine;

      let firstIndexOfNewLine = bufferString.indexOf("\n");
      if (firstIndexOfNewLine >= 0)
        residualLine = bufferString.slice(0, firstIndexOfNewLine);
      else residualLine = bufferString.slice(0);

      if (firstIndexOfNewLine >= 0) {
        const bufferLines = bufferString
          .slice(firstIndexOfNewLine + 1)
          .split("\n");
        lines = [...bufferLines, ...lines];
      }

      bytesRemaining -= bufferSize;
    }
    fd.close();

    return lines.slice(lines.length - n, lines.length);
  } catch (err) {
    console.log(err);
    return [];
  }
};
