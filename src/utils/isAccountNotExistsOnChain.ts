// only for use of payment wallets, can't be covered with useTxPromiseHandler
const isAccountNotExistsOnChain = (error: Error | any): boolean => {
  if (error instanceof Error) {
    return error.message.includes("does not exist on chain");
  }
  return false;
};

export default isAccountNotExistsOnChain;
