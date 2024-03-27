const isRequestRejectedError = (error: Error | any): boolean => {
  if (error instanceof Error) {
    const errorMessage = error.message;
    if (errorMessage === "Request rejected") return true;
  }
  return false;
};

export { isRequestRejectedError };
