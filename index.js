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
const DB = new sqlite3.Database("musx-db");

// ? create table
DB.run(
  `CREATE TABLE IF NOT EXISTS directory (
        path VARCHAR(100) PRIMARY KEY,
        timestamp DATETIME
    )`
);

// ? stream
async function scan() {
  const stream = fg.stream(["Music/**"], {
    absolute: false,
    onlyDirectories: false,
    dot: false,
    ignore: ["**.png"],
  });

  for await (const entry of stream) {
    //console.log(entry);
    DB.run(`INSERT INTO directory VALUES (?, DateTime('now'))`, [entry]);
  }
}

function truncate() {
  DB.run(`DELETE FROM directory`);
}

function get() {
  DB.each("SELECT * FROM directory", (err, row) => {
    console.log(row.path);
  });
}

//get();
scan();
//truncate();
