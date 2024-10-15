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

//const sqlite3 = require("sqlite-async").verbose();
//const sqlite3 = require("sqlite3").verbose();
const DB = require("better-sqlite3")("musx.db", {});
//const DB = new sqlite3.Database("musx-db");
DB.pragma("journal_mode = WAL");

// ? create table
DB.prepare(
  `CREATE TABLE IF NOT EXISTS directory (
      path VARCHAR(100) PRIMARY KEY,
      timestamp DATETIME
    )`
).run();

DB.prepare(
  `CREATE TABLE IF NOT EXISTS directory (
      path VARCHAR(100) PRIMARY KEY,
      timestamp DATETIME
    )`
).run();

// ? stream
async function scan() {
  const stream = fg.stream(["Music/**/*.mp3"], {
    absolute: false,
    onlyDirectories: false,
    dot: false,
    objectMode: false,
    ignore: ["**.png"],
  });

  for await (const entry of stream) {
    const path = entry.replace("Music/", "");
    try {
      DB.prepare(`INSERT INTO directory VALUES (?, DateTime('now'))`).run([
        path,
      ]);
    } catch (error) {
      console.log(err.message);
    }
  }
}

function truncate() {
  DB.run(`DELETE FROM directory`);
}

function get(level) {
  const paths = DB.prepare(
    `SELECT path FROM directory WHERE path LIKE '%${level}%'`
  ).all();

  return [
    ...new Set(paths.map(({ path }) => path.replace(level, "").split("/")[0])), // new Set removes duplicates
  ];
}

console.log(get("Tanzania/"));
//console.log(get("Tanzania/Rayvanny/Flowers III/"));
//scan();
//truncate();
