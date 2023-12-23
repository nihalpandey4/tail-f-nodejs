const fs = require("fs");

const watch = (filePath, socketBroadCastingMethod) => {
  try {
    console.info("fileWatching enabled");
    fs.watchFile(
      filePath,
      {
        persistent: true,
        interval: 1000,
      },
      async (curr, prev) => {
        if (curr.size > prev.size) {
          const bufferSize = curr.size - prev.size;

          const buffer = Buffer.alloc(bufferSize);

          const fd = await fs.promises.open(filePath, "r");

          // will fail in cases where updates are so big that completion of this block takes more than 1000ms
          fs.read(
            fd.fd,
            buffer,
            0,
            bufferSize,
            prev.size,
            (err, bytesRead, bufferResult) => {
              if (err) {
                socketBroadCastingMethod("error in reading file");
              } else {
                const dataString = bufferResult.toString().trim();
                dataString.split("\n").forEach((line) => {
                  socketBroadCastingMethod(line.trim());
                });
                fd.close();
              }
            }
          );
        }
      }
    );
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  watch,
  unwatch: (filePath) => {
    fs.unwatchFile(filePath);
    console.info("file watching removed");
  },
};
