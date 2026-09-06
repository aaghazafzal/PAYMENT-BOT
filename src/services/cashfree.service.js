import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config/env.js';

const getBaseUrl = () => {
  return config.cashfree.env === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
};

const getHeaders = () => ({
  'x-client-id': config.cashfree.appId,
  'x-client-secret': config.cashfree.secretKey,
  'x-api-version': config.cashfree.apiVersion,
  'Content-Type': 'application/json',
});

/**
 * Creates a Cashfree Order (v3 API)
 */
export async function createCashfreeOrder({ orderId, amount, customerId, customerPhone = '9876543210', customerEmail = 'user@univora.com' }) {
  const url = `${getBaseUrl()}/orders`;
  const payload = {
    order_id: orderId,
    order_amount: Number(amount),
    order_currency: 'INR',
    customer_details: {
      customer_id: String(customerId),
      customer_phone: customerPhone,
      customer_email: customerEmail,
    },
    order_meta: {
      return_url: `https://t.me/PAYMENT_UNIVORABOT`,
    },
  };

  try {
    const response = await axios.post(url, payload, { headers: getHeaders() });
    const data = response.data;
    
    return {
      success: true,
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      paymentLink: `${config.serverUrl}/api/v1/payment/checkout?session_id=${data.payment_session_id}`,
      data
    };
  } catch (error) {
    console.error('❌ Cashfree Order Creation Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Directly verifies Order Status from Cashfree Servers (Double Verification)
 */
export async function getCashfreeOrderStatus(orderId) {
  const url = `${getBaseUrl()}/orders/${orderId}`;
  try {
    const response = await axios.get(url, { headers: getHeaders() });
    const data = response.data;
    
    return {
      success: true,
      orderStatus: data.order_status, // PAID, ACTIVE, EXPIRED, FAILED
      orderAmount: data.order_amount,
      orderCurrency: data.order_currency,
      cfPaymentId: data.cf_payment_id || (data.order_payments && data.order_payments[0]?.payment_id) || '',
      data
    };
  } catch (error) {
    console.error(`❌ Cashfree Status Fetch Error for ${orderId}:`, error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

/**
 * Validates Cashfree Webhook HMAC SHA-256 Signature
 */
export function verifyCashfreeWebhookSignature(rawBody, signature, timestamp) {
  if (!signature || !timestamp || !config.cashfree.secretKey) {
    return false;
  }
  try {
    const dataToSign = timestamp + rawBody;
    const expectedSignature = crypto
      .createHmac('sha256', config.cashfree.secretKey)
      .update(dataToSign)
      .digest('base64');
    
    return expectedSignature === signature;
  } catch (err) {
    console.error('❌ HMAC Signature Verification Failed:', err);
    return false;
  }
}
