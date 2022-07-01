/* eslint-disable @typescript-eslint/unbound-method */
import axios from "axios";
import { Tulons } from "../src/tulons";
import MockAdapter from "axios-mock-adapter";

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios);

test("Can get Genesis from wallet address", async () => {

  const tulons = new Tulons("localhost", 1);
  
  // set mock for the streams expected request
  mock.onPost("localhost/api/v0/streams").reply(200, {
    "streamid": "k2t6wy...",
    "state": {
      "content": {
        "kz2832...": "ceramic://kz29j...",
        "k3qp34...": "ceramic://kz30x..."
      }
    }
  });

  const genesis = await tulons.getGenesis("0x0");
  
  // expect to get back a did:pkh
  expect(genesis.did).toBe("did:pkh:eip155:1:0x0");
  // makes req for k2t6wy... and gets back content...
  expect(genesis.streams).toStrictEqual({
    "kz2832...": "ceramic://kz29j...",
    "k3qp34...": "ceramic://kz30x..."
  });
});

test("Can get Stream from a streamId", async () => {
  const tulons = new Tulons('localhost', 1);
  
  // set mock for the streams expected request
  mock.onPost("localhost/api/v0/multiqueries").reply(200, {
    "kz29j...": {
      "content": {
        "test": "value"
      }
    }
  });

  const content = await tulons.getStream("ceramic://kz29j...");
  
  expect(content).toStrictEqual({
    "test": "value"
  });
});

test("Can get Streams from an array of streamIds", async () => {
  const tulons = new Tulons('localhost', 1);
  
  // set mock for the streams expected request
  mock.onPost("localhost/api/v0/multiqueries").reply(200, {
    "kz29j...": {
      "content": {
        "test": 1
      }
    }
  });

  const content = await tulons.getStreams(["ceramic://kz29j..."]);
  
  expect(content).toStrictEqual({
    "kz29j...": {
      "test": 1
    }
  });
});

test("Can get hydrated content from streams content", async () => {
  const tulons = new Tulons('localhost', 1);

  // set mock for the streams expected request
  mock.onPost("localhost/api/v0/multiqueries").reply(200, {
    "kz29j...": {
      "content": {
        "test": 1
      }
    }
  });

  const content = await tulons.getHydrated({
    "example": "ceramic://kz29j..."
  });
  
  expect(content).toStrictEqual({
    "example": {
      "test": 1
    }
  });
});

test("Can get hydrated content from streams content recursively", async () => {
  const tulons = new Tulons('localhost', 1);
  
  // set mock for the streams expected request
  mock.onPost("localhost/api/v0/multiqueries").reply(200, {
    "kz29j...": {
      "content": {
        "test": "ceramic://kz452..."
      }
    },
    // this would be returned in a second query to /api/v0/multiqueries
    "kz452...": {
      "content": {
        "test": 1
      }
    }
  });

  const content = await tulons.getHydrated({
    "example": "ceramic://kz29j..."
  }, true);
  
  expect(content).toStrictEqual({
    "example": {
      "test": {
        "test": 1
      }
    }
  });
});
