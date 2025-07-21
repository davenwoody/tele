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
const fs = require("fs");
const { Markup } = require("telegraf");
const userOrders = {};
const produkData = JSON.parse(
  fs.readFileSync("./resources/database/produk.json", "utf8")
);
const { tambahKodeUnik } = require('../resources/netvance/netvancePay');
// Tripay QRIS gateway
const { createQrisInvoice } = require('../resources/payments/tripayQris');
const config = JSON.parse(fs.readFileSync('./resources/Admin/settings.json'))
const moment = require("moment-timezone");
const tanggal = moment()
  .tz("Asia/Jakarta")
  .locale("id")
  .format("dddd, D MMMM YYYY");
 const jam = moment()
  .tz("Asia/Jakarta")
  .locale("id")
  .format("HH:mm:ss");
const {
  sendProduct,
  getDate,
} = require("../resources/lib/myfunction");
const { getSnk } = require("../resources/lib/func");
const axios = require("axios");
const { faker } = require("@faker-js/faker");
const providerPrefixes = {
  indosat: ["0814", "0815", "0816", "0855", "0856", "0857", "0858", "0859"],
  smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888"],
  telkomsel: ["0811", "0812", "0813", "0821", "0822", "0852", "0853"],
  axis: ["0831", "0832", "0833", "0838"],
  xl: ["0817", "0818", "0819", "0859", "0877", "0878"],
};
function expiredTime () {
  const now = new Date(); 
  const expiredTime = new Date(now.getTime() + 5 * 60 * 1000); 
  return expiredTime.toLocaleString("en-GB", {
    timeZone: "Asia/Jakarta",
  }); 
}
const {
  addSessionDeposit
} = require("../resources/lib/transaction");
function generateRandomPhoneNumber() {
  const allProviders = Object.keys(providerPrefixes);
  const randomProvider = faker.helpers.arrayElement(allProviders);
  const prefix = faker.helpers.arrayElement(providerPrefixes[randomProvider]);
  const randomNumber = faker.number
    .int({ min: 1000000, max: 9999999 })
    .toString();
  return `${prefix}${randomNumber}`;
}

const randomPhoneNumber = generateRandomPhoneNumber();
const randomEmail = faker.internet.email();
function generateTrxId(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let trxId = '';
  for (let i = 0; i < length; i++) {
      trxId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return trxId;
}
const trxId = 'NET' + generateTrxId();
function generateRandomDonationMessage() {
  const words = [
    "Terima kasih",
    "banyak",
    "atas",
    "donasi",
    "Anda",
    "Kami",
    "sangat",
    "menghargai",
    "dukungan",
    "anda",
    "setiap",
    "bantuan",
    "berarti",
    "untuk",
    "kami",
    "dampak",
    "besar",
    "semoga",
    "kebaikan",
    "dibalas",
    "berkah",
    "terima",
    "kasih",
    "partisipasi",
    "kami",
    "berterima",
    "kebaikan",
    "tiada",
    "batas",
    "sumbangan",
    "anda",
    "memberi",
    "harapan",
    "baru",
    "kami",
    "terus",
    "berkembang",
    "berkat",
    "anda",
    "setiap",
    "dukungan",
    "membantu",
    "kami",
    "wujudkan",
    "tujuan",
    "bersama",
    "kami",
    "akan",
    "terus",
    "melangkah",
    "maju",
    "terima",
    "kasih",
    "banyak",
    "atas",
    "kesempatan",
    "berbuat",
    "baik",
    "tuhan",
    "memberkati",
    "semangat",
    "cinta",
    "sejahtera",
    "berkembang",
    "solidaritas",
    "empati",
    "peduli",
    "berbagi",
    "komitmen",
    "sukses",
    "kemajuan",
    "keberhasilan",
    "pertumbuhan",
    "keberkahan",
    "bekerja",
    "berinovasi",
    "pencapaian",
    "doa",
    "penuh",
    "perhatian",
    "dedikasi",
    "inspirasi",
    "kepercayaan",
    "menerima",
    "syukur",
    "berkah",
    "restu",
    "keberuntungan",
    "semoga",
    "dapat",
    "menjadi",
    "lebih",
    "baik",
    "semangat",
    "positif",
    "membangun",
    "wujudkan",
    "mimpi",
    "menjadi nyata",
    "tumbuh",
    "meneruskan",
    "perjalanan",
    "berkarya",
    "harapan",
    "baru",
    "mencapai",
    "tujuan",
    "bersama",
    "memberikan",
    "dukungan",
    "tanggung jawab",
    "partisipasi",
    "bantuan",
    "peduli",
    "kerja keras",
    "harapan",
    "doa",
    "kebaikan",
    "saling",
    "mendukung",
    "menolong",
    "sejahtera",
    "mudah",
    "berhasil",
  ];

  const randomMessage = faker.helpers
    .shuffle(words)
    .slice(0, faker.number.int({ min: 5, max: 6 })) // Ambil antara 5 hingga 6 kata secara acak
    .join(" ");

  return randomMessage;
}
 
function escapeMarkdownV2(text) {
  return text
    // Escape semua karakter spesial MarkdownV2 KECUALI `*`, `_`, dan ``` untuk code block
    .replace(/([[\]()~>#+\-=|{}.!\\])/g, "\\$1")
    // Escape single backtick supaya inline code (`text`) tetap jalan
    .replace(/(?<!`)`(?!`)/g, "\\`");
}

const sendOrderMessage = async (ctx, product, jumlahPesanan) => {
  if (userOrders[ctx.from.id]) {
    const data = userOrders[ctx.from.id];
  const produk = produkData.find((p) => p.id == Number(data.produkId));
  if (!produk) {
    return ctx.answerCbQuery("⚠️ Produk tidak ditemukan di database lokal!");
  }
  const totalHarga = product.price * jumlahPesanan;

  let response = `*Konfirmasi Pesanan*\n`;
  response += `╭─────────────────✧\n`;
  response += `┊ *Produk :* ${produk.produkName}\n`;
  response += `┊ *Variasi :* ${product.nameproduct}\n`;
  response += `┊ *Harga satuan :* Rp. ${product.price.toLocaleString()}\n`;
  response += `┊ *Stok tersedia :* ${product.stock_count}\n`;
  response += `┊─────────────────\n`;
  response += `┊ *Jumlah Pesanan :* x${jumlahPesanan}\n`;
  response += `┊ *Total Pembayaran :* Rp. ${totalHarga.toLocaleString()}\n`;
  response += `╰─────────────────✧\n`;
  response += `➤ Refresh at ${new Date().toLocaleTimeString("id-ID")} WIB`;

  const buttons = [
    [
      Markup.button.callback("-", `decrease_${product.id}`),
      Markup.button.callback("+", `increase_${product.id}`),
    ],
    [
      Markup.button.callback(
        "Confirm Order ✅",
        `confirm_${product.id}_${jumlahPesanan}`
      ),
    ],
    [Markup.button.callback("↻ Refresh", `refresh_${product.id}`)],
    [Markup.button.callback("🔙", `refreshdpi_${data.produkId}`)],
  ];
  userOrders[ctx.from.id].totalPrice = totalHarga;
  userOrders[ctx.from.id].produk = produk.produkName;
  userOrders[ctx.from.id].jumlahPesanan = jumlahPesanan;
  userOrders[ctx.from.id].varian = product.nameproduct;
  userOrders[ctx.from.id].idProduk = produk.produkId;
  await ctx.editMessageText(response, {
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard(buttons),
  }).catch(() => {
    ctx.reply(escapeMarkdownV2(response), {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard(buttons),
    })
  });
  }
};

module.exports = (bot, db) => {
  const fs = require("fs");
  const path = require("path");
  const QRCode = require("qrcode");
  const { Markup } = require("telegraf");
  bot.action(/confirm_(\d+)_(\d+)/, async (ctx) => {
    const username = ctx.from.username;
    const chatId = ctx.chat.id;
    const userId = ctx.from.id;
    if (userOrders[userId]) {
    userOrders[chatId].trxid = trxId
    
    const orr = userOrders[userId]
    const fee = 1;
    const unik = await tambahKodeUnik(process.env.KROPA_API, 'user', orr.totalPrice, 1);
    const kode_unik = unik.kode_unik;
    console.log(kode_unik);
    if (process.env.PAYMENT_SAWERIA === 'of') {
      const order = userOrders[userId];
      const productId = ctx.match[1];
      const jumlahPesanan = parseInt(ctx.match[2]);

      if (!userOrders[userId]) {
        return ctx.answerCbQuery("⚠️ Pesanan tidak ditemukan!");
      }
      db.get(
        `SELECT list.id, list.nameproduct, list.price, COUNT(stock.id) AS stock_count
        FROM list
        LEFT JOIN stock ON list.id = stock.id
        WHERE list.id = ?
        GROUP BY list.id, list.nameproduct, list.price`,
        [productId],
        async (err, product) => {
          if (err) {
            console.error(err);
            return ctx.answerCbQuery("⚠️ Gagal mengambil data stok!");
          }
          if (!product) {
            return ctx.answerCbQuery("⚠️ Produk tidak ditemukan!");
          }
          if (product.stock_count < jumlahPesanan) {
            return ctx.answerCbQuery(
              "Stok tidak cukup, silakan refresh untuk update stok!",
              { show_alert: true }
            );
          }   
		// Hit Tripay API to create dynamic QRIS invoice
        const invoice = await createQrisInvoice({
          reference: trxId,
          amount: order.totalPrice + fee + kode_unik,
          customerName: ctx.from.first_name || '-',
          customerEmail: `${ctx.from.id}@telegram.user`
        });
        console.log(invoice);
        const qrisString = invoice.qr_content || invoice.qr_url; // fallback
        const totalAmount = invoice.amount || (order.totalPrice + fee + kode_unik);
      const outputFolder = path.join(__dirname, "../resources/database/qris");
      const outputFile = path.join(
        outputFolder,
        `${trxId}.png`
      );

      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
      }

      try {
        await QRCode.toFile(outputFile, qrisString, { type: "png" });
        const qris = fs.readFileSync(outputFile);
        ctx.answerCbQuery("Memproses Pesanan...", { show_alert: true });
  ctx.deleteMessage()
  let pesan = `*PESANAN TERKONFIRMASI ✅*
╭────────────────────╮  
│ *Produk :* ${order.produk} 
│ *Variasi :* ${order.varian}
│ *Harga Satuan :* Rp. ${order.price.toLocaleString()}
│ *ID Transaksi :* 
│\`${order.trxid}\`
├────────────────────  
│ *Jumlah Pesanan:* x${jumlahPesanan}  
│ *Total Pembayaran :* Rp. ${totalAmount.toLocaleString()}
╰────────────────────╯  
  
*Pembayaran kadaluwarsa dalam 5 menit.  
Silakan scan QRIS untuk menyelesaikan pembayaran!*`;

const trx = userOrders[chatId].trxid
console.log(trx)
let e = await ctx.replyWithPhoto(
    { source: qris },
    {
      caption: pesan,
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
  [Markup.button.callback("❌ Batalkan Order", `batal_order1_${trx}`)]
])
    }
  );
function escapeMarkdownV2(text) {
  return text
    .replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1") // Escape karakter yang wajib
    .replace(/(\d+),(\d+)/g, "$1\\,$2"); // Escape koma dalam angka (Rp 5,000.00)
}


  var expired = await expiredTime();
  addSessionDeposit(userOrders[chatId].trxid, {
    userId: chatId,
    depo_id: trxId,
    produkId: userOrders[chatId].produkId,
    idProduk: userOrders[chatId].idProduk,
    id: userOrders[chatId].productId,
    cart: userOrders[chatId].jumlahPesanan,
    produk: userOrders[chatId].produk,
    produk_nama: userOrders[chatId].varian,
    fee: fee,
    unik: kode_unik,
    type: "topup",
    total_amount: totalAmount,
    payment_method: "QRIS",
    expired: expired,
    chat: chatId,
    key: e.message_id,
    nama: ctx.from.first_name,
    username: ctx.from.username
  });
  await ctx.telegram.sendMessage(
    config.invoice_logger, 
    escapeMarkdownV2(
    `*Qris Pembelian Produk Dibuat*\n
➜ *Username* : @${ctx.from.username || "Tidak ada username"}
➜ *Nama* : ${ctx.from.first_name}
➜ *Product* : ${userOrders[ctx.chat.id]?.produk || "Tidak tersedia"}
➜ *Varian* : ${userOrders[ctx.chat.id]?.varian || "Tidak tersedia"}
➜ *Total* : ${userOrders[ctx.chat.id]?.jumlahPesanan || 0}x
➜ *Payment Via* : QRIS
➜ *Trx ID :* \`${userOrders[userId].trxid}\`
➜ *Amount :* ${ParseIdr(totalAmount)}
➜ *Tanggal :* ${tanggal} ${jam}`),
    {
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Link to user",
              url: `tg://user?id=${ctx.from.id}`,
            },
          ],
        ],
      },
    }
  );
      } catch (err) {
        console.error("Error saat membuat QRIS:", err);
        return ctx.reply("Terjadi kesalahan saat memproses pesanan.");
      }
      
    
    }
  );
  }

    if (process.env.PAYMENT_SAWERIA === 'on') {
    if (userOrders[ctx.from.id]) {
      if (userOrders[userId].status === 'waiting') {
        ctx.answerCbQuery(
          `Silahkan Selesaikan Transaksi Sebelumnya atau batalkan transaksi.`, {
            show_alert: true,
          }
        );
        ctx.deleteMessage().then(() => {
          return;
        });
        return;
      }
        userOrders[userId].status = 'waiting'
      userOrders[chatId].trxid = trxId
    try {
      const productId = ctx.match[1];
      const jumlahPesanan = parseInt(ctx.match[2]);
      const userId = ctx.from.id;

      if (!userOrders[userId]) {
        return ctx.answerCbQuery("⚠️ Pesanan tidak ditemukan!");
      }

      db.get(
        `SELECT list.id, list.nameproduct, list.price, COUNT(stock.id) AS stock_count
				FROM list
				LEFT JOIN stock ON list.id = stock.id
				WHERE list.id = ?
				GROUP BY list.id, list.nameproduct, list.price`,
        [productId],
        async (err, product) => {
          if (err) {
            console.error(err);
            return ctx.answerCbQuery("⚠️ Gagal mengambil data stok!");
          }
          if (!product) {
            return ctx.answerCbQuery("⚠️ Produk tidak ditemukan!");
          }
          if (product.stock_count < jumlahPesanan) {
            return ctx.answerCbQuery(
              "Stok tidak cukup, silakan refresh untuk update stok!",
              { show_alert: true }
            );
          }
 
          const order = userOrders[userId];
          const donationData = {
            amount: order.totalPrice,
            message: generateRandomDonationMessage(),
            anonymous: true,
            payment_type: "qris",
            customer_info: {
              name: username,
              email: randomEmail,
              phone: randomPhoneNumber,
            },
          };
		  const apiUrl = 'http://api.kropatopup.cloud:2061/createSaweria';
         const response = await axios.post(apiUrl, {
            userId: process.env.SAWERIA_USERID,  // Pastikan env var didefinisikan
            apikey: process.env.KROPA_APIKEY,  // Pastikan env var didefinisikan
            data: donationData
        });
         
            
          if (response.data.status === true) {
            const qrisString = response.data.data.data.qr_string;
            const outputFolder = path.join(__dirname, "../resources/database/qris");
            const outputFile = path.join(
              outputFolder,
              `${response.data.data.data.id}.png`
            );

            if (!fs.existsSync(outputFolder)) {
              fs.mkdirSync(outputFolder, { recursive: true });
            }

            try {
              await QRCode.toFile(outputFile, qrisString, { type: "png" });
              const qris = fs.readFileSync(outputFile);
              ctx.answerCbQuery("Memproses Pesanan...", { show_alert: true });
			  ctx.deleteMessage()
        let pesan = `*PESANAN TERKONFIRMASI ✅*
╭─────────────────╮  
│ *Produk :* ${order.produk} 
│ *Variasi :* ${order.varian}
│ *Harga Satuan :* Rp. ${order.price.toLocaleString()}
│ *ID Transaksi :* 
│\`${order.trxid}\`
├─────────────────  
│ *Jumlah Pesanan :* x${jumlahPesanan}  
│ *Total Pembayaran :* Rp. ${order.totalPrice.toLocaleString()}
╰─────────────────╯  
        
*Pembayaran kadaluwarsa dalam 5 menit.  
Silakan scan QRIS untuk menyelesaikan pembayaran!*`;
      

        let e = await ctx.replyWithPhoto(
          { source: qris },
          {
            caption: pesan,
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
              [Markup.button.callback("❌ Batalkan Order", `batal_order`)]
            ])
          }
        );
      
  function escapeMarkdownVa2(text) {
  return text
    .replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1") // Escape karakter yang wajib
    .replace(/(\d+),(\d+)/g, "$1\\,$2"); // Escape koma dalam angka (Rp 5,000.00)
}


// Mengirim pesan dengan MarkdownV2 yang aman
await ctx.telegram.sendMessage(
  config.invoice_logger, 
  escapeMarkdownVa2(
    `🔖 *Qris Pembelian Produk Dibuat*\n
    ➜ *Username :* @${ctx.from.username || "Tidak ada username"}
    ➜ *Nama :* ${ctx.from.first_name}
    ➜ *Product :* ${userOrders[ctx.chat.id]?.produk || "Tidak tersedia"}
    ➜ *Varian :* ${userOrders[ctx.chat.id]?.varian || "Tidak tersedia"}
    ➜ *Total :* ${userOrders[ctx.chat.id]?.jumlahPesanan || 0}x
    ➜ *Via :* QRIS
    ➜ *Trx ID :* \`${response.data.data.data.id}\`
    ➜ *Amount :* ${ParseIdr(response.data.data.data.amount)}
    ➜ *Tanggal :* ${tanggal} ${jam}`
  ),
  {
    parse_mode: "MarkdownV2",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Link to user",
            url: `tg://user?id=${ctx.from.id}`,
          },
        ],
      ],
    },
  }
);

      
    let iterationCount = 0;
    const maxIterations = 60; // Maksimum 15 detik
   const transactionId = response.data.data.data.id
    const interval = setInterval(async () => {
      
          const apiUrls = `http://api.kropatopup.cloud:2061/cekStatus?donationId=${transactionId}`;
         const res = await axios.get(apiUrls);
  
      if (res.data.status === true && res.data.msg === "SUKSES") {
        console.log(`[+] Transaction Success: ${transactionId}`);
        clearInterval(interval);
        
        await ctx.telegram.deleteMessage(chatId, e.message_id).catch(() => {});
  
        const filePath = path.join(__dirname, `${transactionId}_data.txt`);
        const formattedDataproduk = await sendProduct(
          userOrders[ctx.chat.id].productId,
          userOrders[ctx.chat.id].jumlahPesanan,
          ctx.from.first_name,
          ctx.chat.id
        );
        fs.writeFileSync(filePath, formattedDataproduk, "utf8");
        function escapeMarkdownV2s(text) {
          return text
            // Escape semua karakter spesial MarkdownV2, kecuali `*`, `_`, dan ``` untuk code block
            .replace(/([[\]()~>#+\-=|{}.!\\])/g, "\\$1")
            // Escape single backtick supaya inline code (`text`) tetap jalan
            .replace(/(?<!`)`(?!`)/g, "\\`")
            // Escape underscore (_) agar tidak jadi italic jika diperlukan
            .replace(/_(?!_)/g, "\\_")
            // Escape asterisks (*) agar tidak jadi bold jika diperlukan
            .replace(/\*(?!\*)/g, "\\*");
        }
        
                ctx.reply(escapeMarkdownV2s(
                  `*Syarat dan Ketentuan Pembelian*\n\n${getSnk(userOrders[ctx.from.id].productId)}`),
                  { parse_mode: "MarkdownV2" }
                );
        let suc = `*PEMBELIAN BERHASIL ✅* 
Terima kasih, Telah melakukan pembelian produk kami!  

*Rincian Pesanan:* 
╭──────────────╮  
| *Produk :* ${userOrders[chatId].produk}
│ *Variasi :* ${userOrders[chatId].varian}
│ *Jumlah Pesanan :* x${userOrders[chatId].jumlahPesanan}  
│ *Total Pembayaran :* ${ParseIdr(response.data.data.data.amount)} 
╰──────────────╯  

ID Transaksi:  
\`\`\`${transactionId}\`\`\`
`
let sucs = `*PRODUK DIBELI ✅*  

*Rincian Pesanan:* 
╭──────────────╮  
| *Nama :* ${ctx.from.first_name}
| *Produk :* ${userOrders[chatId].produk}
│ *Variasi :* ${userOrders[chatId].varian}
│ *Jumlah Pesanan :* x${userOrders[chatId].jumlahPesanan} 
│ *Methode :* QRIS ${response.data.data.data.gateway}
│ *Total Pembayaran :* ${ParseIdr(response.data.data.data.amount)} 
│ *Tanggal :* ${tanggal} ${jam}
╰──────────────╯  

ID Transaksi:  
\`\`\`${transactionId}\`\`\`

`
simpanTransaksi(chatId, userOrders, transactionId, response.data.data.data.amount, tanggal, jam, formattedDataproduk)
await ctx.replyWithDocument({ source: filePath }, { caption: escapeMarkdownV2(suc), parse_mode: "MarkdownV2" })
.then(async () => {
  await ctx.telegram.sendDocument(
    config.invoice_logger, // Ganti dengan user ID tujuan
    { source: filePath },
    {
      caption: escapeMarkdownV2(sucs),
      parse_mode: "MarkdownV2",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Chat User 📩",
              url: `tg://user?id=${chatId}`
            }
          ]
        ]
      }
    }
  )
  .then(async () => {
      
    fs.unlinkSync(filePath);
  })
  .catch((err) => {
    console.error("Gagal menghapus file:", err);
  });
})
.catch((err) => {
  console.error("Gagal Mengirim file:", err);
});
  
        return;
      }
      if (iterationCount >= maxIterations) {
        clearInterval(interval);
        console.log(`[+] Transaction Canceled: ${transactionId}`);
        await ctx.telegram.deleteMessage(chatId, e.message_id).catch(() => {});
  
        await ctx.replyWithMarkdown(
          `🛍️ *Payment Canceled*\n\`\`\`${transactionId}\`\`\`\n\nTransaksi dibatalkan karena tidak dibayar dalam waktu yang ditentukan. Silakan coba lagi.`
        );
        await ctx.telegram.sendMessage(
          config.invoice_logger, escapeMarkdownV2(
          `🔔 *Produk Qris Dibatalkan*
        
        ➜ *Nama* : ${ctx.from.first_name}
        ➜ *Product* : ${userOrders[ctx.chat.id]?.produk || "Tidak tersedia"}
        ➜ *varian* : ${userOrders[ctx.chat.id]?.varian || "Tidak tersedia"}
        ➜ *Total* : ${userOrders[ctx.chat.id]?.jumlahPesanan || 0}x
        ➜ *Username* : @${ctx.from.username || "Tidak ada username"}
        ➜ *Tanggal* : ${getDate("Asia/Jakarta")}
        ➜ *Trx ID* : \`${response.data.data.data.id}\``),
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "Link to user",
                    url: `tg://user?id=${ctx.from.id}`,
                  },
                ],
              ],
            },
          }
        );
         delete userOrders[chatId]
        return;
      }
  
      iterationCount++;
    }, 5000);
            } catch (error) {
              console.error(error);
              ctx.answerCbQuery("⚠️ Gagal membuat QRIS!");
            }
          } else {
            ctx.answerCbQuery("⚠️ Gagal mendapatkan QRIS!");
          }
        }
      );
    } catch (error) {
      console.error(error);
      ctx.answerCbQuery("⚠️ Terjadi kesalahan!");
    }
  }
}
 
    } else {
      ctx.answerCbQuery("Tidak dalam sesi checkout")
      ctx.deleteMessage()
    }
  });
    bot.command('batalorder', (ctx) => {
        const userId = ctx.from.id;
        if (userOrders[userId]) {
      delete userOrders[userId]
      ctx.reply(
        `Transaksi Berhasil dibatalkan.`, {
          show_alert: true,
        }
      )
    }  else {
      ctx.reply(
        `Kamu tidak memiliki transaksi aktif.`
      )
    }
    })
  bot.action('batal_order', async (ctx) => {
    const userId = ctx.from.id
    if (userOrders[userId]) {
      delete userOrders[userId]
      ctx.answerCbQuery(
        `Transaksi Berhasil Dibatalkan.`, {
          show_alert: true,
        }
      ).then(() => {
        ctx.deleteMessage().then(() => {
          return
        })
      })
    }  else {
      ctx.answerCbQuery(
        `Kamu tidak memiliki transaksi aktif.`, {
          show_alert: true,
        }
      ).catch(() => {
        ctx.reply('Kamu tidak memiliki transaksi aktif.')
      })
    }
  })
  
   bot.action(/batal_order1_(.+)/, async (ctx) => {
  const id = ctx.match[1]?.trim();
  const userId = ctx.from.id;
  const chatId = ctx.chat.id;

  const fs = require("fs");
  const path = require("path");

  const SESSION_FILE = path.join(__dirname, "../resources/database/sessionTrx&deposit.json");

  const readSessionDeposit = () => {
    if (!fs.existsSync(SESSION_FILE)) {
      fs.writeFileSync(SESSION_FILE, JSON.stringify([]));
    }
    return JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
  };

  const writeSessionDeposit = (data) => {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
  };

  const deleteSessionDeposit = (id) => {
    let sessionDeposit = readSessionDeposit();
    const sessionToDelete = sessionDeposit.find(session => session.id === id);

    if (!sessionToDelete) {
      console.log(`❌ Session dengan ID ${id} tidak ditemukan.`);
      return false;
    }

    const newSessions = sessionDeposit.filter(session => session.id !== id);
    writeSessionDeposit(newSessions);
    console.log(`✅ Session dengan ID ${id} berhasil dihapus.`);

    return sessionToDelete; // kembalikan data yang dihapus
  };

  const deletedSession = deleteSessionDeposit(id);
  if (deletedSession) {
    const detail = deletedSession.depositDetails;

    await ctx.reply(`✅ Order dengan ID ${id} telah *dibatalkan*.`, {
      parse_mode: "Markdown"
    });
ctx.deleteMessage()
    // Kirim log ke invoice_logger
    await ctx.telegram.sendMessage(
      config.invoice_logger,
      escapeMarkdownV2(
        `🔔 *Produk Qris Dibatalkan*
➜ *Nama* : ${ctx.from.first_name}
➜ *Product* : ${detail.produk || "Tidak tersedia"}
➜ *varian* : ${detail.produk_nama || "Tidak tersedia"}
➜ *Total* : ${detail.cart || 0}x
➜ *Username* : @${ctx.from.username || "Tidak ada username"}
➜ *Tanggal* : ${getDate("Asia/Jakarta")}
➜ *Trx ID* : \`${detail.depo_id || id}\``
      ),
      {
        parse_mode: "MarkdownV2",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "who?",
                url: `tg://user?id=${ctx.from.id}`,
              },
            ],
          ],
        },
      }
    );
  } else {
    ctx.reply(`❌ Order dengan ID ${id} *tidak ditemukan*.`, {
      parse_mode: "Markdown"
    });
  }
});


  bot.action(/buy_(\d+)_(\d+)/, async (ctx) => {
    const productId = ctx.match[1];
    const userId = ctx.from.id;
    const categId = ctx.match[2];
    // Ambil data produk dari database
    db.get(
      `SELECT list.id, list.nameproduct, list.price, COUNT(stock.id) AS stock_count
			FROM list
			LEFT JOIN stock ON list.id = stock.id
			WHERE list.id = ?
			GROUP BY list.id, list.nameproduct, list.price`,
      [productId],
      async (err, product) => {
        if (err || !product)
          return ctx.answerCbQuery("⚠️ Produk tidak ditemukan!");
        if (product.stock_count <= 0)
          return ctx.answerCbQuery("⚠️ Stok habis!");
        userOrders[userId] = {
          user: ctx.from.username,
          productId,
          idProduk: categId,
          jumlahPesanan: 1,
          produk: "",
          varian: "",
          price: Number(product.price),
          totalPrice: 0,
          produkId: categId,
          trxid: "",
          status: "pending",
        };
        await sendOrderMessage(ctx, product, 1);
      }
    );
  });
  bot.action(/increase_(\d+)/, async (ctx) => {
    const productId = ctx.match[1];
    const userId = ctx.from.id;
    if (!userOrders[userId] || userOrders[userId].productId !== productId)
      return;

    userOrders[userId].jumlahPesanan++;
    db.get(
      `SELECT list.id, list.nameproduct, list.price, COUNT(stock.id) AS stock_count
			FROM list
			LEFT JOIN stock ON list.id = stock.id
			WHERE list.id = ?
			GROUP BY list.id, list.nameproduct, list.price`,
      [productId],
      async (err, product) => {
        if (err || !product)
          return ctx.answerCbQuery("⚠️ Produk tidak ditemukan!");
        await sendOrderMessage(ctx, product, userOrders[userId].jumlahPesanan);
      }
    );
  });

  // Tombol ➖ untuk mengurangi jumlah pesanan
  bot.action(/decrease_(\d+)/, async (ctx) => {
    const productId = ctx.match[1];
    const userId = ctx.from.id;
    if (!userOrders[userId] || userOrders[userId].productId !== productId)
      return;

    if (userOrders[userId].jumlahPesanan > 1) {
      userOrders[userId].jumlahPesanan--;
    }

    db.get(
      `SELECT list.id, list.nameproduct, list.price, COUNT(stock.id) AS stock_count
			FROM list
			LEFT JOIN stock ON list.id = stock.id
			WHERE list.id = ?
			GROUP BY list.id, list.nameproduct, list.price`,
      [productId],
      async (err, product) => {
        if (err || !product)
          return ctx.answerCbQuery("⚠️ Produk tidak ditemukan!");
        await sendOrderMessage(ctx, product, userOrders[userId].jumlahPesanan);
      }
    );
  });

  // Tombol 🔄 Refresh untuk memperbarui pesan
  bot.action(/refresh_(\d+)/, async (ctx) => {
    const productId = ctx.match[1];
    const userId = ctx.from.id;
    if (!userOrders[userId] || userOrders[userId].productId !== productId)
      return;

    db.get(
      `SELECT list.id, list.nameproduct, list.price, COUNT(stock.id) AS stock_count
			FROM list
			LEFT JOIN stock ON list.id = stock.id
			WHERE list.id = ?
			GROUP BY list.id, list.nameproduct, list.price`,
      [productId],
      async (err, product) => {
        if (err || !product)
          return ctx.answerCbQuery("⚠️ Produk tidak ditemukan!");
        await sendOrderMessage(ctx, product, userOrders[userId].jumlahPesanan);
      }
    );
  });

  // Tombol ⬅️ Back untuk kembali
  bot.action("back", async (ctx) => {
    await ctx.editMessageText("⬅️ Kembali ke menu utama.", {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("🔙 Kembali ke daftar produk", "menu")],
      ]),
    });
  });
  bot.action(/refreshdpi_(\d+)/, async (ctx) => {
    try {
      function escapeMarkdownV2(text) {
        return text
          .replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, "\\$1") // Escape karakter khusus
          .replace(/\\(\*)/g, "$1") // Kembalikan * agar bold/italic tetap bisa digunakan
          .replace(/\\(_)/g, "$1"); // Kembalikan _ agar italic tetap bisa digunakan
      }

      const inputCategory = ctx.match[1].toLowerCase();
      const categories = JSON.parse(
        fs.readFileSync("./resources/database/produk.json", "utf8")
      );
      const categoryData = categories.find(
        (cat) =>
          String(cat.id) === inputCategory ||
          cat.produkName.toLowerCase() === inputCategory
      );

      if (!categoryData) {
        return;
      }

      const produkId = categoryData.id;
      const produkName = categoryData.produkName;
      const produkDeskripsi =
        categoryData.produkDeskripsi || "Tidak ada deskripsi";
      // consKategori
      const produkIdd = categoryData.produkId;

      db.all(
        `SELECT list.id, list.category, list.nameproduct, list.price, COUNT(stock.id) AS stock_count 
				FROM list 
				LEFT JOIN stock ON list.id = stock.id 
				WHERE list.category = ? 
				GROUP BY list.id, list.category, list.nameproduct, list.price`,
        [produkIdd],
        async (err, rows) => {
          if (err) {
            console.error("Database error:", err);
            await ctx.reply("⚠️ Gagal mengambil data, coba lagi!");
            return;
          }

          if (rows.length === 0) {
            await ctx.reply(`⚠️ Produk *${produkName}* tidak memiliki item.`, {
              parse_mode: "Markdown",
            });
          } else {
            let response = `╭─────────────────✧\n`;
            let buttons = [];
            let totalTerjual = 0;

            // Ambil data terjual dari itemcounter.json
            const itemCounterDatas = fs.readFileSync(
              "./resources/database/itemcounter.json",
              "utf8"
            );
            const itemCounterData = JSON.parse(itemCounterDatas);
            rows.forEach((row) => {
              const stockCount = row.stock_count || 0;
              const terjualData = itemCounterData.find(
                (item) => item.id === row.id
              );
              const terjual = terjualData ? terjualData.total : 0;
              totalTerjual += terjual;
            });
            response += `┊・ *Produk :* ${produkName.toUpperCase()}\n`;
            response += `┊・ *Deskripsi :* ${produkDeskripsi}\n`;
            response += `┊・ *Stok Terjual :* ${totalTerjual}\n`;
            response += "╰─────────────────✧\n";
            response += "╭─────────────────✧\n";
            response += "┊ *Variasi, Harga & Stok:*\n";

            rows.forEach((row) => {
              const stockCount = row.stock_count || 0;
              response += `┊・ ${row.nameproduct}: ${row.price} - *Stok :* ${stockCount}\n`;

              buttons.push(
                Markup.button.callback(
                  `${row.nameproduct} - ${row.price}`,
                  `buy_${row.id}_${produkId}`
                )
              );
            });

            response += "╰─────────────────✧\n";
            response += `➤ *Refresh at* ${new Date().toLocaleTimeString(
              "id-ID"
            )} *WIB*\n`;

            // Tombol Refresh
            buttons.push(
              Markup.button.callback("↻ Refresh", `refreshdpi_${produkId}`)
            );

            await ctx.editMessageText(response, {
              parse_mode: "Markdown",
              ...Markup.inlineKeyboard(buttons, { columns: 2 }),
            }).then (() => {
              ctx.answerCbQuery("✅ Data diperbarui!");
            }).catch((error) => {
              ctx.reply(escapeMarkdownV2(response), {
                parse_mode: "MarkdownV2",
                ...Markup.inlineKeyboard(buttons, { columns: 2 }),
              })
            });
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  });
  bot.hears("Riwayat Transaksi", async (ctx) => {
    const userId = ctx.from.id;
    const userTransactions = getUserTransactions(userId);

    if (userTransactions.length === 0) {
        return ctx.reply(escapeMarkdownV2("📭 *Anda belum memiliki riwayat transaksi.*"), { parse_mode: 'Markdown' });
    }
    const totalTransaksi = userTransactions.length;
    const totalBelanja = userTransactions.reduce((acc, trx) => acc + trx.total, 0);
    let message = `╭────────────✧\n┊ 📜 *RIWAYAT TRANSAKSI*\n┊─────────────\n`;

    userTransactions.slice(-5).forEach(trx => { // Ambil 5 transaksi terakhir
        message += `┊ *ID :* ${trx.id_transaksi}\n`;
        message += `┊ *Tanggal :* ${trx.tanggal}\n`;
        message += `┊ *Produk :* ${trx.varian} (${trx.produk})\n`;
        message += `┊ *Metode :* ${trx.metode}\n`;
        message += `┊ *Total :* Rp ${trx.total.toLocaleString('id-ID')}\n┊\n`;
    });

    message += `┊ 💼 *Total Transaksi :* ${totalTransaksi} kali\n`;
    message += `┊ 💵 *Total Belanja :* Rp ${totalBelanja.toLocaleString('id-ID')}\n`;
    message += `╰────────────✧\n`;

    await ctx.reply(escapeMarkdownV2(message), { parse_mode: 'Markdown' });
  })
bot.hears("✨ Produk Populer", async (ctx) => {
  const transactions = JSON.parse(fs.readFileSync("./resources/database/listTransaksi.json", "utf8"));
  const productCount = {};
    
  transactions.forEach(trx => {
      const key = `${trx.varian}`;
      productCount[key] = (productCount[key] || 0) + trx.jumlah;
  });
  const popularProducts = Object.entries(productCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

  let message = `📊 *PRODUK TERLARIS* 📊\n\n`;
  const medals = ['🥇', '🥈', '🥉', ...Array(7).fill('🏅')];
  
  popularProducts.forEach(([produk, jumlah], index) => {
      message += `${medals[index]} *${produk}* — ${jumlah}x\n`;
  });

  message += `\n🔥 *Beli sekarang sebelum kehabisan!*`;
  await ctx.reply(message, { parse_mode: 'Markdown' });
});
  bot.on("text", async (ctx, next) => {
    const chatId = ctx.message.chat.id;
    const inputCategory = ctx.message.text.trim().toLowerCase();
    const categories = JSON.parse(
      fs.readFileSync("./resources/database/produk.json", "utf8")
    );
    const categoryData = categories.find(
      (cat) =>
        String(cat.id) === inputCategory ||
        cat.produkName.toLowerCase() === inputCategory
    );

    if (!categoryData) {
      return;
    }

    const produkId = categoryData.id;
    const produkName = categoryData.produkName;
    const produkDeskripsi =
      categoryData.produkDeskripsi || "Tidak ada deskripsi";
    // consKategori
    const produkIdd = categoryData.produkId;

    db.all(
      `SELECT list.id, list.category, list.nameproduct, list.price, COUNT(stock.id) AS stock_count 
            FROM list 
            LEFT JOIN stock ON list.id = stock.id 
            WHERE list.category = ? 
            GROUP BY list.id, list.category, list.nameproduct, list.price`,
      [produkIdd],
      async (err, rows) => {
        if (err) {
          console.error("Database error:", err);
          await ctx.reply("⚠️ Gagal mengambil data, coba lagi!");
          return;
        }

        if (rows.length === 0) {
          await ctx.reply(`⚠️ Produk *${produkName}* tidak memiliki item.`, {
            parse_mode: "Markdown",
          });
        } else {
          let response = `╭─────────────────✧\n`;
          let buttons = [];
          let totalTerjual = 0;

        // Baca list transaksi
const transaksiData = JSON.parse(
  fs.readFileSync("./resources/database/listTransaksi.json", "utf8")
);

// Hitung total stok terjual berdasarkan produkId
totalTerjual = transaksiData
  .filter((trx) => trx.produkId === produkIdd) // Sesuaikan dengan produkId yang dipilih
  .reduce((sum, trx) => sum + (trx.jumlah || 0), 0);

          response += `┊・ *Produk :* ${produkName.toUpperCase()}\n`;
          response += `┊・ *Deskripsi :* ${produkDeskripsi}\n`;
          response += `┊・ *Stok Terjual :* ${totalTerjual}\n`;
          response += "╰─────────────────✧\n";
          response += "╭─────────────────✧\n";
          response += "┊ *Variasi, Harga & Stok:*\n";

          rows.forEach((row) => {
            const stockCount = row.stock_count || 0;
            response += `┊・ ${row.nameproduct}: ${row.price} - *Stok :* ${stockCount}\n`;

            buttons.push(
              Markup.button.callback(
                `${row.nameproduct} - ${row.price}`,
                `buy_${row.id}_${produkId}`
              )
            );
          });

          response += "╰─────────────────✧\n";
          response += `➤ *Refresh at* ${new Date().toLocaleTimeString(
            "id-ID"
          )} *WIB*\n`;

          // Tombol Refresh
          buttons.push(
            Markup.button.callback("↻ Refresh", `refreshdpi_${produkId}`)
          );

          await ctx.reply(response, {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard(buttons, { columns: 2 }),
          });
        }
      }
    );
    await next();
  });
};
const ParseIdr = (number) => {
  const idr = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
  return idr;
};
function getPopularProducts() {
  const fs = require('fs')
  const transactions = JSON.parse(fs.readFileSync("./resources/database/listTransaksi.json", "utf8"));
  const productCount = {};

  transactions.forEach(trx => {
      if (!productCount[trx.produk]) {
          productCount[trx.produk] = 0;
      }
      productCount[trx.produk] += trx.jumlah;
  });

  return Object.entries(productCount)
      .sort((a, b) => b[1] - a[1]) // Urutkan dari terbanyak dibeli
      .slice(0, 10); // Ambil 10 produk teratas
}
function getUserTransactions(userId) {
  const transactions = JSON.parse(fs.readFileSync("./resources/database/listTransaksi.json", "utf8"));
  return transactions.filter(trx => trx.user_id === userId);
}
function simpanTransaksi(chatId, userOrders, transactionId, amount, tanggal, jam, stock) {
  const path = './resources/database/listTransaksi.json';
    let transaksiBaru = {
      id: userOrders[chatId].produkId,
      varianId: userOrders[chatId].productId,
      produkId: userOrders[chatId].idProduk,
      id_transaksi: transactionId,
      user_id: chatId,
      nama_user: userOrders[chatId].user || "Tidak Diketahui",
      produk: userOrders[chatId].produk,
      varian: userOrders[chatId].varian,
      jumlah: userOrders[chatId].jumlahPesanan,
      metode: "QRIS",
      total: amount,
      tanggal: `${tanggal} ${jam}`,
      stock
    };
    let transaksiList = [];
    if (fs.existsSync(path)) {
        let data = fs.readFileSync(path, 'utf8');
        try {
            transaksiList = JSON.parse(data);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            transaksiList = [];
        }
    }
    transaksiList.push(transaksiBaru);
    fs.writeFileSync(path, JSON.stringify(transaksiList, null, 2));
}