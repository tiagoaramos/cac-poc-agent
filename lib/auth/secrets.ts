async function sha256Bytes(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return new Uint8Array(digest);
}

export async function secretsEqual(left: string, right: string) {
  const hashedLeft = await sha256Bytes(`v1:${left}`);
  const hashedRight = await sha256Bytes(`v1:${right}`);
  if (hashedLeft.length !== hashedRight.length) return false;
  let diff = 0;
  for (let index = 0; index < hashedLeft.length; index += 1) {
    diff |= hashedLeft[index] ^ hashedRight[index];
  }
  return diff === 0;
}
