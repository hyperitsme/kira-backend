import axios from 'axios';
import { ethers } from 'ethers';
import { erc20Abi } from './erc20.js';

const rpc = process.env.BASE_RPC_URL!;
const usdc = process.env.USDC_ADDRESS_BASE!;
const pk = process.env.X402_WALLET_PRIVATE_KEY!;
const provider = new ethers.JsonRpcProvider(rpc);
const wallet = new ethers.Wallet(pk, provider);
const usdcContract = new ethers.Contract(usdc, erc20Abi, wallet);

export type PaymentInstructions = {
  amount: string;   // decimal USDC
  to: string;       // Base address
  memo?: string;
  proofHeader?: string;
};

export async function sendUsdc(amountDecimal: string, to: string) {
  const decimals = 6;
  const amount = ethers.parseUnits(amountDecimal, decimals);
  const tx = await usdcContract.transfer(to, amount);
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
      const hash = await sendUsdc(instr.amount, instr.to);
      const headers: any = {};
      if (instr.proofHeader) headers[instr.proofHeader] = hash;
      const { data } = await axios.post(url, payload, { timeout: 8000, headers });
      return data;
    }
    throw e;
  }
}
