// ---------- Helpers ----------
function toBigIntStrict(s) {
  s = s.trim();
  if (!/^\d+$/.test(s)) return null;
  return BigInt(s);
}

function gcdBigInt(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

function modInverseRSA(a, m) {
  a = ((a % m) + m) % m;
  let t = 0n, newT = 1n;
  let r = m, newR = a;
  while (newR !== 0n) {
    const q = r / newR;
    [t, newT] = [newT, t - q * newT];
    [r, newR] = [newR, r - q * newR];
  }
  if (r !== 1n) return null;
  if (t < 0n) t += m;
  return t;
}

function modPowBig(base, exp, mod) {
  base %= mod;
  let result = 1n;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

const MR_BASES = [2n, 325n, 9375n, 28178n, 450775n, 9780504n, 1795265022n];

function isPrimeRSA(n) {
  if (n < 2n) return false;
  const small = [2n,3n,5n,7n,11n,13n,17n,19n,23n,29n,31n,37n];
  for (const p of small) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n, s = 0n;
  while ((d & 1n) === 0n) { d >>= 1n; s++; }
  for (let a of MR_BASES) {
    a %= n;
    if (a === 0n) continue;
    let x = modPowBig(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let composite = true;
    for (let r = 1n; r < s; r++) {
      x = (x * x) % n;
      if (x === n - 1n) { composite = false; break; }
    }
    if (composite) return false;
  }
  return true;
}

// ---------- Key Generation ----------
function generateRSAKey() {
  const pVal = document.getElementById("keygenp").value.trim();
  const qVal = document.getElementById("keygenq").value.trim();
  const eInput = document.getElementById("keygene");
  const eVal = eInput ? eInput.value.trim() : "";
  const out  = document.getElementById("keyrsa");

  const p = toBigIntStrict(pVal);
  const q = toBigIntStrict(qVal);

  if (p === null || q === null) { out.value = "Please enter valid integers for p and q."; return; }
  if (p === q)                  { out.value = "p and q must be different primes."; return; }
  if (!isPrimeRSA(p) || !isPrimeRSA(q)) { out.value = "Both p and q must be prime numbers."; return; }

  const n   = p * q;
  const phi = (p - 1n) * (q - 1n);

  let e;
  if (eVal !== "") {
    e = toBigIntStrict(eVal);
    if (e === null || e <= 1n)    { out.value = "e must be an integer greater than 1."; return; }
    if (e >= phi)                 { out.value = `e must be less than phi(n) = ${phi}.`; return; }
    if (gcdBigInt(e, phi) !== 1n) { out.value = `e = ${e} is not coprime with phi(n) = ${phi}.`; return; }
  } else {
    e = 65537n;
    if (e >= phi || gcdBigInt(e, phi) !== 1n) {
      e = 3n;
      while (e < phi && gcdBigInt(e, phi) !== 1n) e += 2n;
    }
    if (e >= phi) { out.value = "Cannot find valid e. Try different primes."; return; }
  }

  const d = modInverseRSA(e, phi);
  if (d === null) { out.value = "Cannot compute private key. Try different primes."; return; }

  // Show result
  out.value =
    `n        = ${n}\n` +
    `phi(n)   = ${phi}\n` +
    `Public Key:  (e: ${e}, n: ${n})\n` +
    `Private Key: (d: ${d}, n: ${n})`;

  // Auto-fill encryption fields
  document.getElementById("key-e").value  = e.toString();
  document.getElementById("mod-n").value  = n.toString();

  // Auto-fill decryption fields
  document.getElementById("key-d").value   = d.toString();
  document.getElementById("mod-n-d").value = n.toString();
}

document.getElementById("btnRSA").addEventListener("click", generateRSAKey);