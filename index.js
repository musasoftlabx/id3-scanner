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
const DB = require("better-sqlite3")("musx-db", options);
//const DB = new sqlite3.Database("musx-db");

// ? create table
DB.run(
  `CREATE TABLE IF NOT EXISTS directory (
      path VARCHAR(100) PRIMARY KEY,
      timestamp DATETIME
    )`
);

DB.run(
  `CREATE TABLE IF NOT EXISTS directory (
      path VARCHAR(100) PRIMARY KEY,
      timestamp DATETIME
    )`
);

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
    DB.run(
      `INSERT INTO directory VALUES (?, DateTime('now'))`,
      [path],
      (err) => {
        if (err) console.log(err.message);
        return;
      }
    );
  }
}

function truncate() {
  DB.run(`DELETE FROM directory`);
}

function get(level) {
  // DB.each(
  //   `SELECT path FROM directory WHERE path LIKE '%${level}%'`,
  //   (err, { path }) => {
  //     if (err) return err.message;
  //     //res.push(path.replace(level, "").split("/")[0]);
  //     return path.replace(level, "").split("/")[0];
  //   }
  // );

  // const x = DB.all(
  //   `SELECT path FROM directory WHERE path LIKE '%${level}%'`,
  //   (err, paths) => {
  //     if (err) return err.message;

  //     console.log([
  //       ...new Set( // new Set removes duplicates
  //         paths.map(({ path }) => path.replace(level, "").split("/")[0])
  //       ),
  //     ]);
  //   }
  // );

  const x = DB.all(`SELECT path FROM directory WHERE path LIKE '%${level}%'`);

  console.log(x);
  // setTimeout(() => {
  //   console.log([...new Set(res)]);
  // }, 1000);
}

get("Tanzania/");
//get("Tanzania/Rayvanny/Flowers III/");
//scan();
//truncate();
