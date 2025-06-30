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
const { Markup } = require('telegraf')
const axios = require('axios')
const { getRole } = require('../resources/lib/myfunction');
const fs = require('fs')
const bulkMailStates = {};
let variasi = {};
let sesiyfy = {};
let sesiyfy2 = {};
let sesiyfy3 = {};
const uuid = require("uuid");
const states = {};
const itemsPerPage = 10;
const escapeMarkdown = (text) => {
return text.replace(/[_\[\]()~`>#\+=|{}.!-]/g, "\\$&");
};
async function genuuid() {
  return uuid.v4();
}
module.exports = (bot, db) => {
	const config = JSON.parse(fs.readFileSync('./resources/Admin/settings.json'))
  
    const ownerChatId = config.owner_chatid;
bot.command('manager', (ctx) => {
    const chatId = ctx.chat.id;
	const ownerId = config.owner_chatid
    if (chatId.toString() === config.owner_chatid) { 
        ctx.reply('Pilih opsi pengaturan yang ingin kamu lakukan', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Produk Manager", callback_data: "cad_backin" }],
					[{ text: "varian Manager", callback_data: "cad_varian" }],
                    [{ text: ".conf Editor", callback_data: "edit_config" }]
                ]
            }
        });
    } else {
        ctx.reply('🚫 Maaf, hanya admin yang dapat mengakses fitur ini! 🔐');
    }
});

bot.action('cad_add', (ctx) => {
    sesiyfy[ctx.chat.id] = { status: 'step_1' };
    ctx.editMessageText('Silahkan masukkan nama Produk Dan Deskripsi yang ingin ditambahkan Contoh\nNAMAPRODUK|DESKRIPSI');
});
bot.action(/cad_info_(.+)/, async (ctx) => {
    const produkId = ctx.match[1];
    const sheet = fs.readFileSync('./resources/database/produk.json', 'utf8');
    const categories = JSON.parse(sheet);
    const produk = categories.find((produk) => produk.produkId === produkId);

    if (!produk) {
        return ctx.answerCbQuery('Produk tidak ditemukan');
    }

    ctx.editMessageText(`Apa Yang Ingin kamu lakukan kepada Produk ini?\n\n*produkName:* \`${produk.produkName}\`\n*produkId:* \`${produk.produkId}\`\n*produkXuid:* \`${produk.produkXuid}\``, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [{ text: "Edit Nama", callback_data: `cad_edit_${produk.produkId}` }, { text: "Hapus Produk", callback_data: `cad_del_${produk.produkId}` }],
                [{ text: "Kembali", callback_data: `cad_backin` }]
            ]
        }
    });
});

bot.action(/cad_edit_(.+)/, (ctx) => {
    const produkId = ctx.match[1];
    sesiyfy[ctx.chat.id] = { status: 'edit', produkId: produkId };
    ctx.editMessageText('Silahkan masukkan nama Produk yang baru');
});

bot.action(/cad_del_(.+)/, (ctx) => {
    const produkId = ctx.match[1];
    const dbread = fs.readFileSync('./resources/database/produk.json', 'utf8');
    const categories = JSON.parse(dbread);
    const index = categories.findIndex((produk) => produk.produkId === produkId);

    if (index === -1) {
        return ctx.editMessageText('Produk tidak ditemukan', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Kembali", callback_data: `cad_backin` }]
                ]
            }
        });
    }

    categories.splice(index, 1);
    fs.writeFileSync('./resources/database/produk.json', JSON.stringify(categories, null, 2), 'utf8');

    ctx.editMessageText('Produk berhasil dihapus', {
        reply_markup: {
            inline_keyboard: [
                [{ text: "Kembali", callback_data: `cad_backin` }]
            ]
        }
    });
});
bot.action('cad_varian', (ctx) => {
    db.all(`SELECT id, category, nameproduct, price, stock FROM list ORDER BY category`, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return ctx.reply('⚠️ Gagal mengambil data produk, coba lagi nanti!');
        }
        
        let inlineButtons = [];
        let groupedProducts = {};

        if (rows.length === 0) {
            inlineButtons.push([{ text: '➕ Tambah varian', callback_data: 'cad_add_varian' }]);
            ctx.editMessageText('-', {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: inlineButtons }
            });
            return;
        }
        rows.forEach((row) => {
            if (!groupedProducts[row.category]) {
                groupedProducts[row.category] = [];
            }
            groupedProducts[row.category].push({ 
                id: row.id, 
                name: row.nameproduct,
                price: row.price,
                stock: row.stock
            });
        });

        let response = `📦 *Daftar Varian :*\n\n`;

        for (let category in groupedProducts) {
            response += `╭─────────────────✧\n`;
            response += `┊・ *Produk :* ${category}\n`;
            response += `┊・ *Varian :*\n`;

            let categoryButtons = [];
            groupedProducts[category].forEach((product) => {
                response += `┊・ [${product.id}] ${product.name}: Rp. ${product.price.toLocaleString()} - Stock : ${product.stock ?? 0}\n`;

                categoryButtons.push({
                    text: `${product.name}`,
                    callback_data: `varian_${product.id}`
                });

                if (categoryButtons.length === 2) {
                    inlineButtons.push(categoryButtons);
                    categoryButtons = [];
                }
            });

            if (categoryButtons.length > 0) {
                inlineButtons.push(categoryButtons);
            }

            response += `╰─────────────────✧\n\n`;
        }

        inlineButtons.push([{ text: '➕ Tambah varian', callback_data: 'cad_add_varian' }]);

        ctx.editMessageText(response, {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: inlineButtons }
        });
    });
});

bot.action(/^varian_(\d+)$/, (ctx) => {
    const varianId = ctx.match[1];
    ctx.editMessageText("🔧 *Kelola Varian:*", {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "➕ Add Stock", callback_data: `add_stock_${varianId}` },
                    { text: "📦 Add Stock Multi", callback_data: `add_stock_multi_${varianId}` }
                ],
                [{text: "Delete Varian", callback_data: `delete_varian_${varianId}`}, {text: "Edit Harga", callback_data: `edit_harga_${varianId}`}],  
                [{ text: "⬅ Kembali", callback_data: "cad_varian" }]
            ]
        }
    });
});
bot.action(/^edit_harga_(\d+)$/, (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const id = ctx.match[1]
    if (chatId != ownerChatId && getRole(userId) !== "admin") {
        return ctx.reply('🚫 Kamu tidak diizinkan untuk menjalankan perintah ini.', { parse_mode: "Markdown" });
    }
    sesiyfy3[userId] = {
        id: id,
        price: 0,
        step: 'step1'
    }
    ctx.editMessageText(escapeMarkdown('Silahkan Kirimkan Harga Baru'), {
        parse_mode: "MarkdownV2",
    })
    
})
bot.action(/^delete_varian_(\d+)$/, async (ctx) => {
    const varianId = ctx.match[1];

    db.get('SELECT * FROM list WHERE id = ?', [varianId], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return ctx.reply('❌ Terjadi kesalahan saat menghapus varian.');
        }

        if (!row) {
            return ctx.reply(
                `❌ Varian dengan ID ${varianId} tidak ditemukan.`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '➕ Tambah varian', callback_data: 'cad_add_varian' }]
                        ]
                    }
                }
            );
        }

        db.run('DELETE FROM list WHERE id = ?', [varianId], (deleteErr) => {
            if (deleteErr) {
                console.error('Database error:', deleteErr);
                return ctx.reply('❌ Terjadi kesalahan saat menghapus varian.');
            }

            db.all('SELECT * FROM list ORDER BY category', [], (err, rows) => {
                if (err) {
                    console.error('Database error:', err);
                    return ctx.reply('⚠️ Gagal mengambil data varian setelah dihapus.');
                }

                let response = `✅ Varian dengan ID ${varianId} berhasil dihapus.\n\n📌 *Daftar varian diperbarui:*\n\n`;
                let inlineButtons = [];

                if (rows.length === 0) {
                    response += `⚠️ Tidak ada varian yang tersedia.\n`;
                } else {
                    let groupedVariants = {};
                    rows.forEach((row) => {
                        if (!groupedVariants[row.category]) {
                            groupedVariants[row.category] = [];
                        }
                        groupedVariants[row.category].push({ id: row.id, name: row.nameproduct });
                    });

                    for (let category in groupedVariants) {
                        response += `╭─────────────────✧\n`;
                        response += `┊・ *Category :* ${category}\n`;
                        response += `┊・ *Varian :*\n`;

                        let categoryButtons = [];
                        groupedVariants[category].forEach((varian, index) => {
                            response += `┊・  ${index + 1}. ${varian.name}\n`;

                            categoryButtons.push({
                                text: `🗑 Hapus ${varian.name}`,
                                callback_data: `delete_varian_${varian.id}`
                            });

                            if (categoryButtons.length === 2) {
                                inlineButtons.push(categoryButtons);
                                categoryButtons = [];
                            }
                        });

                        if (categoryButtons.length > 0) {
                            inlineButtons.push(categoryButtons);
                        }

                        response += `╰─────────────────✧\n\n`;
                    }
                }

                // Tambahkan tombol "Tambah Varian" agar tidak hilang
                inlineButtons.push([{ text: '➕ Tambah varian', callback_data: 'cad_add_varian' }]);

                ctx.editMessageText(response, {
                    parse_mode: "Markdown",
                    reply_markup: { inline_keyboard: inlineButtons }
                });
            });
        });
    });
});





// Fungsi untuk memperbarui daftar varian di memori
function updateStockList() {
    db.all("SELECT * FROM stock", [], (err, rows) => {
        if (!err) {
            stockList = rows; // Perbarui daftar dalam memori
            console.log("📌 Daftar varian diperbarui:", stockList);
        }
    });
}

// Handler untuk Add Stock
bot.action(/^add_stock_(\d+)$/, async (ctx) => {
    const varianId = ctx.match[1];
    variasi[ctx.chat.id] = {
        varianId: varianId,
        step: 'step1',
        methode: ''
    }
        ctx.answerCbQuery(`📝 Kirim stok yang ingin ditambahkan untuk varian ID: ${varianId}`, { show_alert: true });
        await ctx.deleteMessage();
    variasi[ctx.from.id].methode = '1'
});

bot.action(/^add_stock_multi_(\d+)$/, (ctx) => {
    const id = ctx.match[1];
    const chatId = ctx.from.id
    if (chatId == ownerChatId || getRole(ctx.from.id) == "admin") {
        ctx.reply(`Bulk Stock Session Created with id *${id}*\n\nKirim info stokmu ke dalam chat maka akan kami tambahkan otomatis!`, {
            parse_mode: "Markdown",
            reply_markup: {
                keyboard: [
                    [{ text: "✅ Done" }, { text: "❌ Cancel" }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        bulkMailStates[chatId] = {
            state: "stock",
            emails: [],
            id: id
        };
    } else {
        ctx.reply("❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
    }
});

bot.action('cad_add_varian', (ctx) => {
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    const config = JSON.parse(fs.readFileSync('./resources/Admin/settings.json'))
    const ownerChatId = config.owner_chatid;

    if (chatId == ownerChatId || getRole(userId) === "admin") {
        sesiyfy2[ctx.chat.id] = { status: 'step_1' };

        // Menampilkan pesan dengan tombol "Batal"
        ctx.editMessageText(
            'Silahkan Kirimkan Format:\n\n`Namavarian|harga|idProduk`',
            {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "❌ Batal", callback_data: "cad_cancel_varian" }]
                    ]
                }
            }
        );
    } else {
        ctx.answerCbQuery("❌ Akses ditolak!", {
            show_alert: true,
        });
    }
});

// Handle tombol batal
bot.action('cad_cancel_varian', async (ctx) => {
    const chatId = ctx.chat.id;
    delete sesiyfy2[chatId]; // Hapus sesi yang sedang berlangsung

    try {
        await ctx.deleteMessage(); // Hapus pesan yang menampilkan form
        ctx.answerCbQuery("✅ Penambahan varian dibatalkan.");
    } catch (error) {
        console.error("Gagal menghapus pesan:", error);
    }
});
bot.action('cad_backin', (ctx) => {
    const read = fs.readFileSync('./resources/database/produk.json', 'utf8');
    const categories = JSON.parse(read);
    let inlineKeyboard = [];
    let row = [];
    let count = 0;
    categories.forEach((produk) => {
        row.push({ text: produk.produkName, callback_data: `cad_info_${produk.produkId}` });
        count++;
        if (count === 3) {
            inlineKeyboard.push(row);
            row = [];
            count = 0;
        }
    });
    if (row.length > 0) {
        inlineKeyboard.push(row);
    }
    inlineKeyboard.push([{ text: '➕ Tambah Produk', callback_data: 'cad_add' }]);

    ctx.editMessageText(`Selamat Datang di produk Manager\nSilahkan Pilih Opsi Button dibawah ini`, {
        reply_markup: {
            inline_keyboard: inlineKeyboard
        }
    });
});
bot.on("document", async (ctx) => {
    const chatId = ctx.from.id;
    const file = ctx.message.document;

    // Cek apakah file adalah .txt
    if (!file.file_name.endsWith(".txt")) {
        return ctx.reply("❌ Hanya bisa menerima file .txt!");
    }

    // Dapatkan URL file dari Telegram
    const fileUrl = await ctx.telegram.getFileLink(file.file_id);

    try {
        // Download file
        const response = await axios.get(fileUrl.href);
        const fileContent = response.data;

        // Parsing isi file
        const lines = fileContent.split("\n").map(line => line.trim()).filter(line => line !== "");

        if (!bulkMailStates[chatId]) {
            bulkMailStates[chatId] = { state: "stock", emails: [] };
        }
        const currentState = bulkMailStates[chatId];

        lines.forEach((line) => {
            const parts = line.split("|");

            if (parts.length < 3) {
                ctx.reply(`⚠️ Format salah: ${line}`);
                return;
            }

            const email = parts[0]; // Email pertama
            const password = parts.slice(1, -1).join("|"); // Gabungkan password jika ada "|"
            const expired = parts[parts.length - 1]; // Bagian terakhir sebagai expired

            // Gabungkan menjadi string dengan format: email|password|expired
            currentState.emails.push(`${email}|${password}|${expired}`);
        });

        ctx.reply(`📩 ${currentState.emails.length} stok berhasil ditambahkan. Ketik '✅ Done' jika sudah selesai.`);
    } catch (error) {
        console.error("Error downloading file:", error.message);
        ctx.reply("❌ Gagal mengunduh file.");
    }
});
bot.on('message', async (ctx, next) => {
    const chatId = ctx.from.id;
    const text = ctx.message.text;
    const currentState = bulkMailStates[chatId];
    const messageText = ctx.message.text;
    if (currentState && currentState.state === "stock") {
        if (messageText === "❌ Cancel") {
            delete bulkMailStates[chatId];
            return ctx.reply("❌ Canceled.");
        }
  
       if (messageText === "✅ Done") {
            currentState.state = "posting";
            ctx.reply("📤 Saving data...");
        
            const emails = currentState.emails;
            let index = 0;
            let successCount = 0;
            let failedCount = 0;
        
            function insertEmail() {
                if (index < emails.length) {
                    const emailData = emails[index];
                    const [email, password, expiredMinutes] = emailData.split("|").map((item) => item.trim());
                    
                    const expiredAt = new Date();
                    expiredAt.setDate(expiredAt.getDate() + parseInt(expiredMinutes)); // Menambahkan expiredMinutes ke tanggal
        
                    const info = `${email}|${password}`;
        
                    db.get("SELECT COUNT(*) AS count FROM stock WHERE info = ?", [info], (err, row) => {
                        if (err) {
                            console.error("Error checking existing values:", err.message);
                            failedCount++;  // Jika error, dianggap gagal
                            index++;
                            setTimeout(insertEmail, 0);
                            return;
                        }
        
                        if (row.count === 0) {
                            db.run(
                                "INSERT INTO stock (id, info, expired_at) VALUES (?, ?, ?)",
                                [currentState.id, info, expiredAt.toISOString().slice(0, 19).replace("T", " ")],  // Format expiredAt
                                (err) => {
                                    if (err) {
                                        console.error(`Error saving ${email}:`, err.message);
                                        failedCount++;  // Jika ada error saat menyimpan, dianggap gagal
                                        ctx.reply(`⚠️ Error saving ${email}: ${err.message}`);
                                    } else {
                                        console.log(`✅ Saving stock: ${info} expired at: ${expiredAt}`);
                                        successCount++;  // Jika berhasil, increment success count
                                        addstock(currentState.id, 1);
                                    }
                                    index++;
                                    setTimeout(insertEmail, 0);  // Melanjutkan ke data berikutnya
                                }
                            );
                        } else {
                            console.log(`⏳ Stock ${info} already exists.`);  // Jika sudah ada di database
                            failedCount++;  // Jika sudah ada, dianggap gagal
                            index++;
                            setTimeout(insertEmail, 0);  // Melanjutkan ke data berikutnya
                        }
                    });
                } else {
                    // Setelah semua email diproses, kirimkan ringkasan hasil
                    ctx.reply(
                        `✅ STOCK BERHASIL DITAMBAHKAN ✅\nVARIAN: spo1b\n📦 BERHASIL: ${successCount} | ❌ GAGAL: ${failedCount}\n🕒 EXPIRE: ${parseInt(emails[0].split("|")[2])} HARI (${new Date().setDate(new Date().getDate() + parseInt(emails[0].split("|")[2]))})`
                    );
                    sendProduct(ctx);  // Kirim produk setelah stok ditambahkan
                    sendStockNotification(currentState.id, emails.length);  // Kirim notifikasi stok
                    delete bulkMailStates[chatId];  // Hapus state setelah selesai
                }
            }
        
            insertEmail();  
        } else {
            // Jika pesan bukan "✅ Done", simpan email dari teks
            const lines = messageText.split("\n");
            lines.forEach((line) => {
                if (line.trim() !== "") {
                    currentState.emails.push(line.trim());
                }
            });
        
            ctx.reply("📩 Stok ditambahkan. Ketik '✅ Done' jika sudah selesai.");
        }
    }
    
    if (variasi[chatId]) {
        if (variasi[chatId].methode == '1') {
        const info = ctx.message.text;
        const id = variasi[chatId].varianId;
        
        if (chatId == ownerChatId || getRole(ctx.from.id) == "admin") {
            db.get("SELECT * FROM list WHERE id = ?", [id], (err, row) => {
                if (err) {
                    console.error(err);
                    return ctx.reply('Terjadi kesalahan dalam database.');
                }
                if (row) {
                    db.run("INSERT INTO stock (id, info) VALUES (?, ?)", [id, info], (err) => {
                        if (err) {
                            console.error('Database error:', err);
                            return ctx.reply('Terjadi kesalahan saat menambahkan item.');
                        }
                        ctx.reply(`✅ Item berhasil ditambahkan\n\n*ID:* ${id}\n*Stock:*\n${info}`, { parse_mode: "Markdown" });
                    });
                } else {
                    ctx.reply('ID tidak ditemukan dalam daftar. Akses ditolak.');
                }
            });
            delete variasi[chatId]
        }
        } else {
            ctx.reply('Akses ditolak.');
        }
    }
    if (sesiyfy3[chatId]) {
        const price = ctx.message.text;
        const id = sesiyfy3[chatId].id;
        const userId = ctx.from.id;
        if (sesiyfy3[chatId].step === 'step1') {
            if (userId != ownerChatId && getRole(userId) !== "admin") {
                console.log(sesiyfy3[userId])
                return ctx.reply('🚫 Kamu tidak diizinkan untuk menjalankan perintah ini.', { parse_mode: "Markdown" });
            }
            
            db.run('UPDATE list SET price = ? WHERE id = ?', [price, id], function (err) {
                if (err) {
                    console.error('Database error:', err);
                    return ctx.reply('❌ Terjadi kesalahan saat mengupdate harga.');
                }
                ctx.reply(`✅ Harga untuk ID *${id}* telah diperbarui menjadi *Rp ${parseInt(price).toLocaleString()}*`, { parse_mode: "Markdown", reply_markup: { inline_keyboard: [[{ text: '🔙 Kembali', callback_data: 'cad_varian' }]] } });
            });
        }
        delete sesiyfy3[chatId];
    }
    if (sesiyfy2[chatId]) {
        if (sesiyfy2[chatId].status === 'step_1') {
            const parts = text.split('|');
            if (parts.length !== 3) {
                return ctx.reply(
                    'Silahkan Kirimkan Format:\n\n`Namavarian|harga|idProduk`',
                    {
                        parse_mode: "Markdown",
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "❌ Batal", callback_data: "cad_cancel_varian" }]
                            ]
                        }
                    }
                );
            }
    
            const varianName = parts[0].trim();
            const varianHarga = parseFloat(parts[1].trim());
            const idProduk = parts[2].trim();
    
            if (!varianName || isNaN(varianHarga) || varianHarga <= 0 || !idProduk) {
                return ctx.reply('⚠️ Masukkan format yang valid! Contoh: Spotify 1 Bulan|10000|canva');
            }
    
            const productData = JSON.parse(fs.readFileSync('./resources/database/produk.json', 'utf8'));
            const productExists = productData.some(prod => String(prod.produkId) === idProduk);
    
            if (!productExists) {
                return ctx.reply('⚠️ Produk tidak ditemukan! Pastikan ID produk sesuai dengan yang ada di sistem.');
            }
    
            db.get('SELECT COUNT(*) AS count FROM list', (err, row) => {
                if (err) {
                    console.error('Database error:', err);
                    return ctx.reply('❌ Terjadi kesalahan saat menambahkan item.');
                }
    
                const newId = row.count + 1;
                const stmt = db.prepare('INSERT INTO list (nameproduct, price, category) VALUES (?, ?, ?)');
                stmt.run(varianName, varianHarga, idProduk, async (err) => {
                    if (err) {
                        console.error('Database error:', err);
                        return ctx.reply('❌ Terjadi kesalahan saat menambahkan item.');
                    }
    
                    await ctx.reply(`✅ Item berhasil ditambahkan !
    🆔 ID : ${newId}
    📦 Produk : ${varianName}
    💰 Harga: Rp. ${varianHarga.toLocaleString()}
    📂 Produk ID : ${idProduk}`);
    
                    delete sesiyfy2[chatId]
                    sendVarianList(ctx);
                });
                stmt.finalize();
            });
        }
    }
    
    /**
     * Fungsi untuk menampilkan daftar varian produk tanpa stock
     */
    function sendVarianList(ctx) {
        db.all(`SELECT id, category, nameproduct, price FROM list ORDER BY category`, [], (err, rows) => {
            if (err) {
                console.error('Database error:', err);
                return ctx.reply('⚠️ Gagal mengambil data produk, coba lagi nanti!');
            }
    
            let inlineButtons = [];
            let groupedProducts = {};
    
            if (rows.length === 0) {
                inlineButtons.push([{ text: '➕ Tambah varian', callback_data: 'cad_add_varian' }]);
                ctx.reply('-', {
                    parse_mode: "Markdown",
                    reply_markup: { inline_keyboard: inlineButtons }
                });
                return;
            }
    
            let response = `📦 *Daftar Varian:*\n\n`;
    
            rows.forEach((row) => {
                if (!groupedProducts[row.category]) {
                    groupedProducts[row.category] = [];
                }
                groupedProducts[row.category].push({
                    id: row.id,
                    name: row.nameproduct,
                    price: row.price
                });
            });
    
            for (let category in groupedProducts) {
                response += `╭─────────────────✧\n`;
                response += `┊・ *Produk :* ${category}\n`;
                response += `┊・ *Varian :*\n`;
    
                let categoryButtons = [];
                groupedProducts[category].forEach((product) => {
                    response += `┊・ [${product.id}] ${product.name}: Rp. ${product.price.toLocaleString()}\n`;
                    categoryButtons.push({
                        text: `${product.name}`,
                        callback_data: `varian_${product.id}`
                    });
    
                    if (categoryButtons.length === 2) {
                        inlineButtons.push(categoryButtons);
                        categoryButtons = [];
                    }
                });
    
                if (categoryButtons.length > 0) {
                    inlineButtons.push(categoryButtons);
                }
    
                response += `╰─────────────────✧\n\n`;
            }
    
            inlineButtons.push([{ text: '➕ Tambah varian', callback_data: 'cad_add_varian' }]);
    
            ctx.reply(response, {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: inlineButtons }
            });
        });
    }
    
    
    if (sesiyfy[chatId]) {
        if (sesiyfy[chatId].status === 'step_1') {
            const parts = text.split('|');

            if (parts.length < 2) {
                return ctx.reply('⚠️ Format salah! Gunakan format:\n\n*NamaProduk|DeskripsiProduk*');
            }

            const produkName = parts[0].trim();
            const produkDeskripsi = parts.slice(1).join('|').trim(); // Jika ada lebih dari 1 "|", tetap digabung

            sesiyfy[chatId] = { produkname: produkName, produkDeskripsi, status: 'step_2' };
            ctx.reply(`✅ Nama: *${produkName}*\n📖 Deskripsi : *${produkDeskripsi}*\n\nSilakan masukkan ID Produk yang ingin ditambahkan.`);
        } 
        else if (sesiyfy[chatId].status === 'step_2') {
            const formattedprodukId = text.toLowerCase().replace(/\s+/g, '_');
            sesiyfy[chatId] = { ...sesiyfy[chatId], produkid: formattedprodukId };

            const xuiddata = await genuuid();

            fs.readFile('./resources/database/produk.json', 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }

                let bad = data ? JSON.parse(data) : [];

                if (bad.find((produk) => produk.produkId === formattedprodukId)) {
                    return ctx.reply('❌ Produk sudah ada di dalam database!');
                }

                const produkData = {
                    id: bad.length + 1,
                    produkName: sesiyfy[chatId].produkname.toUpperCase(),
                    produkId: formattedprodukId,
                    produkXuid: xuiddata,
                    produkDeskripsi: sesiyfy[chatId].produkDeskripsi
                };

                bad.push(produkData);
                fs.writeFile('./resources/database/produk.json', JSON.stringify(bad, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        return;
                    }
                    ctx.reply(`✅ *Produk berhasil ditambahkan!*\n\n📌 Nama: *${produkData.produkName}*\n🆔 ID: *${produkData.produkId}*\n📖 Deskripsi: *${produkData.produkDeskripsi}*`, {
                        parse_mode: 'Markdown',
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "🔙 Kembali", callback_data: `cad_backin` }]
                            ]
                        }
                    });
                    delete sesiyfy[chatId];
                });
            });
        }
    }
    await next();  
});
function sendStockNotification(productId, totalStockAdded) {
    if (process.env.ENABLE_NOTIFICATION_STOCK === "true") {
        db.get("SELECT nameproduct FROM list WHERE id = ?", [productId], (err, row) => {
            if (err) {
                console.error("Error retrieving product name:", err);
                return;
            }
            const productName = row ? row.nameproduct : "Unknown Product";
            const notificationText = `📦 *Stok Baru Ditemukan*\n\n` +
                `• *Nama Produk*: ${productName}\n` +
                `• *ID*: ${productId}\n` +
                `• *Total Stok Yang Ditambah*: ${totalStockAdded}\n\n` +
                `🚀 Segera checkout untuk mendapatkan item ini!`;
  
            // Kirim notifikasi ke admin atau grup tertentu
            bot.telegram.sendMessage(config.owner_chatid, notificationText, { parse_mode: "Markdown" });
        });
    }
  }
function addstock(id, count) {
    db.get('SELECT stock FROM list WHERE id = ?', id, (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
  
      if (row) {
        const currentStock = row.stock;
        const newStock = currentStock + count;
        db.run('UPDATE list SET stock = ? WHERE id = ?', [newStock, id], (updateErr) => {
          if (updateErr) {
            console.error(updateErr.message);
          } else {
    return true;
          }
        });
      } else {
  error(`Product with ID ${id} not found in the database`);
      }
    });
}
async function sendprodukList1(ctx, page) {
        const chatId = ctx.from.id;
        if (!states[chatId] || !states[chatId].categories) return;
      
        const categories = states[chatId].categories;
        const totalPages = Math.ceil(categories.length / itemsPerPage);
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedCategories = categories.slice(start, end);
      
        let produkText = `╭────────────✧\n┊   LIST PRODUK\n┊   page ${page} / ${totalPages}\n┊─────────────\n`;
        paginatedCategories.forEach((produk) => {
          produkText += `┊ [${produk.id}] ${produk.produkName}\n`;
        });
        produkText += `╰────────────✧`;
      
        const escapedText = escapeMarkdown(produkText);
        const inlineKeyboard = [];
        if (page > 1) inlineKeyboard.push(Markup.button.callback("⬅️ Sebelumnya", `prev_${page - 1}`));
        if (page < totalPages) inlineKeyboard.push(Markup.button.callback("➡️ Selanjutnya", `next_${page + 1}`));
      
        try {
            await ctx.replyWithPhoto(
                { source: "./resources/assets/images/banner.png" },
                {
                  caption: escapedText,
                  parse_mode: "MarkdownV2",
                  ...Markup.inlineKeyboard([inlineKeyboard]),
                }
              );
        } catch (error) {
          console.log("Error editMessageMedia, kirim ulang pesan:", error);
        
        }
      }
async function sendProduct(ctx) {
    const fs = require('fs/promises')
    const chatId = ctx.from.id;
            const username = ctx.from.first_name || "User";
            const userListPath = "resources/database/userlist.json";
            const produkPath = "resources/database/produk.json";
            const itemCounterPath = "resources/database/itemcounter.json";
          
            try {
              // Baca userlist
              let userList = [];
              try {
                const data = await fs.readFile(userListPath, "utf8");
                userList = JSON.parse(data);
              } catch (err) {
                console.error("File userlist.json tidak ditemukan, membuat baru...");
              }
              let user = userList.find((user) => String(user.chatId) === String(chatId));
              if (!user) {
                user = {
                  name: username,
                  chatId: chatId,
                  age: new Date().toISOString().split("T")[0], 
                  balance: 0,
                  whatsapp_number: "-",
                  bankid: Math.floor(100000 + Math.random() * 900000).toString(), 
                  is_verified: false,
                };
                userList.push(user);
                await fs.writeFile(userListPath, JSON.stringify(userList, null, 2));
              }
              const [produkData, itemData] = await Promise.all([
                fs.readFile(produkPath, "utf8"),
                fs.readFile(itemCounterPath, "utf8"),
              ]);
              const categories = JSON.parse(produkData).sort((a, b) => a.id - b.id);
              const items = JSON.parse(itemData);
              const totaltransaksi = items.reduce((total, item) => total + item.total, 0);
              const keyboardRows = [
                [Markup.button.text(config.button_menu.list), Markup.button.text(config.button_menu.stock)],
              ];
          
              for (let i = 0; i < categories.length; i += 6) {
                keyboardRows.push(categories.slice(i, i + 6).map((produk) => Markup.button.text(`${produk.id}`)));
              }
              keyboardRows.push(["Riwayat Transaksi"]);
		  keyboardRows.push(["✨ Produk Populer", "❓ Cara Order"])
              await ctx.reply(
                `Hallo Ka *${user.name}* 😊\n\nPilih produk dengan menekan nomor berikut :`,
                {
                  parse_mode: "Markdown",
                  ...Markup.keyboard(keyboardRows).resize(),
                }
              );
              states[chatId] = { page: 1, categories, totaltransaksi };
              sendprodukList1(ctx, 1, null);
            } catch (err) {
              console.error("Error processing List Produk:", err);
              await ctx.reply("Terjadi kesalahan, coba lagi nanti.");
            }
}
}