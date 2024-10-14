const NodeID3 = require("node-id3");
const fg = require("fast-glob");

//const tags = NodeID3.read('./Bang Out.mp3');
//ffprobe -show_format -pretty -print_format json "/Users/musa-mutetwi/projects/web/id3/Music/Manzi Nte.mp3"
//ffmpeg -i "/Users/musa-mutetwi/projects/web/id3/Music/Manzi Nte.mp3" -an -vcodec copy "/Users/musa-mutetwi/projects/web/id3/Music/Manzi Nte.png"

// NodeID3.read(
//   "./Music//Manzi Nte (feat. Masterpiece YVK, Ceeka RSA, M.J, Silas Africa & Al Xapo).mp3",
//   function (err, tags) {
//     if (err) throw err;
//     console.log(tags);
//   }
// );

const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("libx");

const x = fg.sync("**", {
  absolute: false,
  onlyDirectories: true,
  ignore: "node_modules",
});

console.log(x);
