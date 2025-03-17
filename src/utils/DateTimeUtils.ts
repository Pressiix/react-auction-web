export const getCurrentUnixTimestamp = () => {
  return Math.floor(new Date().getTime() / 1000);
};
