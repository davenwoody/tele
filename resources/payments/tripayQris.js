const axios = require('axios');
const crypto = require('crypto');

/**
 * QRIS payment gateway integration using Tripay API.
 * See: https://tripay.co.id/developer for full documentation.
 *
 * Required environment variables (put in .env):
 *  TRIPAY_API_KEY       : Your Tripay api-key
 *  TRIPAY_MERCHANT_CODE : Your Tripay merchant code (eg: T1234)
 *  TRIPAY_PRIVATE_KEY   : The private key used to create the signature
 *  TRIPAY_CALLBACK_URL  : (optional) Callback webhook to receive status update
 */
const {
  TRIPAY_API_KEY,
  TRIPAY_MERCHANT_CODE,
  TRIPAY_PRIVATE_KEY,
  TRIPAY_CALLBACK_URL,
} = process.env;

const BASE_URL = 'https://tripay.co.id/api';

function makeSignature(merchantRef, amount) {
  /**
   * Signature generator according to Tripay docs:
   * sha256(merchant_code + merchant_ref + amount + private_key)
   */
  const raw = TRIPAY_MERCHANT_CODE + merchantRef + amount + TRIPAY_PRIVATE_KEY;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

async function createQrisInvoice({
  reference, // unique order id
  amount, // integer
  customerName = '-',
  customerEmail = '-',
  expiredTime = 7200, // seconds (default 2 hours)
  metadata = {}, // additional data to be returned via callback
}) {
  if (!TRIPAY_API_KEY || !TRIPAY_MERCHANT_CODE || !TRIPAY_PRIVATE_KEY) {
    throw new Error('Tripay env vars not defined');
  }

  const body = {
    method: 'QRIS',
    merchant_ref: reference,
    amount: amount,
    signature: makeSignature(reference, amount),
    customer_name: customerName,
    customer_email: customerEmail,
    expired_time: Math.floor(Date.now() / 1000) + expiredTime,
    callback_url: TRIPAY_CALLBACK_URL,
    order_items: [
      {
        sku: reference,
        name: 'Telegram Order',
        price: amount,
        quantity: 1,
        product_url: 'https://t.me/'
      },
    ],
    metadata,
  };

  const { data } = await axios.post(`${BASE_URL}/transaction/create`, body, {
    headers: {
      Authorization: `Bearer ${TRIPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (data?.success === false) throw new Error(JSON.stringify(data));

  return data?.data;
}

async function getTransactionDetail(reference) {
  const { data } = await axios.get(`${BASE_URL}/transaction/detail?reference=${reference}`, {
    headers: { Authorization: `Bearer ${TRIPAY_API_KEY}` },
  });
  if (data?.success === false) throw new Error(JSON.stringify(data));
  return data?.data;
}

module.exports = { createQrisInvoice, getTransactionDetail };