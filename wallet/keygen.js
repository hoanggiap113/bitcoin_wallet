// keygen.js
const bitcoin = require('bitcoinjs-lib');
const ecc = require('tiny-secp256k1');

bitcoin.initEccLib(ecc);

function generateKeyAndAddresses() {
  // 1. tạo private key
  const keyPair = bitcoin.ECPair.makeRandom({ network: bitcoin.networks.regtest });
  const { address: p2pkh } = bitcoin.payments.p2pkh({
    pubkey: keyPair.publicKey,
    network: bitcoin.networks.regtest
  });

  const { address: p2wpkh } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network: bitcoin.networks.regtest
  });

  const { address: p2sh_p2wpkh } = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: bitcoin.networks.regtest
    }),
    network: bitcoin.networks.regtest
  });

  const wif = keyPair.toWIF();

  return {
    wif,
    addresses: {
      P2PKH: p2pkh,
      P2WPKH: p2wpkh,
      'P2SH-P2WPKH': p2sh_p2wpkh
    }
  };
}

module.exports = { generateKeyAndAddresses };
