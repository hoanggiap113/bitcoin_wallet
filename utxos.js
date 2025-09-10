// utxos.js
import { rpcCall } from "./rpc.js";

/**
 * Lấy UTXOs từ địa chỉ (ngoài bitcoin-core thì dùng scantxoutset)
 */
export async function getUtxos(address) {
  const res = await rpcCall("scantxoutset", ["start", [`addr(${address})`]]);
  return res.unspents;
}

/**
 * Chọn ít UTXO nhất đủ để gửi amount
 * - Sắp xếp UTXO theo amount tăng dần
 * - Ưu tiên chọn 1 UTXO đủ cover amount (nếu có)
 * - Nếu không, gộp nhiều UTXO nhỏ nhất cho đến khi đủ
 */
export function selectUtxos(utxos, amount) {
  // convert amount to satoshis
  const target = Math.round(amount * 1e8);

  // sort by value ascending
  const sorted = utxos
    .map(u => ({ ...u, sat: Math.round(u.amount * 1e8) }))
    .sort((a, b) => a.sat - b.sat);

  // Tìm 1 UTXO duy nhất đủ cover
  const single = sorted.find(u => u.sat >= target);
  if (single) {
    return { selected: [single], change: single.sat - target };
  }

  // 2. gộp nhiều UTXO nhỏ
  let selected = [];
  let total = 0;
  for (let u of sorted) {
    selected.push(u);
    total += u.sat;
    if (total >= target) break;
  }

  if (total < target) throw new Error("Not enough balance");
  return { selected, change: total - target };
}
