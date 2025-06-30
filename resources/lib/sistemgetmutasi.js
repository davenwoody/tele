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
const { tambahMutasi, cekMutasi } = require('../netvance/netvancePay');
const path = require("path");
const axios = require("axios");
const SESSION_FILE = "./resources/database/sessionTrx&deposit.json";
const config = JSON.parse(fs.readFileSync("./resources/Admin/settings.json"));
const moment = require("moment-timezone");
const crypto = require("crypto");
const jam = moment.tz("asia/jakarta").format("HH:mm:ss");
const tanggal = moment().tz("Asia/Jakarta").format("ll");
const { sendProduct, getDate } = require("./myfunction");
const { getSnk } = require("./func");
function escapeMarkdownV2(text) {
  return (
    text
      // Escape karakter khusus kecuali backtick (`) agar inline code tetap didukung
      .replace(/([_*\[\]()~>#+\-=|{}.!\\])/g, "\\$1")
      // Kembalikan * dan _ agar format bold/italic tetap berfungsi
      .replace(/\\(\*)/g, "$1")
      .replace(/\\(_)/g, "$1")
  );
}
const readSessionDeposit = () => {
  if (!fs.existsSync(SESSION_FILE)) {
    fs.writeFileSync(SESSION_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const writeSessionDeposit = (data) => {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
};
const getMinutesDifference = (date1, date2) => {
  const diffMs = Math.abs(new Date(date1) - new Date(date2));
  return Math.floor(diffMs / 60000);
};
const ParseIdr = (number) => {
  const idr = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(number);
  return idr;
};
const parseDate = (dateString) => {
  const [date, time] = dateString.split(", ");
  const [day, month, year] = date.split("/");

  // Gabungkan dan konversi ke waktu Asia/Jakarta
  const localDate = new Date(`${year}-${month}-${day}T${time}`);
  const jakartaTime = new Date(
    localDate.toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );
  return jakartaTime;
};
const checkDepositStatusForAllUsers = async (kris) => {
  // Ambil waktu saat ini di Asia/Jakarta
  const nowJakarta = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );

  const sessionDeposit = readSessionDeposit();
  const pendingSessions = sessionDeposit.filter(
    (session) => session.status === "pending"
  );

  if (pendingSessions.length === 0) return;

  for (const session of pendingSessions) {
    const expiredDate = parseDate(session.depositDetails.expired);

    if (nowJakarta > expiredDate) {
      console.log(`[+] Transaction Canceled: ${session.id}`);
      session.status = "expired";
      writeSessionDeposit(
        sessionDeposit.filter((item) => item.id !== session.id)
      );
      try {
        await kris.telegram.sendMessage(
          session.depositDetails.userId,
          `🛍️ *Payment Canceled*\n\`\`\`${session.depositDetails.depo_id}\`\`\`\n\nKamu tidak dapat menyelesaikan transaksi ini lagi karena tidak membayar dalam waktu yang ditentukan, silakan coba lagi.`,
          { parse_mode: "Markdown" }
        );
        await kris.telegram
          .deleteMessage(
            session.depositDetails.userId,
            session.depositDetails.key
          )
          .catch(() => {});

        await kris.telegram.sendMessage(
          config.invoice_logger,
          `🔔 *Produk Qris Dibatalkan*\n\n➜ *Nama*: ${
            session.depositDetails.nama
          }\n➜ *Product*: ${session.depositDetails.produk_nama}\n➜ *Total*: ${
            session.depositDetails.cart
          }x\n➜ *Username*: @${
            session.depositDetails.username
          }\n➜ *Tanggal*: ${new Date().toLocaleDateString(
            "id-ID"
          )}\n➜ *Trx ID*: \`${session.depositDetails.depo_id}\``,
          {
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "who?",
                    url: `tg://user?id=${session.depositDetails.userId}`,
                  },
                ],
              ],
            },
          }
        );
      } catch (error) {
        console.error("Gagal mengirim pesan sukses:", error.message);
      }
    }
  }

  // Cek Mutasi QRIS
  try {
    const response = await axios.get(
      `https://gateway.okeconnect.com/api/mutasi/qris/${config.okeconect.merchantid}/${config.okeconect.signature}`
    );
    if (
      !response.data ||
      !response.data.data ||
      !Array.isArray(response.data.data)
    ) {
      throw new Error(
        "Respons API tidak valid atau tidak memiliki data mutasi."
      );
    }
      const depositTime = moment().tz("Asia/Jakarta").toDate();
      const depositTimes = new Date(); 
 
    const mutasiData = response.data.data;
    const validTransactions = mutasiData.filter((transaction) => {
      const transactionTime = transaction.date;
      const timeDifference = getMinutesDifference(depositTime, transactionTime);
      return transaction.type === "CR" && timeDifference <= 5;
    });

    for (const session of pendingSessions) {
      if (session.status === "expired") continue;
      const expectedAmount = parseInt(session.depositDetails.total_amount);
      const matchingTransaction = validTransactions.find(
        (transaction) => Number(transaction.amount) === expectedAmount
      );
      if (matchingTransaction) {
        const transactionRefId = matchingTransaction.issuer_reff;
        const mutasiCheckResponse = await cekMutasi(
          process.env.KROPA_API,
          transactionRefId
        );

        if (mutasiCheckResponse.status === "diprocess") {
          console.log("Transaksi ini sudah diproses sebelumnya.");
          await kris.telegram
            .deleteMessage(
              session.depositDetails.userId,
              session.depositDetails.key
            )
            .catch(() => {});
         
          writeSessionDeposit(
            sessionDeposit.filter((item) => item.id !== session.id)
          );
          continue;
        }
        session.status = "proses";
        await kris.telegram
          .deleteMessage(
            session.depositDetails.userId,
            session.depositDetails.key
          )
          .catch(() => {});
        let data = {
          buyer: session.depositDetails.userId,
          status: "success",
          ref_id: transactionRefId,
          date: matchingTransaction.date,
          saldo_diterima: session.depositDetails.total_amount,
          total_bayar: session.depositDetails.total_amount,
        };
        await tambahMutasi(process.env.KROPA_API, data);
        writeSessionDeposit(sessionDeposit);
        if (
          session.depositDetails.type === "topup" &&
          session.status === "proses"
        ) {
          console.log(`[+] Transaction Success: ${session.id}`);
          const formattedDataproduk = await sendProduct(
            session.depositDetails.id,
            session.depositDetails.cart,
            session.depositDetails.nama,
            session.depositDetails.userId
          );
          const filePath = path.join(
            __dirname,
            `${session.id}_data.txt`
          );
          fs.writeFileSync(filePath, formattedDataproduk, "utf8");
          kris.telegram.sendMessage(
            session.depositDetails.userId,
            escapeMarkdownV2(
              `*Syarat dan Ketentuan Pembelian*\n\n${getSnk(
                session.depositDetails.id 
              )}`
            ),
            { parse_mode: "MarkdownV2" }
          );

          let suc = `*PEMBELIAN BERHASIL ✅* 
Terima kasih, Telah melakukan pembelian produk kami!

*Rincian Pesanan:* 
╭─────────────────╮  
| *Produk:* ${session.depositDetails.produk}
│ *Variasi:* ${session.depositDetails.produk_nama}
│ *Jumlah Pesanan:* x${session.depositDetails.cart}  
│ *Total Pembayaran:* ${ParseIdr(session.depositDetails.total_amount)} 
╰─────────────────╯  
				
ID Transaksi:  
\`\`\`${session.id}\`\`\`

Hapyy Shopping!`;
          let sucs = `*PRODUK DIBELI ✅*  

*Rincian Pesanan:* 
╭─────────────────╮  
| *Nama:* ${session.depositDetails.nama}
| *Produk:* ${session.depositDetails.produk}
│ *Variasi:* ${session.depositDetails.produk_nama}
│ *Jumlah Pesanan:* x${session.depositDetails.cart} 
│ *Methode:* QRIS
│ *Total Pembayaran:* ${ParseIdr(session.depositDetails.total_amount)} 
│ *Tanggal:* ${tanggal} ${jam}
╰─────────────────╯  

ID Transaksi:  
\`\`\`${session.id}\`\`\`

Hapyy Shopping!`;
simpanTransaksi(session.depositDetails.userId, session, tanggal, jam, formattedDataproduk)
await kris.telegram.sendDocument(
    session.depositDetails.userId, // Ganti dengan user ID tujuan
    { source: filePath },
    {
      caption: escapeMarkdownV2(suc),
      parse_mode: "MarkdownV2"
    }
)
.then (async () => {
	await kris.telegram.sendDocument(
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
				  url: `tg://user?id=${session.depositDetails.userId}`
				}
			  ]
			]
		  }
		}
	).then(async () => {
		fs.unlinkSync(filePath);
	  })
	  .catch((err) => {
		console.error("Gagal menghapus file:", err);
	  });
})        


          writeSessionDeposit(
            sessionDeposit.filter((item) => item.id !== session.id)
          );
        }
      }
    }
  } catch (error) {
    console.log(error);
    console.error("Error saat memeriksa mutasi:", error.message);
  }
  function simpanTransaksi(chatId, session, tanggal, jam, stock) {
	const path = './resources/database/listTransaksi.json';
	  let transaksiBaru = {
		id: session.depositDetails.produkId,
		varianId: session.depositDetails.id,
		produkId: session.depositDetails.idProduk,
		id_transaksi: session.id,
		user_id: chatId,
		nama_user: session.depositDetails.nama || "Tidak Diketahui",
		produk: session.depositDetails.produk,
		varian: session.depositDetails.produk_nama,
		jumlah: session.depositDetails.cart,
		metode: "QRIS",
		total: session.depositDetails.total_amount,
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
};

module.exports = { checkDepositStatusForAllUsers };
