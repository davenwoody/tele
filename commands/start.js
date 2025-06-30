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
const fss = require("fs");
const { Markup } = require("telegraf");
const { getDate } = require("../resources/lib/myfunction");

module.exports = (bot, db) => {
	 const config = JSON.parse(fss.readFileSync('./resources/Admin/settings.json'))
	 const pendingPrivateMessages = {};
    const privateConversations = {}; 
	const states = {};
	const itemsPerPage = 10;
	
	function escapeMarkdownV2(text) {
		return text
		  .replace(/([_*\[\]()~>#+\-=|{}.!\\])/g, "\\$1")
		  .replace(/\\(\*)/g, "$1")
		  .replace(/\\(_)/g, "$1");
	  }
	const escapeMarkdown = (text) => {
  return text.replace(/[_\[\]()~`>#\+=|{}.!-]/g, "\\$&");
};
const fs = require("fs").promises;
 
bot.command("start", async (ctx) => {
  const chatId = ctx.chat.id;
  const username = ctx.from.username || "Pengguna";
  const userListPath = "./resources/database/userlist.json";
  const transaksiPath = "./resources/database/listTransaksi.json";

  try {
    let userList = [];

    // Cek apakah file userlist.json ada
    try {
      const data = await fs.readFile(userListPath, "utf8");
      userList = JSON.parse(data);
    } catch (err) {
      console.error("File userlist.json tidak ditemukan, membuat baru...");
      userList = [];
    }

    let user = userList.find((user) => String(user.chatId) === String(chatId));

    // Jika user belum terdaftar, buat data baru
    if (!user) {
      user = {
        name: username,
        chatId: chatId,
        age: new Date().toISOString().split("T")[0], // Format YYYY-MM-DD
        balance: 0,
        whatsapp_number: "-",
        bankid: Math.floor(100000 + Math.random() * 900000).toString(), // Bank ID random 6 digit
        is_verified: false,
      };
      userList.push(user);
      await fs.writeFile(userListPath, JSON.stringify(userList, null, 2));
    }

    // Ambil data tambahan
    const [produkData, userData, transaksiData] = await Promise.all([
      fs.readFile("./resources/database/produk.json", "utf8"),
      fs.readFile(userListPath, "utf8"),
      fs.readFile(transaksiPath, "utf8"),
    ]);

    const users = JSON.parse(userData);
    const totalUsers = users.length;
    const transaksiList = JSON.parse(transaksiData);

    // **Hitung total transaksi user**
    const userTransactions = transaksiList.filter(
      (trx) => String(trx.user_id) === String(chatId)
    );

    const totalQuantity = userTransactions.reduce((total, trx) => total + trx.jumlah, 0);
    const totalAmount = userTransactions.reduce((total, trx) => total + trx.total, 0);

    states[chatId] = { page: 1, totalTransactions: totalQuantity, totalAmount };

    // **Pesan format MarkdownV2**
    const caption = escapeMarkdown(
      `╭──────────✧
┊ *Hallo 👋*
┊───────────
┊ • *User :* ${user.name}
┊ • *ID :* ${user.chatId}
┊ • *Total Transaksi :* ${totalQuantity}x
┊───────────
┊ • *Total User Bot :* ${totalUsers}
╰──────────✧`
    );

    await ctx.replyWithPhoto(
      { source: "./resources/assets/images/banner.png" },
      {
        caption,
        parse_mode: "MarkdownV2",
        ...Markup.keyboard([
          [config.button_menu.list, config.button_menu.stock],
          ["Riwayat Transaksi"],
		  ["✨ Produk Populer", "❓ Cara Order"]
        ]).resize(),
      }
    );
  } catch (err) {
    console.error("Error processing /start:", err);
    await ctx.reply("Terjadi kesalahan, coba lagi nanti.");
  }
});

	bot.action(/prev_(\d+)/, async (ctx) => {
	  const page = parseInt(ctx.match[1]);
	  await sendprodukList(ctx, page);
	});
	
	bot.action(/next_(\d+)/, async (ctx) => {
	  const page = parseInt(ctx.match[1]);
	  await sendprodukList(ctx, page);
	});
	

	async function sendprodukList(ctx, page) {
	  const chatId = ctx.from.id;
	  if (!states[chatId] || !states[chatId].categories) return;
	
	  const categories = states[chatId].categories;
	  const totalPages = Math.ceil(categories.length / itemsPerPage);
	  const start = (page - 1) * itemsPerPage;
	  const end = start + itemsPerPage;
	  const paginatedCategories = categories.slice(start, end);
	
	  let produkText = `╭────────────✧\n┊   *LIST PRODUK*\n┊   page ${page} / ${totalPages}\n┊─────────────\n`;
	  paginatedCategories.forEach((produk) => {
		produkText += `┊ *[${produk.id}]* *${produk.produkName}*\n`;
	  });
	  produkText += `╰────────────✧`;
	
	  const escapedText = escapeMarkdown(produkText);
	  const inlineKeyboard = [];
	  if (page > 1) inlineKeyboard.push(Markup.button.callback("⬅️ Sebelumnya", `prev_${page - 1}`));
	  if (page < totalPages) inlineKeyboard.push(Markup.button.callback("➡️ Selanjutnya", `next_${page + 1}`));
	
	  try {
		await ctx.editMessageMedia(
		  {
			type: "photo",
			media: { source: "./resources/assets/images/banner.png" },
			caption: escapedText,
			parse_mode: "MarkdownV2",
		  },
		  Markup.inlineKeyboard([inlineKeyboard])
		);
	  } catch (error) {
		console.log("Error editMessageMedia, kirim ulang pesan:", error);
		await ctx.replyWithPhoto(
		  { source: "./resources/assets/images/banner.png" },
		  {
			caption: escapedText,
			parse_mode: "MarkdownV2",
			...Markup.inlineKeyboard([inlineKeyboard]),
		  }
		);
	  }
	}
	async function sendprodukList1(ctx, page) {
		const chatId = ctx.from.id;
		if (!states[chatId] || !states[chatId].categories) return;
	  
		const categories = states[chatId].categories;
		const totalPages = Math.ceil(categories.length / itemsPerPage);
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const paginatedCategories = categories.slice(start, end);
	  
		let produkText = `╭────────────✧\n┊   *LIST PRODUK*\n┊   page ${page} / ${totalPages}\n┊─────────────\n`;
		paginatedCategories.forEach((produk) => {
		  produkText += `┊ *[${produk.id}]* *${produk.produkName}*\n`;
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
	
bot.hears(/🛒 Stock/, async (ctx) => {
  const fs = require('fs')
  const products = JSON.parse(fs.readFileSync('resources/database/produk.json', 'utf8'));

// Fungsi cari produk berdasarkan kategori
function findProductByCategory(category) {
    return products.filter(product => product.produkId === category);
}

// Fungsi escape MarkdownV2 supaya tidak error
function escapeMarkdownV2(text) {
    return text
        .replace(/[_*\[\]()~>#+\-=|{}.!\\]/g, "\\$&") // Escape karakter khusus
        .replace(/\\(\*)/g, "$1") // Kembalikan * untuk bold
        .replace(/\\(_)/g, "$1") // Kembalikan _ untuk italic
        .replace(/```/g, "\\`\\`\\`"); // Escape ``` agar tetap bisa pakai code block
}

    const chatId = ctx.from.id;
    await ctx.replyWithChatAction("typing");

    db.all('SELECT list.id, list.desc, list.nameproduct, list.category, list.price, COUNT(stock.id) AS stock_count FROM list LEFT JOIN stock ON list.id = stock.id GROUP BY list.id, list.nameproduct, list.category, list.price', (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }

        const filteredRows = rows.filter(row => row.stock_count > 0);
        if (filteredRows.length === 0) {
            ctx.reply('Maaf, toko ini tidak memiliki stok yang tersedia. Silakan chat owner bot untuk menambahkan stok.');
        } else {
            const buttons = [
                [Markup.button.callback("↻ Refresh", `refreshh`)]
            ];

            // Format daftar stok dengan ID produk
            const stockInfo = filteredRows.map(row => {
                const matchingProducts = findProductByCategory(row.category);
                const productIds = matchingProducts.map(p => p.id).join(', ') || 'N/A'; // Ambil ID produk atau 'N/A' jika tidak ada

                return `*[${productIds}] ${row.nameproduct} ➜ ${row.stock_count}x*`;
            }).join('\n');

            // Escape Markdown biar aman
            const message = escapeMarkdownV2(`__*Informasi Stok*__\n- Tanggal: ${getDate('Asia/Jakarta')}\n\n${stockInfo}\n\nUntuk membeli produk, ketik angka yang ingin kamu beli`);

            ctx.reply(message, {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard(buttons),
            });
        }
    });
});
	bot.hears("❓ Cara Order", async (ctx) => {
		let pesan = `📖 CARA ORDER
━━━━━━━━━━━━━━━━

1. Klik tombol List Produk
2. Pilih produk yang ingin dibeli dengan menekan nomor produk
3. Pilih variant yang tersedia
4. Atur jumlah pesanan dengan tombol + atau -
5. Klik tombol "Konfirmasi ✅"
6. Scan QRIS yang muncul untuk melakukan pembayaran
7. Tunggu sistem memverifikasi pembayaran
8. Produk akan otomatis dikirim setelah pembayaran terverifikasi

📝 Catatan:
• Pastikan jumlah transfer sesuai dengan yang tertera
• Transaksi akan otomatis dibatalkan jika tidak dibayar dalam 5 menit
• Hubungi admin atau /pm jika ada kendala dalam pemesanan`
ctx.reply(pesan, {
	parse_mode: 'Markdown'})
	})
	bot.hears("🛍️ List Produk", async (ctx) => {
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
			`Hallo Kak *${user.name}* 😊 \n\nPilih produk dengan menekan nomor berikut :`,
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
		};
	  });
	  bot.command('pm', async (ctx) => {
		await ctx.reply(
		  `Ada kendala dari pesanan kamu? silahkan hubungi Admin\n` +
		  `- @davenwo\n\n` +
		  `Terimakasih sudah menggunakan jasa kami`
		)
	  });	  
    bot.action('staff_call_cancel', async (ctx) => {
         ctx.reply("Baik kak, Admin tidak dipanggil ke session chat 😊.", {
			parse_mode: 'Markdown'		})
    })
bot.action('refreshh', async (ctx) => {
		 const fs = require('fs')
  const products = JSON.parse(fs.readFileSync('resources/database/produk.json', 'utf8'));

// Fungsi cari produk berdasarkan kategori
function findProductByCategory(category) {
    return products.filter(product => product.produkId === category);
}

// Fungsi escape MarkdownV2 supaya tidak error
function escapeMarkdownV2(text) {
    return text
        .replace(/[_*\[\]()~>#+\-=|{}.!\\]/g, "\\$&") // Escape karakter khusus
        .replace(/\\(\*)/g, "$1") // Kembalikan * untuk bold
        .replace(/\\(_)/g, "$1") // Kembalikan _ untuk italic
        .replace(/```/g, "\\`\\`\\`"); // Escape ``` agar tetap bisa pakai code block
}

    const chatId = ctx.from.id;
    await ctx.replyWithChatAction("typing");

    db.all('SELECT list.id, list.desc, list.nameproduct, list.category, list.price, COUNT(stock.id) AS stock_count FROM list LEFT JOIN stock ON list.id = stock.id GROUP BY list.id, list.nameproduct, list.category, list.price', (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }

        const filteredRows = rows.filter(row => row.stock_count > 0);
        if (filteredRows.length === 0) {
            ctx.reply('Maaf, toko ini tidak memiliki stok yang tersedia. Silakan chat owner bot untuk menambahkan stok.');
        } else {
            const buttons = [
                [Markup.button.callback("↻ Refresh", `refreshh`)]
            ];

            // Format daftar stok dengan ID produk
            const stockInfo = filteredRows.map(row => {
                const matchingProducts = findProductByCategory(row.category);
                const productIds = matchingProducts.map(p => p.id).join(', ') || 'N/A'; // Ambil ID produk atau 'N/A' jika tidak ada

                return `*[${productIds}] ${row.nameproduct} ➜ ${row.stock_count}x*`;
            }).join('\n');

            // Escape Markdown biar aman
            const message = escapeMarkdownV2(`__*Informasi Stok*__\n- Tanggal: ${getDate('Asia/Jakarta')}\n\n${stockInfo}\n\nUntuk membeli produk, ketik angka yang ingin kamu beli`);

            ctx.editMessageText(message, {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard(buttons),
            });
        }
    });
})
	  bot.action(/acceptcallyes_(\d+)/, async (ctx) => {
		const userId = ctx.match[1];
		if (userId === config.owner_chatid) {
			ctx.editMessageText('🚫 Owner tidak dapat message ke diri sendiri.')
			return;
		}
		if (privateConversations[userId]) {
			ctx.editMessageText('Kamu sudah berada di private chat dan sudah terhubung dengan admin bot ini, klik tombol disconnect untuk mengakhiri session chat');
		} else {
			if (pendingPrivateMessages[userId]) {
				ctx.editMessageText('Kamu sudah meminta request chat ke admin bot. Harap tunggu sampai admin bot merespon pesan kamu.');
			} else {
				ctx.editMessageText('📞 Memanggil admin bot ke session chat...')
				pendingPrivateMessages[userId] = { userId };
				bot.telegram.sendMessage(config.owner_chatid, escapeMarkdownV2(`📩 Kami menerima private message dari : @${ctx.from.username} dengan ID (${userId})\nApakah kamu ingin menerima chat ini?\nSemua chat yang kamu kirim ke bot akan kami kirimkan ke User yang meminta request chat tersebut.`), {
					parse_mode: 'Markdown',
					...Markup.inlineKeyboard([
						[{text: "Ya", callback_data: `accept_${userId}`}, {text: "Tidak", callback_data: `reject_${userId}`}]
					])
				});
			}
		}
	  })
	  bot.action(/accept_(\d+)/, async (ctx) => {
		const userId = ctx.match[1]; // Ambil userId dari callback data
		const fs = require('fs')
		const userList = JSON.parse(fs.readFileSync('resources/database/userlist.json', 'utf8'));
		const user = userList.find((userData) =>parseInt(userData.chatId) === parseInt(userId));
		const privateMessage = pendingPrivateMessages[userId];
		console.log(privateMessage, user)
		if (!user || !privateMessage) {
			return ctx.reply("⚠️ Terjadi kesalahan, user tidak ditemukan atau sudah kadaluarsa.");
		}
	
		const userChatId = privateMessage.userId;
		const ownerChatId = ctx.chat.id;
		
		delete pendingPrivateMessages[userId];
		privateConversations[userId] = ownerChatId;
		privateConversations[ownerChatId] = userChatId;
	
		// Kirim pesan ke user
		await bot.telegram.sendMessage(userChatId, 
			'🔗 *Kamu Terhubung Ke Chat Private!*\n\nSemua pesan kamu akan di forward ke owner bot ini.', 
			{
				parse_mode: "Markdown",
				...Markup.keyboard([['🔴 Disconnect']]).resize().oneTime(),
			}
		);
		let ps = `Kamu Terhubung Ke *${user.name}* Dengan detail dibawah ini

*• Username :* ${user.name}
*• Bank ID :* \`${user.bankid}\`
*• ID USER :* ${userId}
*• Link Telegram :* [${user.name}] (tg://user?id=${userId})

Chat kamu akan di forward kepada user yang tertera pada data diatas`
await ctx.deleteMessage().catch((error) => {
	console.error('Error deleting message:', error);
});
		await ctx.reply(escapeMarkdownV2(ps),
			{
				parse_mode: "MarkdownV2",
				...Markup.keyboard([[ '🔴 Disconnect']]).resize().oneTime(),
			}
		);
	 
	});

	bot.hears('🔴 Disconnect', async (ctx) => {
			const chatId = ctx.from.id;
		   const userId = ctx.from.id;
			if (privateConversations[userId]) {
				const userChatId = privateConversations[userId];
				const ownerChatId = privateConversations[userChatId];
				delete privateConversations[userId];
				delete privateConversations[userChatId];
				bot.telegram.sendMessage(userChatId, '⏺ Sesi telah berakhir');
				bot.telegram.sendMessage(ownerChatId, '⏺ Sesi telah berakhir');
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
		  await bot.telegram.sendMessage(userChatId,
			`Hello Kak *${user.name}* 😊 \n\nPilih produk dengan menekan nomor berikut :`,
			{
			  parse_mode: "Markdown",
			  ...Markup.keyboard(keyboardRows).resize(),
			}
		  );
		  await bot.telegram.sendMessage(ownerChatId,
			`Hello Kak *${user.name}* 😊 \n\nPilih produk dengan menekan nomor berikut :`,
			{
			  parse_mode: "Markdown",
			  ...Markup.keyboard(keyboardRows).resize(),
			}
		  );
		  states[chatId] = { page: 1, categories, totaltransaksi };
		  async function sendprodukList2(ctx, page) {
			if (!states[chatId] || !states[chatId].categories) return;
	  
			const categories = states[chatId].categories;
			const totalPages = Math.ceil(categories.length / itemsPerPage);
			const start = (page - 1) * itemsPerPage;
			const end = start + itemsPerPage;
			const paginatedCategories = categories.slice(start, end);
		  
			let produkText = `╭────────────✧\n┊   LIST PRODUK\n┊   page ${page} / ${totalPages}\n┊─────────────\n`;
			paginatedCategories.forEach((produk) => {
			  produkText += `┊ *[${produk.id}]* *${produk.produkName}*\n`;
			});
			produkText += `╰────────────✧`;
		  
			const escapedText = escapeMarkdown(produkText);
			const inlineKeyboard = [];
			if (page > 1) inlineKeyboard.push(Markup.button.callback("⬅️ Sebelumnya", `prev_${page - 1}`));
			if (page < totalPages) inlineKeyboard.push(Markup.button.callback("➡️ Selanjutnya", `next_${page + 1}`));
			try {
				await bot.telegram.sendPhoto(
					ownerChatId,
					{ source: "./resources/assets/images/banner.png" },
					{
						caption: escapedText,
						parse_mode: "MarkdownV2",
						...Markup.inlineKeyboard([inlineKeyboard]),
					}
				);
			} catch (error) {
				console.log("Error kirim pesan ke user:", error);
			}
		  }
		  async function sendprodukList1(ctx, page) {
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
				await bot.telegram.sendPhoto(
					userChatId,
					{ source: "./resources/assets/images/banner.png" },
					{
						caption: escapedText,
						parse_mode: "MarkdownV2",
						...Markup.inlineKeyboard([inlineKeyboard]),
					}
				);
			} catch (error) {
				console.log("Error kirim pesan ke user:", error);
			}
		  }
		  sendprodukList1(ctx, 1, null);
		  sendprodukList2(ctx, 1, null);
		} catch (err) {
		  console.error("Error processing List Produk:", err);
		  await ctx.reply("Terjadi kesalahan, coba lagi nanti.");
		}
			}
	})
	bot.command('sendimage', async (ctx) => {
		const base64Image = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOQAAADkCAYAAACIV4iNAAAAAklEQVR4AewaftIAAAytSURBVO3BQY4cy5LAQDLR978yR0ufTQCJqpbifbiZ/cFa6woPa61rPKy1rvGw1rrGw1rrGg9rrWs8rLWu8bDWusbDWusaD2utazysta7xsNa6xsNa6xoPa61rPKy1rvGw1rrGDx9S+ZsqTlROKiaVqeJE5Zsq3lB5o+INlaniDZWpYlI5qXhDZaqYVP6mik88rLWu8bDWusbDWusaP3xZxTepnKi8oXKiMlW8UXGiMqlMFScVk8onVD6h8k0qv6nim1S+6WGtdY2HtdY1HtZa1/jhl6m8UfFGxYnKVHGiMqlMFZPKicpUMan8JpWpYqqYVCaVqeINlaliUpkqTlS+SeWNit/0sNa6xsNa6xoPa61r/LD+n4oTlU+oTBWTylTxRsWkMqlMFScVk8obFZPKVDGpTBUnFf9LHtZa13hYa13jYa11jR/+41SmihOVqWJS+ZcqJpU3VE4qTiomlaniROUNlanipOJ/2cNa6xoPa61rPKy1rvHDL6v4TRWTylQxqZxUTCqfqJhUJpU3Kt5QmVQ+oXJSMalMFW+oTBXfVHGTh7XWNR7WWtd4WGtd44cvU/mbVKaKSWWqmFSmipOKSeVEZaqYVKaKSeVEZao4qZhUpopJZaqYVD6hMlW8oTJVnKjc7GGtdY2HtdY1HtZa1/jhQxX/UsWk8kbFTVTeqHhDZaqYVE5UpoqTijdU3qg4qfgveVhrXeNhrXWNh7XWNX74kMpUMalMFZPKVDGpTBUnFZPKGypvVHxTxaQyqXyiYlI5qThRmSomlanijYpJZar4hMpUcaIyVXzTw1rrGg9rrWs8rLWuYX/wRSpTxaQyVUwqU8WkMlV8QmWqmFROKiaVqeJE5TdVTConFScqU8WJyhsVJypTxRsqU8WkMlX8TQ9rrWs8rLWu8bDWusYPH1L5hMpUMam8oTJVTConKicVk8pUMamcVJyonFScqEwVk8qJyicqPqFyojJVnFRMKlPFv/Sw1rrGw1rrGg9rrWv88JdVTConFScqU8VJxYnKb6qYVL5J5RMqU8WkcqIyVZyonFRMKlPFpDJVTCpTxaQyVUwqU8U3Pay1rvGw1rrGw1rrGvYHH1CZKiaVf6niRGWq+ITKJyomlZOKE5WTikllqjhRmSreUPmmikllqphUPlHxTQ9rrWs8rLWu8bDWuob9wQdUpop/SWWqeEPlpGJSmSomlZOKSWWqmFQ+UfEJlaniROWkYlKZKiaVb6qYVN6o+KaHtdY1HtZa13hYa13D/uADKicVk8pUcaLyRsWkMlVMKp+omFSmiknlmyomlZOKSWWqeEPljYo3VKaKSWWqeENlqphUpopJZar4xMNa6xoPa61rPKy1rmF/8ItUpopPqEwVn1B5o+JEZaqYVKaKSWWqOFF5o+JEZaqYVKaKSeUTFZPKv1QxqUwV3/Sw1rrGw1rrGg9rrWv88GUqU8WJylQxqUwVk8pUMal8k8rfpHJScaJyonKiMlVMKm9UTCqTylRxonJS8YbKScWkMlV84mGtdY2HtdY1HtZa17A/+CKVk4oTlaliUvlExYnKJyreUDmpmFTeqHhDZaqYVKaKSeWkYlI5qZhUPlExqZxU/E0Pa61rPKy1rvGw1rrGDx9SmSomlU+oTBXfpPJGxaTyiYo3KiaVT6icqEwVJxXfpDJVTCpTxaQyqUwVk8obKlPFJx7WWtd4WGtd42GtdY0fPlTxhspUcVIxqUwVJypTxRsVk8qJyhsVk8pUcVIxqXyiYlKZVE4qJpWp4o2KSeWNim9S+U0Pa61rPKy1rvGw1rrGDx9SOal4o2JSmSomlaniExWTylQxqUwVb6hMFScqb6hMFf+SyhsqU8WkMqlMFZPKVDFV/EsPa61rPKy1rvGw1rrGD19WMamcVJxUnFRMKlPFpHKiMlVMKlPFpPJGxaTyRsWkMlVMKlPFpDJVnKh8omJSOVGZKk5U3lCZKqaK3/Sw1rrGw1rrGg9rrWvYH3yRylQxqfxLFW+oTBWTylQxqUwVk8pNKiaVqWJSmSomlZOKN1R+U8UbKlPFJx7WWtd4WGtd42GtdY0fvqziExVvqJxUTCpTxaQyVZxUTCpTxaTyiYo3VN5QmSpOKt6oOFGZKt6oeEPlRGWq+E0Pa61rPKy1rvGw1rrGD1+mMlVMFZPKicpU8YmKk4oTlanijYpJZaqYVE5UpoqTijdUPlHxRsWkMlVMKicqU8WJylQxqfymh7XWNR7WWtd4WGtd44cPqUwVk8onKt6omFSmihOVk4o3VE4qJpU3Kr5JZao4UTlRmSomlZOKSeWNit9U8U0Pa61rPKy1rvGw1rrGD1+mMlWcqEwqn1CZKj5R8YmKSWVSeUPlb1KZKqaKSeUTFZPKVDGpTCqfqJhUpopJZar4xMNa6xoPa61rPKy1rmF/8AGVb6o4UflNFW+ovFExqbxRMalMFScqJxVvqEwVJyrfVPE3qZxUfOJhrXWNh7XWNR7WWtf44UMVn1A5UTmpmFSmihOVN1ROKn6Tyhsq36RyojJVvFExqUwVk8obFW+onFR808Na6xoPa61rPKy1rvHDh1SmiknlpGJSmSo+oTJVTBU3q5hUpopJZap4Q+Wk4kTljYpJ5TepTBWTylQxqfymh7XWNR7WWtd4WGtdw/7gF6mcVJyofKJiUpkqPqEyVUwqU8WJyicqJpWp4g2VT1RMKicVk8pUMalMFZPKVDGpTBVvqEwVn3hYa13jYa11jYe11jXsDz6g8kbFpDJVfELlpGJSmSreUJkq3lCZKiaVk4pJZaqYVKaKE5WTiknlpGJSOak4UXmjYlI5qfibHtZa13hYa13jYa11jR++rOJE5UTljYqp4kTlEyonKlPFGypTxYnKVPFNFScqv0llqpgq3lCZKk5U3qj4xMNa6xoPa61rPKy1rvHDhypOVE4qJpWp4g2Vk4oTlaniN1X8SypTxaQyVXxCZao4UZlUPlHxRsXf9LDWusbDWusaD2uta/zwIZU3Kk4qJpU3Kk5UTiq+SWWqmFSmijcqJpU3Kr6p4g2VqeKNikllqjhRmSomlaniNz2sta7xsNa6xsNa6xr2Bx9QmSomlZOKSWWqmFT+pooTlTcqTlSmijdUpopJZaqYVKaKE5WTim9SmSpOVD5R8Tc9rLWu8bDWusbDWusa9gcfUDmp+ITKVDGpTBWTylQxqUwVk8o3VUwqU8WJylTxCZWp4hMqb1ScqEwVk8pJxaRyUjGpnFR808Na6xoPa61rPKy1rvHDL1OZKiaVqWKqmFSmik9UTCpvVJyovKFyUjGpTBWTyknFicpUcVIxqbyhMlVMKt9UMalMFX/Tw1rrGg9rrWs8rLWuYX/wRSpTxRsqb1S8ofJGxYnKVPGGylQxqUwVb6hMFScqU8WJyknFpDJVnKi8UfGGylQxqbxR8YmHtdY1HtZa13hYa13D/uCLVN6oeEPlJhVvqEwVk8pJxYnKVPFNKlPFpDJVvKEyVUwqU8WJylTxTSpTxSce1lrXeFhrXeNhrXWNHz6k8kbFGyrfVDGpTBUnKt+kMlVMKpPKGypTxScqflPFGypvqJxUnKj8poe11jUe1lrXeFhrXeOHD1X8pooTlZOKk4o3KiaVk4qp4hMVb6icqEwVk8obFZ9QmSreqHhD5URlqvhND2utazysta7xsNa6xg8fUvmbKqaKSWVSmSomlanijYpJ5Q2VqpJ5Y2KSWWqmFT+popJ5b+s4kRlqphUpopPqEwVJyrfVDGpTBW/6WGtdY2HtdY1HtZa1/jhP65iUjmpOFGZKiaVk4pJ5aRiUnmj4kRlqphUTio+oXJScaJyUvEJlZOKSWWq+KaHtdY1HtZa13hYa13jh/84lZOKNypOKiaVSeUNlaliUpkq3qiYVD6hMlVMKicVJxWTyidUpopPVEwqU8UnHtZa13hYa13jYa11jR9+WcVvqjhRmSomlaliUjmpeENlqnhDZao4UZkqTlR+k8obFW+onKicqJxUTBXf9LDWusbDWusaD2uta/zwZSp/k8pJxaTyRsWkMqlMFW+oTBUnFZPKVPGGyonKN1V8k8pJxRsqb6hMFZ94WGtd42GtdY2HtdY17A/WWld4WGtd42GtdY2HtdY1HtZa13hYa13jYa11jYe11jUe1lrXeFhrXeNhrXWNh7XWNR7WWtd4WGtd42GtdY2HtdY1/g/SUQMzdj73oAAAAABJRU5ErkJggg==`;
		const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
		const buffer = Buffer.from(base64Data, 'base64');
	
		ctx.replyWithPhoto({ source: buffer });
	});

	bot.on(['text', 'sticker', 'photo'], async (ctx, next) => {
		const userId = ctx.chat.id;
	
		if (privateConversations[userId]) {
			const userChatId = privateConversations[userId];
			const ownerChatId = privateConversations[userChatId];
			const targetChatId = (userId === userChatId) ? ownerChatId : userChatId;
			if (ctx.message.text) {
				
					return ctx.forwardMessage(targetChatId).catch(() => {});
					
			}
			if (ctx.message.sticker) {
				bot.telegram.sendSticker(targetChatId, ctx.message.sticker.file_id)
					.catch(() => {});
					return ctx.forwardMessage(targetChatId).catch(() => {});
			}
			if (ctx.message.photo) {
				const photo = ctx.message.photo[ctx.message.photo.length - 1]; 
				const caption = ctx.message.caption || '';
	
				bot.telegram.sendPhoto(targetChatId, photo.file_id, { caption })
					.catch(() => {});
					return ctx.forwardMessage(targetChatId).catch(() => {});
			}
		}
		await next()
	});
	
}