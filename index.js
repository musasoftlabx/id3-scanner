const FG = require("fast-glob");
const { exec } = require("child_process");

const DB = require("better-sqlite3")("musx.db", {});
DB.pragma("journal_mode = WAL");

// ? create table
DB.prepare(
  `CREATE TABLE IF NOT EXISTS "directory" (
      path VARCHAR(100) PRIMARY KEY,
      sync_date DATETIME,
      title VARCHAR (255),
      album VARCHAR(255),
      album_artist VARCHAR(255),
      artist VARCHAR(255),
      genre VARCHAR(20),
      year INT,
      track TINYINT(3),
      rating TINYINT(1),
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

// ? stream
async function scan() {
  const stream = FG.stream(["Music/**/*.mp3"], {
    absolute: false,
    onlyDirectories: false,
    dot: false,
    objectMode: false,
    ignore: ["**.png"],
  });

  for await (const entry of stream) {
    exec(
      `ffprobe -show_entries 'stream:format' -output_format json "./${entry}"`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }

        const pretty = JSON.parse(stdout);
        const { streams, format } = pretty;

        const path = entry.replace("Music/", "");

        const { tags, bit_rate: bitrate, size, duration, format_name } = format;
        const {
          album,
          artist,
          album_artist,
          genre,
          title,
          track,
          date: year,
        } = tags;

        //const filename = path.split("/").slice(-1)[0];

        const artwork = `${path
          .replace(`.${format_name}`, "")
          .replace(/[^a-zA-Z0-9]/g, "_")}.jpg`; //\W+

        exec(
          `ffmpeg -y -i "./${entry}" -an -vcodec copy "./Artwork/${artwork}"`,
          () => {
            try {
              DB.prepare(
                `INSERT INTO directory VALUES (?,DateTime('now'),?,?,?,?,?,?,?,0,?,?,?,?,?,?,?,?,?,NULL)`
              ).run([
                path,
                title,
                album,
                album_artist,
                artist,
                genre,
                year,
                track,
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

//console.log(get("Tanzania/"));
//console.log(get("Tanzania/Rayvanny/Flowers III/"));
scan();
//truncate();
