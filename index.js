// * Libraries
const { exec } = require("child_process");
const FG = require("fast-glob");
const DB = require("better-sqlite3")("musx.db", {});

// * Configs
DB.pragma("journal_mode = WAL");

// ? Create table if it doesn't exist
DB.prepare(
  `CREATE TABLE IF NOT EXISTS "directory" (
      path VARCHAR(100) PRIMARY KEY,
      sync_date DATETIME,
      title VARCHAR (255),
      album VARCHAR(255),
      album_artist VARCHAR(255),
      artists VARCHAR(255),
      genre VARCHAR(20),
      year VARCHAR(20),
      track TINYINT(3),
      rating DOUBLE,
      bitrate INT(10),
      size MEDIUMINT,
      duration DOUBLE,
      format VARCHAR(5),
      channels TINYINT(1),
      channel_layout VARCHAR(15),
      sample_rate INT(10),
      encoder VARCHAR(20),
      artwork VARCHAR(255),
      lyrics TEXT
    )`
).run();

async function scan() {
  const stream = FG.stream(["Music/**/*.mp3", "Music/**/*.aac"], {
    absolute: false,
    onlyDirectories: false,
    dot: false,
    objectMode: false,
    ignore: ["**.png"],
  });

  let count = 0;

  // ? Loop through each stream entry
  for await (const entry of stream) {
    count++;
    console.log(`${count}. ${entry}`);
    // ? Execute ffprobe to retrieve metadata
    exec(
      `ffprobe -show_entries 'stream:format' -output_format json "./${entry}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }
        // ? If no errors,
        const { streams, format } = JSON.parse(stdout);
        // ? Remove root directory from entry
        const path = entry.replace("Music/", "");
        // ? Destructure
        const { tags, bit_rate: bitrate, size, duration, format_name } = format;
        // ? Get the path and rename it to make artwork
        const artwork = `${path
          .replace(`.${format_name}`, "")
          .replace(/[^a-zA-Z0-9]/g, "_")}.jpg`; //\W+ //const filename = path.split("/").slice(-1)[0];
        // ? Execute ffmpeg to extract artwork
        exec(
          `ffmpeg -y -i "./${entry}" -an -vcodec copy "./Artwork/${artwork}"`,
          () => {
            // ? Insert record to DB
            try {
              DB.prepare(
                `INSERT INTO directory VALUES (?,DateTime('now'),?,?,?,?,?,?,?,0,?,?,?,?,?,?,?,?,?,NULL)`
              ).run([
                path,
                tags?.title,
                tags?.album,
                tags?.album_artist,
                tags?.artist,
                tags?.genre,
                tags?.date,
                tags?.track,
                bitrate,
                size,
                duration,
                format_name,
                streams[0].channels,
                streams[0].channel_layout,
                streams[0].sample_rate,
                streams[0]?.tags?.encoder,
                artwork,
              ]);
            } catch (err) {
              console.log(err.message);
            }
          }
        );
      }
    );
  }
}

function truncate() {
  DB.prepare(`DELETE FROM directory`).run();
}

function get(level) {
  const paths = DB.prepare(
    `SELECT path FROM directory WHERE path LIKE '%${level}%'`
  ).all();

  return [
    ...new Set(paths.map(({ path }) => path.replace(level, "").split("/")[0])), // new Set removes duplicates
  ];
}

console.log(get(""));
//console.log(get("Tanzania/"));
//console.log(get("Tanzania/Rayvanny/Flowers III/"));
//scan();
//truncate();
