// buildTx.js
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

function sat(btc) {
  return Math.round(btc * 1e8);
}

// helper: tạo signer luôn trả Buffer
function makeSigner(keyPair) {
  return {
    publicKey: Buffer.from(keyPair.publicKey),
    sign: (hash) => Buffer.from(keyPair.sign(hash)),
  };
}

// ---------------- P2PKH ----------------
export function buildTxP2PKH(utxos, toAddress, amount, changeAddress, WIF, rawTxMap) {
  const keyPair = ECPair.fromWIF(WIF, bitcoin.networks.regtest);
  const signer = makeSigner(keyPair);
  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.regtest });

  for (let utxo of utxos) {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: Buffer.from(rawTxMap[utxo.txid], "hex"),
    });
  }

  const total = utxos.reduce((s, u) => s + u.sat, 0);
  const fee = 1000;

  // subtract fee from amount
  const sendValue = sat(amount) - fee;
  if (sendValue <= 0) throw new Error("Amount too small after subtracting fee");
  psbt.addOutput({ address: toAddress, value: sendValue });

  const change = total - sat(amount);
  if (change > 0) {
    psbt.addOutput({ address: changeAddress, value: change });
  }

  utxos.forEach((_, i) => psbt.signInput(i, signer));
  psbt.finalizeAllInputs();
  return psbt.extractTransaction().toHex();
}

// ----------- P2SH-P2WPKH ----------------
export function buildTxP2SH_P2WPKH(utxos, toAddress, amount, changeAddress, WIF) {
  const keyPair = ECPair.fromWIF(WIF, bitcoin.networks.regtest);
  const signer = makeSigner(keyPair);

  const p2wpkh = bitcoin.payments.p2wpkh({
    pubkey: signer.publicKey,
    network: bitcoin.networks.regtest,
  });

  const p2sh = bitcoin.payments.p2sh({
    redeem: p2wpkh,
    network: bitcoin.networks.regtest,
  });

  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.regtest });

  for (let utxo of utxos) {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: p2sh.output,
        value: utxo.sat,
      },
      redeemScript: p2wpkh.output,
    });
  }

  const total = utxos.reduce((s, u) => s + u.sat, 0);
  const fee = 1000;

  const sendValue = sat(amount) - fee;
  if (sendValue <= 0) throw new Error("Amount too small after subtracting fee");
  psbt.addOutput({ address: toAddress, value: sendValue });

  const change = total - sat(amount);
  if (change > 0) {
    psbt.addOutput({ address: changeAddress, value: change });
  }

  utxos.forEach((_, i) => psbt.signInput(i, signer));
  psbt.finalizeAllInputs();
  return psbt.extractTransaction().toHex();
}

// ---------------- P2WPKH ----------------
export function buildTxP2WPKH(utxos, toAddress, amount, changeAddress, WIF) {
  const keyPair = ECPair.fromWIF(WIF, bitcoin.networks.regtest);
  const signer = makeSigner(keyPair);
  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.regtest });

  for (let utxo of utxos) {
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: Buffer.from(utxo.scriptPubKey, "hex"),
        value: utxo.sat,
      },
    });
  }

  const total = utxos.reduce((s, u) => s + u.sat, 0);
  const fee = 1000;

  const sendValue = sat(amount) - fee;
  if (sendValue <= 0) throw new Error("Amount too small after subtracting fee");
  psbt.addOutput({ address: toAddress, value: sendValue });

  const change = total - sat(amount);
  if (change > 0) {
    psbt.addOutput({ address: changeAddress, value: change });
  }

  utxos.forEach((_, i) => psbt.signInput(i, signer));
  psbt.finalizeAllInputs();
  return psbt.extractTransaction().toHex();
}
