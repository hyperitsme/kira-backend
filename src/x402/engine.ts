import axios from 'axios';
import { ethers } from 'ethers';
import { erc20Abi } from './erc20.js';

function getProvider(): ethers.JsonRpcProvider | null {
  const rpc = process.env.BASE_RPC_URL;
  if (!rpc) return null;
  try { return new ethers.JsonRpcProvider(rpc); }
  catch { return null; }
}

function normalizePk(pk: string) {
  const t = pk.trim();
  if (t.startsWith('0x')) return t;
  return '0x' + t;
}

function getWallet(): ethers.Wallet | null {
  const provider = getProvider();
  const pk = process.env.X402_WALLET_PRIVATE_KEY;
  if (!provider || !pk) return null;
  try {
    return new ethers.Wallet(normalizePk(pk), provider);
  } catch {
    return null;
  }
}

function getUsdcContract(): ethers.Contract | null {
  const wallet = getWallet();
  const usdc = process.env.USDC_ADDRESS_BASE;
  if (!wallet || !usdc) return null;
  try {
    return new ethers.Contract(usdc, erc20Abi, wallet);
  } catch {
    return null;
  }
}

export type PaymentInstructions = {
  amount: string;   // decimal USDC
  to: string;       // Base address
  memo?: string;
  proofHeader?: string;
};

export async function sendUsdc(amountDecimal: string, to: string) {
  const c = getUsdcContract();
  if (!c) {
    const reason = !process.env.BASE_RPC_URL || !process.env.USDC_ADDRESS_BASE
      ? 'rpc/usdc not configured'
      : (!process.env.X402_WALLET_PRIVATE_KEY ? 'wallet key missing' : 'invalid wallet/env');
    const e: any = new Error(`x402 wallet unavailable: ${reason}`);
    e.code = 'X402_WALLET_UNAVAILABLE';
    throw e;
  }
  // USDC 6 decimals
  const amount = ethers.parseUnits(amountDecimal, 6);
  const tx = await c.transfer(to, amount);
  const receipt = await tx.wait();
  return receipt?.hash;
}

export async function fetchWith402(url: string, payload?: any) {
  try {
    const { data } = await axios.post(url, payload, { timeout: 8000 });
    return data;
  } catch (e: any) {
    if (e?.response?.status === 402) {
      const instr: PaymentInstructions = e.response.data;
      // coba bayar; kalau wallet unavailable, balikan info 402 ke caller (jangan crash)
      try {
        const hash = await sendUsdc(instr.amount, instr.to);
        const headers: any = {};
        if (instr.proofHeader) headers[instr.proofHeader] = hash;
        const { data } = await axios.post(url, payload, { timeout: 8000, headers });
        return data;
      } catch (payErr: any) {
        const err: any = new Error(payErr?.message || 'x402 payment failed');
        err.status = 503;
        err.details = { reason: payErr?.code || 'X402_PAYMENT_ERROR', hint: 'Check BASE_RPC_URL, USDC_ADDRESS_BASE, X402_WALLET_PRIVATE_KEY' };
        throw err;
      }
    }
    throw e;
  }
}
