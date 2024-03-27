declare global {
  interface Window {
    readonly opera?: any;
  }
}

const isMobile = (): boolean => {
  return "ontouchstart" in document.documentElement;
};

export default isMobile;
