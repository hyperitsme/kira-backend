import axios from 'axios';

export async function scanDexTopMovers(limit = 20) {
  const url = `${process.env.DEXSCREENER_HTTP}/dex/tokens/latest`;
  const { data } = await axios.get(url, { timeout: 7000 });
  const list = Array.isArray(data?.pairs) ? data.pairs : (Array.isArray(data) ? data : []);
  const scored = list.map((p:any) => {
    const ch = Number(p?.priceChange?.h1 ?? 0);
    const vol = Number(p?.volume?.h1 ?? 0);
    return {
      symbol: p?.baseToken?.symbol,
      pairAddress: p?.pairAddress,
      chainId: p?.chainId,
      h1Change: ch,
      h1Vol: vol,
      url: p?.url
    };
  }).sort((a:any,b:any) => (b.h1Change * Math.log10(1+b.h1Vol)) - (a.h1Change * Math.log10(1+a.h1Vol)));
  return scored.slice(0, limit);
}

export function validityScore(precision90d: number, confPattern: number, confRegime: number) {
  return Math.max(0, Math.min(1, precision90d * confPattern * confRegime));
}
