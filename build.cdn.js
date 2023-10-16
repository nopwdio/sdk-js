import  esbuild from  "esbuild"
//import info from "./package.json" assert { type: "json" };
//const externals = Object.keys(info.peerDependencies);

esbuild.build({
    entryNames: "[dir]/[name]",
    bundle: true,
    minify: true,
    splitting: true,
    format: "esm",
    entryPoints: [
        "./src/components/np-email-login.ts",
        "./src/components/np-passkey-register.ts",
        "./src/components/np-passkey-login.ts",
        "./src/flows/email.ts",
        "./src/flows/webauthn.ts",
        "./src/flows/token.ts",
    ],
    outdir: "cdn",
    external: [], // empty to ensure deps are bundled
});
