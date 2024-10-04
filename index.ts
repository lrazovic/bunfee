import { WsProvider, ApiPromise } from '@polkadot/api';
import Keyring from '@polkadot/keyring';

const wsProvider = new WsProvider('wss://beta.rolimec.org');

const api = await ApiPromise.create({
	provider: wsProvider,
	noInitWarn: true,
	// Note: No extra type needed since the TAssetConversion is by default an Option<MultiLocation>
});

// Dummy account with some funds on the Testnet
const keyring = new Keyring({ type: 'sr25519' });
const sender = keyring.addFromMnemonic(
	'arrest kitten athlete dumb polar poet figure oppose valley acquire decline giggle',
);

const inputAsset = (assetId: number) =>
	api.createType('MultiLocation', {
		parents: 1,
		interior: {
			x3: [
				{ parachain: 1000 },
				{ palletInstance: 50 },
				{ generalIndex: assetId },
			],
		},
	});

const tx = await api.tx.system
	.remark('Hello, World!')
	.signAsync(sender, { nonce: -1, assetId: inputAsset(1337) });

console.log(tx.toHuman());

await tx
	.send(({ status }) => {
		if (status.isInBlock) {
			console.log(`In block ${status.asInBlock.toString()}`);
		}
		if (status.isFinalized) {
			console.log(`Finalized in block ${status.asFinalized.toString()}`);
			process.exit(0);
		} else {
			console.log(`Current status: ${status.type}`);
		}
	})
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	.catch((error: any) => {
		console.log(':( transaction failed', error);
	});
