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
require("dotenv").config();
const chalk = require("chalk");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const dab = new sqlite3.Database("./resources/database/database.db");
const axios = require("axios");
const path = require("path");
const Exceljs = require("exceljs");
const FormData = require("form-data");

const addRole = (id, role) => {
  const db = JSON.parse(fs.readFileSync("./resources/database/role.json"));
  const find = db.find((db) => db.id === id);
  if (find) {
    find.role = role;
    fs.writeFileSync("./resources/database/role.json", JSON.stringify(db));
    return 200;
  } else {
    db.push({ id: parseInt(id), role: role });
    fs.writeFileSync("./resources/database/role.json", JSON.stringify(db));
    return 202;
  }
};
const demoteRole = (id) => {
  const db = JSON.parse(fs.readFileSync("./resources/database/role.json"));
  const find = db.find((db) => db.id === parseInt(id));
  if (!find) return 404;
  db.splice(db.indexOf(find), 1);
  fs.writeFileSync("./resources/database/role.json", JSON.stringify(db));
  return 200;
};
function getRole(id) {
  const db = JSON.parse(fs.readFileSync("./resources/database/role.json"));
  const find = db.find((db) => db.id === id);

  if (!find) return false;
  return find.role;
}

async function generateRandomUsername() {
  const db = fs.readFileSync("./resources/database/username.txt", "utf-8").split("\n");
  return db[Math.floor(Math.random() * db.length)];
}

async function addData(
  chat_id,
  username,
  nama_produk,
  quantity,
  harga_barang,
  total_harga,
  stok_dibeli,
  tanggal
) {
  try {
    const g = await postToHastebin(stok_dibeli);
    const Workbook = new Exceljs.Workbook();
    await Workbook.xlsx.readFile("./resources/database/ysj.xlsx");
    const ws = Workbook.getWorksheet("penjualan");
    let rowIndex = ws.rowCount + 1;
    ws.addRow([
      chat_id,
      username,
      nama_produk,
      quantity,
      harga_barang,
      total_harga,
      g,
      tanggal,
    ]);
    await Workbook.xlsx.writeFile("./resources/database/ysj.xlsx");
    return true;
  } catch (e) {
    return false;
  }
}

async function isRegistered(ch) {
  const db = JSON.parse(fs.readFileSync("./resources/database/userlist.json"));
  const find = db.find((db) => db.chatId === ch);
  if (!find) return false;
  return true;
}
async function addSaldo(id, saldo) {
  const db = JSON.parse(fs.readFileSync("./resources/database/userlist.json"));
  const find = db.find((db) => db.chatId === id);
  if (!find) return false;
  find.balance += parseInt(saldo);
  fs.writeFileSync("./resources/database/userlist.json", JSON.stringify(db, null, 1));
  return true;
}
async function minusSaldo(id, saldo) {
  const db = JSON.parse(fs.readFileSync("./resources/database/userlist.json"));
  const find = db.find((db) => db.chatId === id);
  if (!find) return false;
  find.balance -= parseInt(saldo);
  fs.writeFileSync("./resources/database/userlist.json", JSON.stringify(db, null, 1));
  return true;
}

function TelegraPh(Path) {
  //console.log(path)
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(Path)) return reject(new Error("File not Found"));
    try {
      const form = new FormData();
      form.append("file", fs.createReadStream(Path));
      const data = await axios({
        url: "https://telegra.ph/upload",
        method: "POST",
        headers: {
          ...form.getHeaders(),
        },
        data: form,
      });
      fs.unlinkSync(Path);
      return resolve("https://telegra.ph" + data.data[0].src);
    } catch (err) {
      return reject(new Error(String(err)));
    }
  });
}
async function download(url, path) {
  const data = await axios.get(url, { responseType: "arraybuffer" });
  fs.writeFileSync(path, Buffer.from(data.data, "binary"));
  return path;
}
async function downloadImage(url) {
  const k = Date.now();
  const filePath = path.resolve(__dirname, `${k}.jpg`);

  try {
    const response = await axios({
      url,
      responseType: "stream",
    });

    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      writer.on("finish", () => {
        resolve(`lib/${k}.jpg`);
      });

      writer.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Error downloading the image:", error);
    throw error;
  }
}

async function additemcount(id, nama, total) {
  const db = await JSON.parse(fs.readFileSync("./resources/database/itemcounter.json"));
  const find = db.find((db) => db.id === id);
  if (find) {
    find.total += total;
    fs.writeFileSync("./resources/database/itemcounter.json", JSON.stringify(db));
    return false;
  } else {
    db.push({ id: id, nama: nama, total: total });
    fs.writeFileSync("./resources/database/itemcounter.json", JSON.stringify(db));
    return true;
  }
}

async function getUserDataById(id) {
  const db = await JSON.parse(fs.readFileSync("./resources/database/userlist.json"));
  const find = db.find((db) => db.chatId === id);
  if (find) {
    return find;
  }
  return false;
}

async function getUserDataByBankid(id) {
  const db = await JSON.parse(fs.readFileSync("./resources/database/userlist.json"));
  const find = db.find((db) => db.bankId === id);
  if (find) {
    return find;
  }
  return false;
}

function minstock(id, count) {
  dab.get("SELECT stock FROM list WHERE id = ?", id, (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }

    if (row) {
      const currentStock = row.stock;
      if (currentStock >= count) {
        const newStock = currentStock - count;
        dab.run(
          "UPDATE list SET stock = ? WHERE id = ?",
          [newStock, id],
          (updateErr) => {
            if (updateErr) {
              console.error(updateErr.message);
            } else {
              return true;
            }
          }
        );
      } else {
        return false;
      }
    } else {
      return false;
    }
  });
}
async function Additemkeluar(id, total, stok_dibeli, user, chatId) {
  const db = await JSON.parse(fs.readFileSync("./resources/database/stokkeluar.json"));
  const jamasiajakarta = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
  });
  db.push({
    id: id,
    total: total,
    stok_dibeli: stok_dibeli,
    tanggal: jamasiajakarta,
    user: user,
    chat_id: chatId,
    status: "Dropped",
  });
  fs.writeFileSync("./resources/database/stokkeluar.json", JSON.stringify(db, null, 1));
  return true;
}

const getDate = (zone) => {
  return new Date().toLocaleString("en-US", { timeZone: zone });
};

async function sendProduct(id, total, user, chatid) {
  return new Promise(async (resolve, reject) => {
    let datsd = [];
    dab.serialize(() => {
      dab.all(`SELECT * FROM stock WHERE id = ?`, [id], async (err, rows) => {
        if (err) {
          console.error(err.message);
          reject(err);
        }

        if (rows.length === 0) {
          resolve(false);
        }

        const numToSend = Math.min(total, rows.length);

        for (let i = 0; i < numToSend; i++) {
          const stock_no = rows[i].stock_no;
          const info = rows[i].info;
          minstock(id, total);
          datsd[stock_no] = info;
          console.log(info);
          dab.run(`DELETE FROM stock WHERE stock_no = ?`, [stock_no], (err) => {
            if (err) {
              console.error(err.message);
              reject(err);
            }
          });
        }

        datsd = datsd.filter(
          (item) => item !== undefined && item !== null && item !== ""
        );
        await Additemkeluar(id, total, datsd, user, chatid);
        resolve(
          datsd
            .map((item, index) => `${index + 1}. ${item.replace(/,/g, ",\n")}`)
            .join("\n")
        );
      });
    });
  });
}

async function sendProductsapi(id, total, user, chatid) {
  return new Promise(async (resolve, reject) => {
    let datsd = [];
    dab.serialize(() => {
      dab.all(`SELECT * FROM stock WHERE id = ?`, [id], async (err, rows) => {
        if (err) {
          console.error(err.message);
          reject(err);
        }

        if (rows.length === 0) {
          resolve(false);
        }

        const numToSend = Math.min(total, rows.length);

        for (let i = 0; i < numToSend; i++) {
          const stock_no = rows[i].stock_no;
          const info = rows[i].info;
          minstock(id, total);
          datsd[stock_no] = info;
          console.log(info);
          dab.run(`DELETE FROM stock WHERE stock_no = ?`, [stock_no], (err) => {
            if (err) {
              console.error(err.message);
              reject(err);
            }
          });
        }

        datsd = datsd.filter(
          (item) => item !== undefined && item !== null && item !== ""
        );
        await Additemkeluar(id, total, datsd, user, chatid);
        resolve(datsd);
      });
    });
  });
}
async function error(m) {
  const time = getTime();
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  console.log(time + " [ " + chalk.red.bold("Error") + " ] " + m);
  fs.appendFileSync("error.log", `[  ${timeString} ] ${m}\n`);
}
async function log(m) {
  const time = getTime();
  console.log(
    chalk.cyanBright.bold("LOG > ") + chalk.greenBright(`[${time}]`) + " " + m
  );
}
async function info(m) {
  const time = getTime();
  console.log(
    chalk.blueBright.bold("INFO: ") + chalk.greenBright(`[${time}]`) + " " + m
  );
}
function getTime() {
  const now = new Date();
  const timeString = chalk.magenta(now.toLocaleTimeString());
  return ` ${timeString} `;
}
async function sendcall(m, chatid) {
  await axios
    .get(
      `https://api.telegram.org/bot${
        process.env.TOKEN_BOT
      }/sendMessage?chat_id=${chatid}&text=${encodeURIComponent(m)}`
    )
    .then((d) => {
      log(m);
    });
}
module.exports = {
  addRole,
  demoteRole,
  getRole,
  TelegraPh,
  additemcount,
  addData,
  getUserDataById,
  downloadImage,
  minusSaldo,
  isRegistered,
  addSaldo,
  getUserDataByBankid,
  sendProduct,
  sendProductsapi,
  download,
  getDate,
  generateRandomUsername,
  error,
  log
};
