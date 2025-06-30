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
const fs = require("fs");
let sessionTrx = {};
let sessionTrxMulti = {};
function SaveSessionTrx(
  userId,
  productName,
  productCode,
  username,
  target,
  description,
  customerNickname,
  price,
  reference
) {
  if (!sessionTrx[userId]) {
    sessionTrx[userId] = {
      transactionDetails: {
        userId: userId,
        reference: reference,
        productName: productName,
        productCode: productCode,
        username: username,
        target: target,
        description: description,
        customerNickname: customerNickname,
        price: price,
      },
      status: "ongoing",
    };
  } else {
    console.log(`User ${userId} sudah memiliki transaksi aktif.`);
  }
}
function SaveSessionTrxMulti(
  userId,
  productName,
  productCode,
  username,
  target,
  description,
  customerNickname,
  price,
  satuan,
  reference
) {
  if (!sessionTrxMulti[userId]) {
    sessionTrxMulti[userId] = {
      transactionDetails: {
        status: 'ongoing',
        userId: userId,
        reference: reference,
        productName: productName,
        productCode: productCode,
        username: username,
        target: target,
        description: description,
        customerNickname: customerNickname,
        price: price,
        harga_satuan: satuan
      },
      status: "ongoing",
    };
  } else {
    console.log(`User ${userId} sudah memiliki transaksi aktif.`);
  }
}
let sessionDeposit = {};
const SESSION_FILE = "./resources/database/sessionTrx&deposit.json";
const readSessionDeposit = () => {
  if (!fs.existsSync(SESSION_FILE)) {
    fs.writeFileSync(SESSION_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(SESSION_FILE, "utf-8"));
};
const writeSessionDeposit = (data) => {
  fs.writeFileSync(SESSION_FILE, JSON.stringify(data, null, 2));
};
const addSessionDeposit = (id, depositDetails) => {
  const sessionDeposit = readSessionDeposit();
  sessionDeposit.push({
    id,
    status: "pending",
    depositDetails,
  });

  writeSessionDeposit(sessionDeposit);
};

module.exports = {
  sessionTrx,
  sessionDeposit,
  addSessionDeposit,
  SaveSessionTrx,
    SaveSessionTrxMulti,
    sessionTrxMulti
};
