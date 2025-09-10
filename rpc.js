// rpc.js
import axios from "axios";

const rpcUser = "hoanggiap";
const rpcPassword = "123";
const rpcPort = 18443;

export async function rpcCall(method, params = []) {
  const res = await axios.post(
    `http://127.0.0.1:${rpcPort}/`,
    {
      jsonrpc: "1.0",
      id: "rpc-client",
      method,
      params,
    },
    {
      auth: { username: rpcUser, password: rpcPassword },
    }
  );
  return res.data.result;
}
