// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
// CLEANED BY t.me/metvamce
const { Telegraf } = require("telegraf");
const moment = require("moment-timezone");
const chalk = require("chalk");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const axios = require("axios");
const os = require('os');
let boxen;
import("boxen").then((module) => {
  boxen = module.default;
});
const { connectDB  } = require('./resources/netvance/netvancePay');
const {
  checkDepositStatusForAllUsers,
} = require("./resources/lib/sistemgetmutasi");
require("dotenv").config();
const db = new sqlite3.Database(
  "resources/database/database.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Error opening database:", err);
      setTimeout(() => {
        dbmanager();
      }, 1000);
      return;
    }
    console.log("[+] Database connected, Fixed by Netvance");
  }
);
async function dbmanager() {
  await db.run(`CREATE TABLE IF NOT EXISTS list (
		id INTEGER PRIMARY KEY,
		nameproduct TEXT,
		price TEXT,
		stock INT,
		desc TEXT,
		category TEXT,
		snk TEXT,
    expired_at TEXT
	)`);

  await db.all(`PRAGMA table_info('list')`, function (err, rows) {
    if (err) {
      console.error("Error checking table info:", err);
      return;
    }
    if (rows.length === 0) {
      return;
    }
    const hasSnkColumn = rows.some((column) => column.name === "snk");
    const hasDescColumn = rows.some((column) => column.name === "desc");
    const hasCategoryColumn = rows.some((column) => column.name === "category");
    if (!hasDescColumn) {
      db.run(`ALTER TABLE list ADD COLUMN desc TEXT`, function (err) {
        if (err) {
          return;
        }
        console.log("[SQL] Building Column desc...");
      });
    }
    if (!hasCategoryColumn) {
      db.run(`ALTER TABLE list ADD COLUMN category TEXT`, function (err) {
        if (err) {
          return;
        }
        console.log("[SQL] Building Column category...");
      });
    }
    if (!hasSnkColumn) {
      db.run(`ALTER TABLE list ADD COLUMN snk TEXT`, function (err) {
        if (err) {
          return;
        }
        console.log("[SQL] Building Column snk...");
      });
    }
  });
  db.run(`CREATE TABLE IF NOT EXISTS stock (
    stock_no INTEGER PRIMARY KEY,
    id INT,
    info TEXT NOT NULL,
    expired_at DATETIME
)`);
}
dbmanager();
const getRandomColor = () => {
  const colors = [
    chalk.red,
    chalk.green,
    chalk.yellow,
    chalk.blue,
    chalk.magenta,
    chalk.cyan,
    chalk.white,
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const bot = new Telegraf(process.env.BOT_TOKEN);
console.log("[BOT] Telegram bot is running...");

bot.use((ctx, next) => {
  const timestamp = moment().format("YYYY-MM-DD");
  const time = moment().format("HH:mm:ss");
  const username = ctx.from.username || ctx.from.id;
  const message = ctx.message?.text || "[Non-text message]";
  const coloredMessage = getRandomColor()(message);
  const logMessage = `[LOG] ${chalk.yellow(timestamp)} ${chalk.green(
    time
  )} | ${chalk.cyan(username)} | ${coloredMessage}`;
  console.log(
    boxen(logMessage, {
      padding: 0,
      margin: 0,
      borderStyle: "round",
      borderColor: "blue",
      dimBorder: true,
    })
  );

  return next();
});
const configs = JSON.parse(fs.readFileSync('./resources/Admin/settings.json'))
async function fitures() {
	const startmenu = require('./commands/start')
	const settings = require('./commands/settings')
  const produk = require('./commands/produk')
  const adminmenu = require('./commands/admin')

  adminmenu(bot, db, configs)
	startmenu(bot, db, configs)
	settings(bot, db, configs)
  produk(bot, db, configs)
}

 
fitures()
const cron = require("node-cron");

cron.schedule("0 0 * * *", async () => {
    const currentTime = new Date().toISOString().slice(0, 19).replace("T", " "); // Format YYYY-MM-DD HH:MM:SS

    db.all("SELECT * FROM stock WHERE expired_at <= ?", [currentTime], (err, rows) => {
        if (err) {
            console.error("Error saat mengecek stok expired:", err);
            return;
        }

        if (rows.length === 0) {
            console.log("Tidak ada stok yang expired hari ini.");
            return;
        }

        let message = "📢 *Laporan Stock Expired* 📢\n━━━━━━━━━━━━━━━━━━\n";
        rows.forEach((row, index) => {
            message += `🔹 *ID:* ${row.id}\n📌 *Info:* ${row.info}\n⏳ *Expired:* ${row.expired_at} WIB\n━━━━━━━━━━━━━━━━━━\n`;
        });
        db.run("DELETE FROM stock WHERE expired_at <= ?", [currentTime], (err) => {
            if (err) {
                console.error("Error saat menghapus stok expired:", err);
                return;
            }
            console.log("Stock expired telah dihapus.");
        });

        bot.telegram.sendMessage(ownerChatId, message, { parse_mode: "Markdown" });
    });
});


const commands = [
	{ command: 'start', description: 'Start the bot' },
	{ command: 'pm', description: 'Private Message' },
	{ command: 'adminmenu', description: 'See admin command' }
  ];
  bot.telegram.setMyCommands(commands);

async function getPublicIP() {
    try {
        const res = await axios.get('https://api64.ipify.org?format=json');
        return res.data.ip;
    } catch (error) {
        console.error("❌ Gagal mendapatkan IP:", error);
        return "Tidak Diketahui";
    }
}

function getDeviceInfo() {
    return `${os.type()} ${os.release()} (${os.arch()})`;
}
 
  bot.telegram.getMe().then(async (me) => {
	const botInfo = `
  Username: https://t.me/${me.username}
  ID      : ${me.id}
  Name    : ${me.first_name}
	`;
    const ipAddress = await getPublicIP();
    const deviceInfo = getDeviceInfo();
	console.log(ipAddress, deviceInfo)
    await connectDB();
	setInterval(() => {
    checkDepositStatusForAllUsers(bot);
  }, 5000);
	console.log(botInfo);
  });
  

bot.launch().then(() => {
  console.log("[BOT] Bot Telegram siap menerima perintah.");
});

bot.catch((err) => {
  console.error("[ERROR] Terjadi kesalahan:", err);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
