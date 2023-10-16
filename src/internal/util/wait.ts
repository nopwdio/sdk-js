export const minWait = function (mintime: number) {
  const startedAt = Date.now();
  return () => {
    const duration = Date.now() - startedAt;
    if (duration < mintime) {
      return new Promise((resolve) => setTimeout(resolve, mintime - duration));
    }

    return Promise.resolve();
  };
};

export const wait = function (time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
};
