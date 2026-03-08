function modPowDecrypt(base, exp, mod) {
  base = BigInt(base);
  exp  = BigInt(exp);
  mod  = BigInt(mod);
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

function rsaDecryptText() {
  const text = document.getElementById("t-rsa-d").value.trim();
  const dVal = document.getElementById("key-d").value.trim();
  const nVal = document.getElementById("mod-n-d").value.trim();
  const out  = document.getElementById("result-rsa-d");

  if (!text)        { out.value = "Please enter cipher numbers."; return; }
  if (!dVal||!nVal) { out.value = "Please enter d and n."; return; }

  let d, n;
  try { d = BigInt(dVal); n = BigInt(nVal); }
  catch { out.value = "Invalid d or n (must be integers)."; return; }

  // Input: space-separated cipher numbers e.g. "2096 3 2478 2478 1"
  const parts = text.split(/\s+/).filter(p => p !== "");

  let result = "";
  for (const part of parts) {
    let c;
    try { c = BigInt(part); }
    catch { out.value = `"${part}" is not a valid number.`; return; }

    const m = modPowDecrypt(c, d, n); // decrypt: M = C^d mod n

    const num = Number(m);
    if (num < 1 || num > 26) {
      out.value = `Decrypted value ${m} is out of range (1-26). Check your keys.`; return;
    }

    result += String.fromCharCode(num + 64); // 1=A ... 26=Z
  }

  out.value = result;
}

document.getElementById("btnRSADecrypt").addEventListener("click", rsaDecryptText);