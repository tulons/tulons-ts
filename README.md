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
import { Tulons } from "tulons";

// create a new instance pointing at the community clay node on mainnet
const tulons = new Tulons("https://ceramic-clay.3boxlabs.com", "1");

...

```

```html
<!-- import as a bundle -->
<script src="./dist/tulons.bundle.js" type="script/javascript"></script>

<script type="text/javascript">
    // create a new instance pointing at the community clay node on mainnet
    const tulons = new Tulons("https://ceramic-clay.3boxlabs.com", "1");

    ...

</script>
```
<br/>

The `Tulons` instance exposes read-only methods to retrieve content from Ceramic using a [did:pkh](https://github.com/w3c-ccg/did-pkh/blob/main/did-pkh-method-draft.md) of a given address:

<br/>

```javascript
// Any ethereum wallet address
const address = "0x0...";

// Ceramic connection details
const CERAMIC_URL = "https://ceramic-clay.3boxlabs.com";
const CERAMIC_NETWORK_ID = 1

// Ceramic definition ids on the Ceramic account model
const CERAMIC_GITCOIN_PASSPORT_STREAM_ID = "kjzl6cwe1jw148h1e14jb5fkf55xmqhmyorp29r9cq356c7ou74ulowf8czjlzs"

// Create a new Tulons instance with a ceramicUrl and networkId
const tulons = new Tulons(CERAMIC_URL, CERAMIC_NETWORK_ID);

// Ceramic data is stored as address -> DID -> Genesis/IDX Stream -> Data Stream
const { streams } = await tulons.getGenesis(address);

// Passport will be defined if the user has recorded it...
if (streams[CERAMIC_GITCOIN_PASSPORT_STREAM_ID]) {
  // Get Passport data and hydrate the Record to get access to raw stamp data
  const passport = await tulons.getHydrated(
    await tulons.getStream(
      streams[CERAMIC_GITCOIN_PASSPORT_STREAM_ID]
    )
  );
}
```
