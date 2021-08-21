import { DerEncodedPublicKey } from '@astrox/agent';
import { fromHexString } from '../buffer';
import { Ed25519KeyIdentity, Ed25519PublicKey } from './ed25519';

const testVectors: Array<[string, string]> = [
  [
    'B3997656BA51FF6DA37B61D8D549EC80717266ECF48FB5DA52B654412634844C',
    '302A300506032B6570032100B3997656BA51FF6DA37B61D8D549EC80717266ECF48FB5DA52B654412634844C',
  ],
  [
    'A5AFB5FEB6DFB6DDF5DD6563856FFF5484F5FE304391D9ED06697861F220C610',
    '302A300506032B6570032100A5AFB5FEB6DFB6DDF5DD6563856FFF5484F5FE304391D9ED06697861F220C610',
  ],
  [
    'C8413108F121CB794A10804D15F613E40ECC7C78A4EC567040DDF78467C71DFF',
    '302A300506032B6570032100C8413108F121CB794A10804D15F613E40ECC7C78A4EC567040DDF78467C71DFF',
  ],
];

test('DER encoding of ED25519 keys', async () => {
  testVectors.forEach(([rawPublicKeyHex, derEncodedPublicKeyHex]) => {
    const publicKey = Ed25519PublicKey.fromRaw(fromHexString(rawPublicKeyHex));
    const expectedDerPublicKey = fromHexString(derEncodedPublicKeyHex);
    expect(publicKey.toDer()).toEqual(expectedDerPublicKey);
  });
});

test('DER decoding of ED25519 keys', async () => {
  testVectors.forEach(([rawPublicKeyHex, derEncodedPublicKeyHex]) => {
    const derPublicKey = fromHexString(derEncodedPublicKeyHex) as DerEncodedPublicKey;
    const expectedPublicKey = fromHexString(rawPublicKeyHex);
    expect(new Uint8Array(Ed25519PublicKey.fromDer(derPublicKey).toRaw())).toEqual(
      new Uint8Array(expectedPublicKey),
    );
  });
});

test('DER decoding of invalid keys', async () => {
  // Too short.
  expect(() => {
    Ed25519PublicKey.fromDer(
      fromHexString(
        '302A300506032B6570032100B3997656BA51FF6DA37B61D8D549EC80717266ECF48FB5DA52B65441263484',
      ) as DerEncodedPublicKey,
    );
  }).toThrow();
  // Too long.
  expect(() => {
    Ed25519PublicKey.fromDer(
      fromHexString(
        '302A300506032B6570032100B3997656BA51FF6DA37B61D8D549EC8071726' +
          '6ECF48FB5DA52B654412634844C00',
      ) as DerEncodedPublicKey,
    );
  }).toThrow();

  // Invalid DER-encoding.
  expect(() => {
    Ed25519PublicKey.fromDer(
      fromHexString(
        '002A300506032B6570032100B3997656BA51FF6DA37B61D8D549EC80717266ECF48FB5DA52B654412634844C',
      ) as DerEncodedPublicKey,
    );
  }).toThrow();
});

test('fails with improper seed', () => {
  expect(() => Ed25519KeyIdentity.generate(new Uint8Array(new Array(31).fill(0)))).toThrow();
  expect(() => Ed25519KeyIdentity.generate(new Uint8Array(new Array(33).fill(0)))).toThrow();
});

test('can encode and decode to/from JSON', async () => {
  const seed = new Array(32).fill(0);
  const key = Ed25519KeyIdentity.generate(new Uint8Array(seed));

  const json = JSON.stringify(key);
  const key2 = Ed25519KeyIdentity.fromJSON(json);

  expect(new Uint8Array(key.getPublicKey().toDer())).toEqual(
    new Uint8Array(key2.getPublicKey().toDer()),
  );
});
