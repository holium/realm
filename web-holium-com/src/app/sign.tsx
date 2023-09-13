import { createWalletClient, custom, recoverPublicKey } from 'viem';
import { sepolia } from 'viem/chains';
import { useWalletClient } from 'wagmi';

// Importing Ethers library
const { hashMessage } = require('@ethersproject/hash');
// const secp256k1 = require('secp256k1');

export default function SignMessageButton() {
  const { data: walletClient } = useWalletClient();
  // const { isLoading, isSuccess, signMessage } = useSignMessage({
  //   message: 'gm wagmi frens',
  //   onError(error) {
  //     console.error(error);
  //   },
  //   onMutate(args) {
  //     console.log('Mutate', args);
  //   },
  //   onSettled(data, error) {
  //     console.log('Settled', { data, error });
  //   },
  //   onSuccess(data) {
  //     console.log('Success', data);
  //     // Then you must make this binary
  //     let messageHashBytes = ethers.utils.arrayify(data);

  //     // Now you have the digest,
  //     let publicKey = ethers.recoverPublicKey(messageHashBytes);
  //     console.log('public key: %o', publicKey);
  //   },
  // });

  if (!walletClient) return;
  return (
    <div
      style={{
        fontSize: '12px',
        textDecoration: 'underline',
        color: '#4e9efd',
        cursor: 'pointer',
      }}
      onClick={async () => {
        const client = createWalletClient({
          chain: sepolia,

          // mode: 'anvil',
          transport: custom(window.ethereum),
        });
        // .extend(publicActions)
        // .extend(walletActions);

        // const request = await prepareTransactionRequest(client, {
        //   account: '0x3FBacafC43CdE5e41C50d6640d3437c62B75e930',
        //   to: '0x0000000000000000000000000000000000000000',
        //   value: 1n,
        // }); //{
        //   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
        //   value: parseEther('1'),
        // });

        const signature = await client.signMessage({
          account: '0x3FBacafC43CdE5e41C50d6640d3437c62B75e930',
          message: 'who dis?',
        });

        console.log('signature => %o', signature);

        const hash = hashMessage(signature);

        console.log('hash => %o', hash);

        const r = `${signature.slice(0, 64)}`;
        const s = `0x${signature.slice(64, 128)}`;
        const v = parseInt(signature.slice(128, 130)) + 27;
        // const recovery = v - 27;

        console.log('(r, s, v) => (%o, %o, %o)', r, s, v);

        // const senderPubKey = secp256k1.recover(hash, signature, recovery);
        // return secp256k1.publicKeyConvert(senderPubKey, false).slice(1);
        // const r = signature.substring(0, 32);
        // const s = signature.substring(32, 64);
        // const v = signature.

        // const signature = await client.signTransaction(request);
        // 0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33

        // const hash = await client.sendRawTransaction({
        //   serializedTransaction: signature,
        // });
        const publicKey = await recoverPublicKey({ hash, signature });
        console.log('publicKey => %o', publicKey);

        // console.log('public key => %o', publicKey);
        // hash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
        //   signature:
        //     '0x66edc32e2ab001213321ab7d959a2207fcef5190cc9abb6da5b0d2a8a9af2d4d2b0700e2c317c4106f337fd934fbbb0bf62efc8811a78603b33a8265d3b8f8cb1c',
        // });
      }}
    >
      Sign
    </div>
  );
}
