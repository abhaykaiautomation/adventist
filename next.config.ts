import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin pulls in jwks-rsa -> jose (an ESM package) in a way that
  // breaks when the bundler tries to require() it into the serverless
  // function. Marking it external leaves it as a native Node require at
  // runtime instead, which avoids the bundling conflict entirely.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
