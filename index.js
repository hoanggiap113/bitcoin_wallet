// main.js
import { getUtxos, selectUtxos } from "./utxos.js";
import { rpcCall } from "./rpc.js";
import { buildTxP2PKH, buildTxP2SH_P2WPKH, buildTxP2WPKH } from "./buildTx.js";

// ---- Config ----
const myAddress = "2N4RykdH9ohcMDqzD9RSqmkhkSE8FRfsD5c"; 
const myWIF = "cU3apHJYeZNvuNKinDTViJWyWQPx2A9M26EUAZU3zUrCtQAd9Y5W"; // thay bằng WIF
const destAddr = "bcrt1qcl8ajzlaax8s3gu2xl3pmdmnzjh5k9skad5x9a"; 
const ADDRESS_TYPE = "p2sh-p2wpkh"; // "p2pkh" | "p2sh-p2wpkh" | "p2wpkh"
const SEND_AMOUNT = 10; // BTC

async function main() {
  console.log("🔍 Lấy UTXOs...");
  let utxos = await getUtxos(myAddress);
  console.log("UTXOs:", utxos);

  console.log("📦 Chọn UTXOs...");
  const { selected, change } = selectUtxos(utxos, SEND_AMOUNT);
  console.log("Selected UTXOs:", selected);

  let rawTx;

  if (ADDRESS_TYPE === "p2pkh") {
    // cần raw tx cho từng UTXO
    const rawTxMap = {};
    for (let u of selected) {
      const raw = await rpcCall("getrawtransaction", [u.txid]);
      rawTxMap[u.txid] = raw;
    }
    rawTx = buildTxP2PKH(selected, destAddr, SEND_AMOUNT, myAddress, myWIF, rawTxMap);
  } else if (ADDRESS_TYPE === "p2sh-p2wpkh") {
    rawTx = buildTxP2SH_P2WPKH(selected, destAddr, SEND_AMOUNT, myAddress, myWIF);
  } else {
    rawTx = buildTxP2WPKH(selected, destAddr, SEND_AMOUNT, myAddress, myWIF);
  }

  console.log("📝 Raw TX:", rawTx);

  console.log("📡 Broadcast...");
  const txid = await rpcCall("sendrawtransaction", [rawTx]);
  console.log("✅ TX Broadcasted:", txid);
}

main().catch(err => console.error("❌ Error:", err));
