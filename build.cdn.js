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
        "./src/components/np-email-auth.ts",
        "./src/components/np-passkey-register.ts",
        "./src/components/np-passkey-conditional.ts",
        "./src/components/np-logout.ts",
        "./src/components/np-status.ts",
        "./src/core/email.ts",
        "./src/core/webauthn.ts",
        "./src/core/token.ts",
        "./src/core/session.ts",
    ],
    outdir: "cdn",
    external: [], // empty to ensure deps are bundled
});
