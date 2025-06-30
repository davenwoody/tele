const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const QRCode = require('qrcode');
const axios = require('axios');
 const fs = require('fs')
// Koneksi ke MongoDB
const uri = 'mongodb+srv://davenswoody:YxcJ1fez3RO3Ud5p@cluster0.sxgjfit.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);
let db;

async function connectDB() {
    if (db) return db; // Hindari koneksi ganda
    try {
        await client.connect();
        db = client.db();
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        return("Gagal menghubungkan ke database");
    }
}

function getCollection(name) {
    if (!db) return("Database not connected");
    return db.collection(name);
}

async function generateApiKey(namaUser) {
    await connectDB();
    const apiKeys = getCollection('ApiKey');
    const existingUser = await apiKeys.findOne({ nama: namaUser });
    if (existingUser) return(`User ${namaUser} sudah memiliki API key.`);
    const newApiKey = { nama: namaUser, apikey: crypto.randomBytes(16).toString('hex') };
    await apiKeys.insertOne(newApiKey);
    return newApiKey;
}

async function verifyApiKey(apiKey) {
    await connectDB();
    const apiKeys = getCollection('ApiKey');
    return await apiKeys.findOne({ apikey: apiKey }) !== null;
}

async function tambahMutasi(apiKey, data) {
    await connectDB();
    if (!(await verifyApiKey(apiKey))) return { error: "Invalid API key" };
    const mutasi = getCollection('Mutasi');
    const newMutasi = { apikey: apiKey, ...data };
    await mutasi.insertOne(newMutasi);
    return { success: true, data: newMutasi };
}

async function tambahKodeUnik(apiKey, id, amount, fee) {
    await connectDB();
    if (!(await verifyApiKey(apiKey))) return('API key tidak valid!');
    const kodeUnikCollection = getCollection('KodeUnik');
    let kodeUnik = 1;
    let totalAmount = amount + fee + kodeUnik;
    while (await kodeUnikCollection.findOne({ apikey: apiKey, total_amount: totalAmount })) {
        kodeUnik++;
        if (kodeUnik > 500) kodeUnik = 1;
        totalAmount = amount + fee + kodeUnik;
    }
    const newEntry = { apikey: apiKey, id, kode_unik: kodeUnik, amount, fee, total_amount: totalAmount, status: "Berlangsung" };
    await kodeUnikCollection.insertOne(newEntry);
    return newEntry;
}

async function cekMutasi(apiKey, refId) {
    await connectDB();
    if (!(await verifyApiKey(apiKey))) return('API key tidak valid!');
    const mutasi = getCollection('Mutasi');
    const existing = await mutasi.findOne({ ref_id: refId, apikey: apiKey });
    return existing ? { status: 'diprocess' } : { status: 'not_found', error: 'ref_id not found' };
}


// Fungsi untuk menghasilkan QRIS

function toCRC16(str) {
    let crc = 0xFFFF;
    for (let c = 0; c < str.length; c++) {
        crc ^= str.charCodeAt(c) << 8;
        for (let i = 0; i < 8; i++) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

// Fungsi untuk membuat QRIS string dan gambar
async function generateQris(apiKey, amount, fee, unik, dataQris) {
    if (!apiKey || amount === undefined || fee === undefined || unik === undefined || !dataQris) {
       return('Missing required fields');
    }
    if (!(await verifyApiKey(apiKey))) return('API key tidak valid!');
    if (amount < 1) return('Minimal deposit adalah 1!');
    
    const total = amount + fee + unik;
    const nominalStr = total.toString();
    let qrisBase = dataQris.slice(0, -4).replace("010211", "010212");
    let qrisParts = qrisBase.split("5802ID");
    let uang = "54" + nominalStr.length.toString().padStart(2, "0") + nominalStr + "5802ID";
    let qrisString = qrisParts[0] + uang + qrisParts[1];
    qrisString += toCRC16(qrisString);
    return {
        status: "success",
        message: "QRIS string berhasil dibuat!",
        qris_string: qrisString,
        total: total,
    };
}


module.exports = { connectDB, generateApiKey, tambahMutasi, cekMutasi, tambahKodeUnik, generateQris };
