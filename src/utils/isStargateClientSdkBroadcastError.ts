const isStargateClientSdkBroadcastError = (
  error: Error | any,
): error is Error => {
  if (error instanceof Error) {
    return error.message.includes("Broadcasting transaction failed with code");
  }
  return false;
};

export { isStargateClientSdkBroadcastError };
