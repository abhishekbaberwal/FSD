const auth = require("../backend/lib/auth");

describe("password hashing", () => {
  test("hash is salted and verifies the right password only", () => {
    const h1 = auth.hashPassword("secret123");
    const h2 = auth.hashPassword("secret123");
    expect(h1).not.toBe(h2); // different salts
    expect(h1.startsWith("scrypt$")).toBe(true);
    expect(auth.verifyPassword("secret123", h1)).toBe(true);
    expect(auth.verifyPassword("wrong", h1)).toBe(false);
  });

  test("rejects malformed stored hashes instead of throwing", () => {
    expect(auth.verifyPassword("x", "not-a-hash")).toBe(false);
    expect(auth.verifyPassword("x", "scrypt$zz$zz")).toBe(false);
    expect(auth.verifyPassword(undefined, undefined)).toBe(false);
  });

  test("an empty or truncated hash never accepts a password", () => {
    expect(auth.verifyPassword("anything", "scrypt$$")).toBe(false);
    expect(auth.verifyPassword("", "scrypt$$")).toBe(false);
    const good = auth.hashPassword("secret123");
    const [tag, salt, hash] = good.split("$");
    expect(auth.verifyPassword("secret123", [tag, salt, hash.slice(0, 20)].join("$"))).toBe(false);
  });

  test("refuses empty passwords", () => {
    expect(() => auth.hashPassword("")).toThrow();
  });
});

describe("session tokens", () => {
  test("tokens are random and long", () => {
    const a = auth.generateToken();
    const b = auth.generateToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  test("stored token hash differs from the token", () => {
    const t = auth.generateToken();
    expect(auth.hashToken(t)).not.toBe(t);
    expect(auth.hashToken(t)).toBe(auth.hashToken(t));
  });

  test("parseBearer extracts the token and rejects junk", () => {
    expect(auth.parseBearer("Bearer abc123")).toBe("abc123");
    expect(auth.parseBearer("Basic abc123")).toBeNull();
    expect(auth.parseBearer("Bearer")).toBeNull();
    expect(auth.parseBearer(undefined)).toBeNull();
  });
});
