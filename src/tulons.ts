import axios from "axios";
// ---- Basic types used by Tulons
export type CeramicGenesis = {
  did: string;
  streams: CeramicGenesisStreams;
};
export type CeramicGenesisStreams = Record<string, string | false>;
export type CeramicStreamResponse = {
  content: unknown;
  next?: { content: unknown };
};
export type CeramicStream = Record<string, unknown>;
export type CeramicStreams = Record<string, unknown>;
export type CeramicStreamIds = string[];
export type CeramicRecord = Record<string, unknown> | unknown[];

// ---- Tulons Ceramic Toolkit for read-only access to content on @CeramicNetwork
export class Tulons {
  _network: string;
  _ceramicUrl: string;

  constructor(url?: string, network: string | number = 1) {
    // Default Location of a ceramic node that we can read state from
    this._ceramicUrl = url || "https://ceramic-clay.3boxlabs.com";
    // Network ID that we want to make requests against
    this._network = `${network}`;
  }

  async getGenesis(
    address: string,
    ids?: CeramicStreamIds
  ): Promise<CeramicGenesis> {
    // start empty streams obj
    const streams: Record<string, string | false> = {};

    // get the did
    const did = getDID(address, this._network);

    // query and pin for the streamId
    const response = await axios.post(`${this._ceramicUrl}/api/v0/streams`, {
      type: 0,
      genesis: {
        header: {
          family: "IDX",
          controllers: [did],
        },
      },
      opts: {
        pin: true,
        anchor: false,
      },
    });

    // collect the response body from the multiquery
    const res = (response.data || {}) as {
      state: CeramicStreamResponse;
    };

    // get the stream content for the given did according to its genesis streamId
    const content = res.state.next ? res.state.next.content : res.state.content;

    // return a subset or all keys available in the content
    const iterateOn = ids && ids.length ? ids : Object.keys(content);

    // return streamId if stream is available for the given id
    iterateOn.forEach((linkedStreamId: string): void => {
      // eg test that CryptoAccounts streamID is in expected location (kjzl6cwe1jw149z4rvwzi56mjjukafta30kojzktd9dsrgqdgz4wlnceu59f95f)
      streams[linkedStreamId] = content[linkedStreamId]
        ? (content[linkedStreamId] as string)
        : false;
    });

    // returns the indexed streams
    return {
      did,
      streams,
    } as CeramicGenesis;
  }

  async getStream(streamId: string): Promise<CeramicStream> {
    // get using multiqueries so that all reqs are made as POST
    const content = (await this.getStreams([streamId]))[
      streamId.replace("ceramic://", "")
    ] as CeramicStream;

    // returns the content held within the stream (ignoring all metadata)
    return content;
  }

  async getStreams(streamIds: CeramicStreamIds): Promise<CeramicStreams> {
    // create a query for each streamID
    const queries = streamIds.map((streamId) => {
      return {
        streamId: streamId,
      };
    });

    // get the stream content for all streams contained within the query
    const response = await axios.post(
      `${this._ceramicUrl}/api/v0/multiqueries`,
      { queries: queries }
    );

    // collect the response body from the multiquery
    const streams = (response.data || {}) as CeramicStreams;
    // extract content from the stream responses
    Object.keys(streams).map((stream) => {
      const res = streams[stream] as CeramicStreamResponse;

      streams[stream] = res.next ? res.next.content : res.content;
    });

    // returns all content indexed by streamId
    return streams;
  }

  async getHydrated(
    content: CeramicRecord,
    recursive = false
  ): Promise<CeramicRecord> {
    // find all streams in the given content
    const streams = await this.getStreams(findStreams(content, []));
    // first find any nested ceramic:// uris and get associated streams then replace uris with discovered content
    const hydrated = hydrateWithStreams.call(
      this,
      content,
      streams,
      recursive
    ) as CeramicRecord;

    // returns the fully hydrated content record
    return hydrated;
  }
}

// --- private util methods

function getDID(address: string, network: string): string {
  return `did:pkh:eip155:${network}:${address.toLowerCase()}`;
}

function findStreams(
  content: unknown,
  streams: CeramicStreamIds = []
): CeramicStreamIds {
  // scan for ceramic:// uris
  if (
    content &&
    typeof content === "string" &&
    content.indexOf("ceramic://") == 0
  ) {
    streams.push(content);
  } else if (content && typeof content == "object") {
    Object.keys(content as CeramicStreams).map((key) => {
      streams = findStreams(content[key], streams);
    });
  }

  return streams;
}

async function hydrateWithStreams(
  content: unknown,
  streams: CeramicStreams,
  recursive = false,
  layerStreams: CeramicStreamIds = [],
  skipRecursiveHydrate = false
): Promise<unknown> {
  // recursive scan to place the content from ceramic:// uris
  if (content && typeof content == "object") {
    await Promise.all(
      Object.keys(content).map(async (key) => {
        if (
          content[key] &&
          typeof content[key] === "string" &&
          (content[key] as string).indexOf("ceramic://") == 0
        ) {
          content[key] =
            streams[(content[key] as string).replace("ceramic://", "")];
          if (recursive) {
            layerStreams = findStreams(content[key], layerStreams);
          }
        } else if (content[key] && typeof content[key] == "object") {
          content[key] = (await hydrateWithStreams.call(
            this,
            content[key],
            streams,
            recursive,
            layerStreams,
            // avoid collecting recursive streams until results bubble to root
            true
          )) as CeramicRecord;
        }
      })
    );

    // if we uncovered layerStreams then we need to hydrate the content again...
    if (!skipRecursiveHydrate && layerStreams.length > 0) {
      // multiquery to get all streams for the next layer
      const lStreams = await (this as Tulons).getStreams(layerStreams);
      // hydrate the content recursively
      content = (await hydrateWithStreams.call(
        this,
        content,
        lStreams,
        recursive
      )) as CeramicRecord;
    }
  }

  return content;
}
