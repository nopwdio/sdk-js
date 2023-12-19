export const generateKey = async function () {
  return crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
};

export const sign = async function (challenge: BufferSource, privateKey: CryptoKey) {
  return crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    privateKey,
    challenge
  );
};
