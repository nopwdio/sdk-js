export const bufferTo64Safe = function (buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return arrayTo64(bytes);
};

export const arrayTo64 = function (bytes: Uint8Array) {
  let str = "";

  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }

  const base64String = btoa(str);

  return base64String.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};
