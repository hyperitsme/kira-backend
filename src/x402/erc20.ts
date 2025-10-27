export const erc20Abi = [
  { "type":"function","name":"decimals","inputs":[],"outputs":[{"type":"uint8"}], "stateMutability":"view" },
  { "type":"function","name":"balanceOf","inputs":[{"name":"a","type":"address"}],"outputs":[{"type":"uint256"}],"stateMutability":"view" },
  { "type":"function","name":"transfer","inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"outputs":[{"type":"bool"}],"stateMutability":"nonpayable" }
];
