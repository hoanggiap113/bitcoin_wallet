1. Chuẩn bị:
    1. Tạo thư mục Bitcoin vào đường dẫn C:\Users\{YourUserName}\AppData\Roaming.
    4. Tạo bitcoin.conf vào thư mục Bitcoin vừa tạo ở bước 1.
    5. Vào file bitcoin.conf điền thông số sau regtest=1 server=1 daemon=1 rpcuser=yourusername rpcpassword=yourpassword rpcallowip=127.0.0.1 fallbackfee=0.0001 txindex=1
    6. Vào cmd(window) chạy lệnh: (Nếu chưa set Path Variable thì hãy set trước)
        bitcoind -regtest -txindex -daemon
    7. Tạo ví: 
        bitcoin-cli -regtest createwallet "testwallet"
    8. Load lại ví wallet (Trong trường hợp reset regtest) 
        bitcoin-cli loadwallet "testwallet"
    9. Ví này sẽ được lưu ở trong bitcoin-core/testwallet file, và ví này sẽ có luôn privateKey 
        bitcoin-cli -regtest getnewaddress // Lệnh này tạo địa chỉ ví, nó sẽ trả về dưới dạng như: bcrt1qz5f6ktsblablabla....
    10. Generate 1st 101 Blocks to Fund the Wallet (miner):
        bitcoin-cli -regtest generatetoaddress 101 bcrt1qz5f6kts27vq6rer3qkwdzfr0zlptwgyetwlm6m
    11. Check the Wallet Balance 
        bitcoin-cli -regtest getbalance
    12. Generate a new block to confirm transaction(Require) 
        bitcoin-cli -regtest generatetoaddress 1 bcrt1qz5f6kts27vq6rer3qkwdzfr0zlptwgyetwlm6m // Địa chỉ ví đào đã tạo ở bước 9
    13. Check the transaction details bitcoin-cli -regtest gettransaction <txId>
    14. Check balance of the receiving address 
        bitcoin-cli -regtest listunspent // Check UTXO cho ví ở bitcoin-core (step 9) 
        bitcoin-cli -regtest scantxoutset start '["addr(bcrt1qexampleaddress)"]' // Check UTXO cho ví ngoài bitcoin-core (for example in step 15) //Là ví được tạo bên ngoài bằng code ví dụ như javascript(NodeJS) hoặc python....
    15. Run file KeyBitcoin_encrypt.js(File để tạo địa chỉ ví //Cái này tự code) // to generate some random bitcoin address :P2WPKH", "P2SH-P2WPKH", "P2PKH"
    16. Send Bitcoin from the miner's wallet (testwallet file) to the new address generated above (remember that if we restart shut down or bitcoin network, we need to load wallet in order to perform this step. Load wallet is wallet of miner, which is generated in step 7 and 8) 
        bitcoin-cli -regtest sendtoaddress <destination_address> <amount>
    17. Repeat step 16 for several times to generated many UTXOs
