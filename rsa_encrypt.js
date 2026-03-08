function modPow(base, exp, mod) {
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

function rsaEncryptText() {
  const text = document.getElementById("wow").value.trim().toUpperCase();
  const eVal = document.getElementById("key-e").value.trim();
  const nVal = document.getElementById("mod-n").value.trim();
  const out  = document.getElementById("result-rsa-e");

  if (!text)        { out.value = "Please enter text."; return; }
  if (!eVal||!nVal) { out.value = "Please enter e and n."; return; }

  let e, n;
  try { e = BigInt(eVal); n = BigInt(nVal); }
  catch { out.value = "Invalid e or n (must be integers)."; return; }

  if (n <= 26n) { out.value = "n is too small."; return; }

  const cipherParts = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 32) continue;
    if (code < 65 || code > 90) {
      out.value = `Character "${text[i]}" is not a letter A-Z.`; return;
    }
    const m = BigInt(code - 64); // A=1 ... Z=26
    if (m >= n) { out.value = `Character value ${m} >= n. Use bigger n.`; return; }
    cipherParts.push(modPow(m, e, n).toString());
  }

  out.value = cipherParts.join(" ");
}

document.getElementById("btnRSAEncrypt").addEventListener("click", rsaEncryptText);