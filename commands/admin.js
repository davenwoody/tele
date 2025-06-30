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
const fs = require("fs");
const util = require("util");
const { getRole } = require("../resources/lib/myfunction");

module.exports = (bot, db) => {
  // Promisify db methods
  const dbGet = util.promisify(db.get).bind(db);
  const dbRun = util.promisify(db.run).bind(db);

  // Load config
  const config = JSON.parse(
    fs.readFileSync("./resources/Admin/settings.json", "utf8")
  );
  const ownerChatId = config.owner_chatid;

  // State untuk broadcast
  const bciBroad = {};
  const bulkMailStates = {};

  // ========== /drop ==========
  bot.hears(/\/drop (\d+)\s*(\d+|all)?/, async (ctx) => {
    const [ , rawId, rawQty ] = ctx.match;
    const id = parseInt(rawId, 10);
    const jumlah = rawQty === "all" ? "all" : parseInt(rawQty, 10);

    if (isNaN(id) || (jumlah !== "all" && isNaN(jumlah))) {
      return ctx.reply(
        "❌ Invalid input.\nGunakan: `/drop <id> <stock_no>` atau `/drop <id> all`",
        { parse_mode: "Markdown" }
      );
    }
    if (ctx.from.id !== Number(ownerChatId)) {
      return ctx.reply("🚫 Access Denied!");
    }

    try {
      const formatted = await sendProduct(id, jumlah, ctx.from.first_name, ctx.chat.id);
      await ctx.reply("```cart\n" + formatted + "\n```", { parse_mode: "Markdown" });
    } catch (e) {
      console.error("❌ Error processing /drop:", e);
      ctx.reply("⚠️ Terjadi kesalahan saat menghapus stok.");
    }
  });

  // ========== /editharga ==========
  bot.command("editharga", async (ctx) => {
    const chatId = ctx.chat.id;
    const input = ctx.message.text.split(" ").slice(1).join(" ").trim();
    if (!input.includes("|")) {
      return ctx.reply(
        "⚠ Format salah! Gunakan: `/editharga id|harga_baru`",
        { parse_mode: "Markdown" }
      );
    }
    const [id, priceStr] = input.split("|").map(s => s.trim());
    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      return ctx.reply(
        "⚠ Harga harus berupa angka!",
        { parse_mode: "Markdown" }
      );
    }
    if (chatId === Number(ownerChatId) || getRole(ctx.from.id) === "admin") {
      db.run(
        "UPDATE list SET price = ? WHERE id = ?",
        [price, id],
        function (err) {
          if (err) {
            console.error(err);
            return ctx.reply("❌ Error updating price.");
          }
          ctx.reply(`✅ Harga ID ${id} telah diperbarui menjadi ${price}`);
        }
      );
    } else {
      ctx.reply("🚫 Kamu tidak diizinkan untuk menggunakan perintah ini.", { parse_mode: "Markdown" });
    }
  });

  // ========== /adminmenu ==========
  bot.command("adminmenu", async (ctx) => {
    const chatId = ctx.from.id;
    if (Number(chatId) === Number(ownerChatId)) {
      const pesan = `Halo Owner,

- OWNER MENU

╭──────────✧
┊/drop
┊/bct (Broadcast Text)
┊/bci (Broadcast Image)
┊/manager
┊/delstock
┊/exportstock
┊/editsnk
┊/addstock
┊/editdesc
┊/addlist
┊/editnama
┊/editharga
╰──────────✧`;
      ctx.reply(pesan);
    } else {
      ctx.reply("🚫 Maaf, hanya admin yang dapat mengakses fitur ini! 🔐");
    }
  });

  // ========== /editsnk ==========
  bot.command("editsnk", async (ctx) => {
    const chatId = ctx.chat.id;
    const input = ctx.message.text.split(" ").slice(1).join(" ").trim();
    if (!input.includes("|")) {
      return ctx.reply(
        "⚠ Format salah! Gunakan: `/editsnk id|syarat_dan_ketentuan`",
        { parse_mode: "Markdown" }
      );
    }
    const [idStr, snk] = input.split("|").map(s => s.trim());
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return ctx.reply("⚠ ID harus berupa angka!", { parse_mode: "Markdown" });
    }
    if (chatId === Number(ownerChatId) || getRole(ctx.from.id) === "admin") {
      const dbPath = "./resources/database/snk.json";
      const data = fs.existsSync(dbPath)
        ? JSON.parse(fs.readFileSync(dbPath, "utf8"))
        : [];
      const found = data.find(item => item.id === id);
      if (found) {
        found.snk = snk;
        await ctx.reply(`✅ Syarat & Ketentuan ID ${id} diperbarui.`);
      } else {
        data.push({ id, snk });
        await ctx.reply(`✅ Syarat & Ketentuan ID ${id} ditambahkan.`);
      }
      fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } else {
      ctx.reply("🚫 Anda tidak diizinkan untuk menggunakan perintah ini! 🔐", { parse_mode: "Markdown" });
    }
  });

  // ========== /addstock (bulk) ==========
  bot.command("addstock", async (ctx) => {
    // Ambil semua teks setelah /addstock (termasuk newline)
    const raw = ctx.message.text
      .replace(/^\/addstock(@\w+)?\s*/, "")
      .trim();
    if (!raw) {
      return ctx.reply(
        "❌ Format salah!\n" +
        "Gunakan:\n" +
        "/addstock <id>|<info>|<days>[, <id2>|<info2>|<days2> …]\n" +
        "atau per baris:\n" +
        "/addstock\n1|abc|30\n2|def|60",
        { parse_mode: "Markdown" }
      );
    }

    // Pecah entri berdasarkan newline atau koma
    const entries = raw
      .split(/[\r\n,]+/)
      .map(e => e.trim())
      .filter(Boolean);

    let success = 0;
    const errors = [];

    for (const entry of entries) {
      const parts = entry.split("|").map(s => s.trim());
      if (parts.length !== 3) {
        errors.push(`❌ Format salah di "${entry}" — harus id|info|days`);
        continue;
      }
      const [id, info, daysStr] = parts;
      const days = parseInt(daysStr, 10);
      if (isNaN(days)) {
        errors.push(`❌ Nilai hari tidak valid di "${entry}"`);
        continue;
      }

      // Hitung expired_at
      const expiredAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      const expiredSql = expiredAt.toISOString().slice(0, 19).replace("T", " ");

      try {
        const row = await dbGet("SELECT 1 FROM list WHERE id = ?", [id]);
        if (!row) {
          errors.push(`❌ ID tidak ditemukan: ${id}`);
          continue;
        }
        await dbRun(
          "INSERT INTO stock (id, info, expired_at) VALUES (?, ?, ?)",
          [id, info, expiredSql]
        );
        success++;
      } catch (err) {
        console.error("addstock error:", err);
        errors.push(`⚠️ Gagal ID ${id}: ${err.message}`);
      }
    }

    let reply = `✅ Berhasil menambahkan ${success} item.`;
    if (errors.length) reply += "\n" + errors.join("\n");
    return ctx.reply(reply);
  });

  // ========== /bci (broadcast image) ==========
  bot.command("bci", async (ctx) => {
    const chatId = ctx.from.id;
    const isPromoter = getRole(chatId) === "promoter";
    if (chatId !== Number(ownerChatId) && !isPromoter) {
      return ctx.reply("❌ *No Permission*", { parse_mode: "Markdown" });
    }
    bciBroad[chatId] = true;
    ctx.reply("Silahkan kirimkan Gambar dan Caption yang diinginkan.");
  });

  // ========== /bct (broadcast text) ==========
  bot.command("bct", async (ctx) => {
    const chatId = ctx.chat.id;
    const isPromoter = getRole(chatId) === "promoter";
    if (chatId !== Number(ownerChatId) && !isPromoter) {
      return ctx.reply("❌ *No Permission*", { parse_mode: "Markdown" });
    }
    const text = ctx.message.text.split(" ").slice(1).join(" ").trim();
    if (!text) {
      return ctx.reply("❌ *Format salah!*\nGunakan: `/bct [pesan]`", { parse_mode: "Markdown" });
    }
    let userList;
    try {
      userList = JSON.parse(
        fs.readFileSync("./resources/database/userlist.json", "utf8")
      );
    } catch (e) {
      console.error(e);
      return ctx.reply("❌ Gagal membaca daftar user.", { parse_mode: "Markdown" });
    }
    ctx.reply("⏳ *Sedang Proses Mengirim...*", { parse_mode: "Markdown" });
    let s=0, f=0;
    userList.forEach((u,i) => {
      setTimeout(() => {
        bot.telegram
          .sendMessage(u.chatId, text, { parse_mode: "Markdown" })
          .then(() => s++)
          .catch(() => f++);
      }, i * 500);
    });
    setTimeout(() => {
      bot.telegram.sendMessage(
        ownerChatId,
        `✅ BROADCAST SELESAI\nTotal: ${userList.length}\n✔️ ${s}\n✖️ ${f}`,
        { parse_mode: "Markdown" }
      );
    }, userList.length * 500 + 500);
  });

  // ========== menangani photo untuk /bci ==========
  bot.on("photo", async (ctx) => {
    if (!bciBroad[ctx.from.id]) return;
    const chatId = ctx.from.id;
    const isPromoter = getRole(chatId) === "promoter";
    if (chatId !== Number(ownerChatId) && !isPromoter) return;

    const photoId = ctx.message.photo.slice(-1)[0].file_id;
    const caption = ctx.message.caption || "";
    const userList = JSON.parse(
      fs.readFileSync("./resources/database/userlist.json", "utf8")
    );
    ctx.reply("⏳ *Mengirim Gambar ke semua user...*", { parse_mode: "Markdown" });
    userList.forEach((u,i) => {
      setTimeout(() => {
        bot.telegram.sendPhoto(u.chatId, photoId, {
          caption,
          parse_mode: "Markdown",
        });
      }, i * 500);
    });
    delete bciBroad[ctx.from.id];
  });

  // ========== /editdesc ==========
  bot.command("editdesc", async (ctx) => {
    const [ , rest ] = ctx.message.text.split(" ").slice(1).join(" ").split("|");
    const [id, desc] = rest ? rest.split("|").map(s => s.trim()) : [];
    if (!id || !desc) {
      return ctx.reply(
        "⚠ Format salah! Gunakan: `/editdesc id|deskripsi`",
        { parse_mode: "Markdown" }
      );
    }
    if (ctx.from.id !== Number(ownerChatId) && getRole(ctx.from.id) !== "admin") {
      return ctx.reply("🚫 Anda tidak punya izin!", { parse_mode: "Markdown" });
    }
    const path = "./resources/database/produk.json";
    let data = fs.existsSync(path)
      ? JSON.parse(fs.readFileSync(path, "utf8"))
      : [];
    const idx = data.findIndex(p => p.produkId === id);
    if (idx < 0) {
      return ctx.reply(`❌ Produk ID ${id} tidak ditemukan.`);
    }
    data[idx].produkDeskripsi = desc;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    ctx.reply(`✅ Deskripsi ID ${id} diperbarui.`);
  });

  // ========== /addlist ==========
  bot.command("addlist", async (ctx) => {
    const chatId = ctx.chat.id;
    if (chatId !== Number(ownerChatId) && getRole(ctx.from.id) !== "admin") {
      return ctx.reply("🚫 Anda tidak punya izin!");
    }
    const input = ctx.message.text.split(" ").slice(1).join(" ");
    if (!input.includes("|")) {
      return ctx.reply("⚠️ Format: /addlist nama|harga|categoryId");
    }
    const [name, priceStr, catId] = input.split("|").map(s => s.trim());
    const price = parseFloat(priceStr);
    if (!name || isNaN(price) || !catId) {
      return ctx.reply("⚠️ Format salah!");
    }
    db.get("SELECT COUNT(*) AS c FROM list", (e,row) => {
      const newId = row.c + 1;
      db.run(
        "INSERT INTO list (nameproduct, price, category) VALUES (?,?,?)",
        [name, price, catId],
        err => {
          if (err) return ctx.reply("❌ Gagal menambah item.");
          ctx.reply(
            `✅ Item ditambahkan!\nID: ${newId}\nProduk: ${name}\nHarga: ${price}\nKategori: ${catId}`
          );
        }
      );
    });
  });

  // ========== /editnama ==========
  bot.command("editnama", async (ctx) => {
    const chatId = ctx.chat.id;
    const [id, newName] = ctx.message.text.split(" ").slice(1).join(" ").split("|").map(s => s.trim());
    if (!id || !newName) {
      return ctx.reply("⚠ Format: /editnama id\\|nama\\_baru", { parse_mode: "MarkdownV2" });
    }
    if (chatId !== Number(ownerChatId) && getRole(ctx.from.id) !== "admin") {
      return ctx.reply("🚫 Anda tidak punya izin!", { parse_mode: "MarkdownV2" });
    }
    db.run(
      "UPDATE list SET nameproduct = ? WHERE id = ?",
      [newName, id],
      function (e) {
        if (e) return ctx.reply("❌ Gagal mengganti nama.");
        ctx.reply(`✅ Nama ID ${id} diganti menjadi ${newName}`);
      }
    );
  });

  // ========== exportstock tombol produk ==========
  bot.command("exportstock", async (ctx) => {
    const chatId = ctx.chat.id;
    if (chatId !== Number(ownerChatId) && getRole(ctx.from.id) !== "admin") {
      return ctx.reply("❌ Anda tidak punya izin!");
    }
    db.all("SELECT id, nameproduct FROM list", async (e, rows) => {
      if (e) return ctx.reply("❌ Gagal mengambil data.");
      if (!rows.length) return ctx.reply("📭 Daftar produk kosong.");
      const kb = {
        inline_keyboard: rows.map(r => [
          { text: `${r.id}. ${r.nameproduct}`, callback_data: `product_${r.id}_${r.nameproduct}` }
        ])
      };
      await ctx.reply("📦 Pilih produk untuk export:", { reply_markup: kb });
    });
  });

  bot.action(/product_(\d+)_(.+)/, async (ctx) => {
    const [, pid, pname] = ctx.match;
    await ctx.deleteMessage();
    ctx.reply("⏳ Loading stock…");
    db.all("SELECT stock_no, info FROM stock WHERE id = ?", [pid], (e, rows) => {
      if (e) return ctx.reply("❌ Gagal ambil stok.");
      if (!rows.length) return ctx.reply("❌ Stok tidak tersedia.");
      const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta", hour12: false });
      let text = `📦 ${config.store_name}\n🆔 ${pid}\n📝 ${pname}\n📅 ${now}\n\n`;
      text += rows.map(r => `ID: ${r.stock_no}\nInfo: ${r.info}\n─────`).join("\n\n");
      const pathOut = `resources/database/stock_${pid}.txt`;
      fs.writeFileSync(pathOut, text);
      ctx.replyWithDocument({ source: pathOut }, { caption: "📄 File stok" });
    });
  });

  // ========== /delstock ==========
  bot.command("delstock", async (ctx) => {
    const [ , idStr, stockNo ] = ctx.message.text.split(" ");
    const id = parseInt(idStr, 10);
    if (isNaN(id) || (!["all"].includes(stockNo) && isNaN(parseInt(stockNo, 10)))) {
      return ctx.reply("❌ Format: /delstock <id> <stock_no>|all");
    }
    const chatId = ctx.chat.id;
    if (chatId !== Number(ownerChatId) && getRole(ctx.from.id) !== "admin") {
      return ctx.reply("❌ Anda tidak punya izin!");
    }
    if (stockNo === "all") {
      db.run("DELETE FROM stock WHERE id = ?", [id]);
      db.run("UPDATE list SET stock = 0 WHERE id = ?", [id]);
      ctx.reply(`✅ Semua stok ID ${id} dihapus.`);
    } else {
      const sNo = parseInt(stockNo, 10);
      db.run("DELETE FROM stock WHERE id = ? AND stock_no = ?", [id, sNo], function (e) {
        if (e) return ctx.reply("❌ Gagal hapus stok.");
        if (this.changes) {
          minstock(id, 1);
          ctx.reply(`✅ Stok nomor ${sNo} ID ${id} dihapus.`);
        } else {
          ctx.reply("⚠️ Data tidak ditemukan.");
        }
      });
    }
  });

  function minstock(id, count) {
    db.get("SELECT stock FROM list WHERE id = ?", [id], (e, row) => {
      if (e || !row) return;
      const ns = row.stock - count;
      if (ns >= 0) db.run("UPDATE list SET stock = ? WHERE id = ?", [ns, id]);
    });
  }

  // ========== Text listener untuk bulkMailStates ==========
  bot.on("text", async (ctx, next) => {
    const st = bulkMailStates[ctx.chat.id];
    if (!st) return next();
    if (ctx.message.text === "❌ Cancel") {
      delete bulkMailStates[ctx.chat.id];
      return ctx.reply("❌ Canceled.");
    }
    if (ctx.message.text === "✅ Done") {
      ctx.reply("📤 Saving data...");
      let idx = 0;
      (function insert() {
        if (idx >= st.emails.length) {
          ctx.reply("✅ All data saved!");
          sendStockNotification(st.id, st.emails.length);
          delete bulkMailStates[ctx.chat.id];
          return;
        }
        const email = st.emails[idx++];
        db.get(
          "SELECT COUNT(*) AS c FROM stock WHERE info = ?",
          [email],
          (e, row) => {
            if (!row.c) {
              db.run("INSERT INTO stock (id, info) VALUES (?,?)", [st.id, email]);
            }
            setImmediate(insert);
          }
        );
      })();
      return;
    }
    // Otherwise treat each line as stock info
    ctx.message.text.split("\n").forEach(l => {
      if (l.trim()) st.emails.push(l.trim());
    });
    ctx.reply("📩 Stok ditambahkan. Ketik ‘✅ Done’ jika selesai.");
  });

  function sendStockNotification(productId, total) {
    if (process.env.ENABLE_NOTIFICATION_STOCK !== "true") return;
    db.get("SELECT nameproduct FROM list WHERE id = ?", [productId], (e, row) => {
      const nm = row ? row.nameproduct : "Unknown";
      const txt =
        `📦 *Stok Baru Ditemukan*\n\n` +
        `• *Produk* : ${nm}\n` +
        `• *ID* : ${productId}\n` +
        `• *Total Ditambah* : ${total}\n\n` +
        `🚀 Segera checkout!`;
      bot.telegram.sendMessage(ownerChatId, txt, { parse_mode: "Markdown" });
    });
  }
};
