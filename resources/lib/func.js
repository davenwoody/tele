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

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./resources/database/database.db');
const fs = require('fs');
const { getDate } = require('./myfunction');
const isBanned = (sender) => {
const db = JSON.parse(fs.readFileSync('./resources/database/bannedUser.json'))
const find = db.find(db => db.sender == sender)
if(find) return true
return false
}

async function delBan(sender) {
    const dbs = JSON.parse(fs.readFileSync('./resources/database/bannedUser.json'));
    const find = dbs.find(dbs => dbs.sender === sender)
    if(!find) return false
    dbs.splice(dbs.indexOf(find), 1)
    fs.writeFileSync('./resources/database/bannedUser.json', JSON.stringify(dbs))
    return true
}
async function addBan(sender) {
    const dbs = JSON.parse(fs.readFileSync('./resources/database/bannedUser.json'));
  const find = dbs.find(dbs => dbs.sender === sender)
  if(find) return false
    dbs.push({
        sender: sender
    })
    fs.writeFileSync('./resources/database/bannedUser.json', JSON.stringify(dbs))
    return true
}
async function totalan(id, total) {
    let k;
    await new Promise((resolve, reject) => {
        db.get(`SELECT id, desc, nameproduct, price, stock FROM list WHERE id = ?`, [id], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            if (row) {
                console.log(row);
                k = parseInt(row.price) * total;
                resolve();
            } else {
                reject(new Error('No row found'));
            }
        });
    });
    return k;
}

async function getTotalStok(id) {
    let k;
    await new Promise((resolve, reject) => {
        db.get(`SELECT id, desc, nameproduct, price, stock FROM list WHERE id = ?`, [id], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            if (row) {
                k = row.stock;
                resolve();
            } else {
                reject(new Error('No row found'));
            }
        });
    });
    return k;
}
const isOnPay = (sender) => {
    const db = JSON.parse(fs.readFileSync('./resources/lib/session/onpay.json'))
    const find = db.find(db => db.chatId === sender)
    if(find) return find
    return false
}
const getSnk = (id) => {
    const db = JSON.parse(fs.readFileSync('./resources/database/snk.json'))
    const find = db.find(db => Number(db.id) === Number(id))
    if(!find) return "Tidak ada syarat dan ketentuan"
    return find.snk

}
async function getItem(id) {
    let k;
    await new Promise((resolve, reject) => {
        db.get(`SELECT id, desc, nameproduct, price, stock FROM list WHERE id = ?`, [id], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            }
            if (row) {

                k = row;
                resolve();
            } else {
               return false
            }
        });
    });
    return k
}


async function savePayment(sender,messageid, trxid, produkid, amount, price) {
    const db = JSON.parse(fs.readFileSync('./resources/lib/session/onpay.json'))
    const find = db.find(db => db.chatId === sender)
    if(find) return false
    db.push({
        chatId: sender,
        trxid: trxid,
        messageid: messageid,
        produkid: produkid,
        amount: amount,
        price: price,
        jam: getDate('Asia/Jakarta')
    })
    fs.writeFileSync('./resources/lib/session/onpay.json', JSON.stringify(db))
    return true
}

async function clearPayment(sender) {
const db = JSON.parse(fs.readFileSync('./resources/lib/session/onpay.json'))
const find = db.find(db => db.chatId === sender)
if(!find) return false
db.splice(db.indexOf(find), 1)
fs.writeFileSync('./resources/lib/session/onpay.json', JSON.stringify(db))
return true
}
async function getPayment(sender, trxid) {
    const db = JSON.parse(fs.readFileSync('./resources/lib/session/onpay.json'))
    const find = db.find(db => db.chatId === sender && db.trxid === trxid)
    if(find) return find
    return false
}

module.exports = {
    totalan,
    isBanned,
    getTotalStok,
    savePayment,
    clearPayment,
    isOnPay,
    getPayment,
    getSnk,
    delBan,
    addBan,
    getItem,
}