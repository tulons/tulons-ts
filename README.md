# Tulons - Ceramic Scraping Toolkit

## Installing and compiling for browser 

Install deps

```sh
# add to your project
$ yarn add tulons --save

# or clone and install
$ git clone https://github.com/tulons/tulons-ts.git
$ cd tulons-ts
$ yarn install
```

Build...

```sh
$ yarn run build
```

## Usage

Firstly we need to import the bundle/library and construct a `Tulons` instance, passing in a Ceramic node URL and a networkId

```javascript
// import as a module
import { Tulons } from 'tulons';

// create a new instance pointing at the community clay node on mainnet
const tulons = new Tulons('https://ceramic-clay.3boxlabs.com', '1')';

...

```

```html
<!-- import as a bundle -->
<script src="./dist/tulons.bundle.js" type="script/javascript"></script>

<script type="text/javascript">
    // create a new instance pointing at the community clay node on mainnet
    const tulons = new Tulons('https://ceramic-clay.3boxlabs.com', '1');

    ...

</script>
```
<br/>

The `Tulons` instance exposes read-only methods to retrieve content from Ceramic:

<br/>

```javascript
// Any ethereum wallet address
const address = "0x0...";

// Ceramic connection details
const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com';
const CERAMIC_NETWORK_ID = 1
// Ceramic definition ids on the Ceramic account model
const CERAMIC_CRYPTO_ACCOUNTS_STREAM_ID = "kjzl6cwe1jw149z4rvwzi56mjjukafta30kojzktd9dsrgqdgz4wlnceu59f95f"
const CERAMIC_DPASSPORT_STREAM_ID = "kjzl6cwe1jw14b5pv8zucigpz0sc2lh9z5l0ztdrvqw5y1xt2tvz8cjt34bkub9"

// Create a new Tulons instance with a ceramicUrl and networkId
const tulons = new Tulons(CERAMIC_URL, CERAMIC_NETWORK_ID);

// Ceramic data is stored as address -> DID -> Genesis Stream -> Data Stream
const did = await tulons.getDID(address);
const genesis = await tulons.getGenesisHash(did);
const streams = await tulons.getGenesisStreams(genesis);

// Get all Accounts and clean addresses
const accounts = Object.keys(
  await tulons.getStream(
    streams[CERAMIC_CRYPTO_ACCOUNTS_STREAM_ID]
  )
).map((address) => tulons.getCleanAddress(address));

// Get Passport data and hydrate the Record to get access to raw stamp data
const dPassport = await tulons.getHydrated(
  await tulons.getStream(
    streams[CERAMIC_DPASSPORT_STREAM_ID]
  )
);
```
