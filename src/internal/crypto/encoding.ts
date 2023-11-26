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

export const decodeFromSafe64 = function (base64: string) {
  // Add removed at end '='
  base64 += Array(5 - (base64.length % 4)).join("=");

  base64 = base64
    .replace(/\-/g, "+") // Convert '-' to '+'
    .replace(/\_/g, "/"); // Convert '_' to '/'

  return new Uint8Array([...atob(base64)].map((c) => c.charCodeAt(0)));
};
