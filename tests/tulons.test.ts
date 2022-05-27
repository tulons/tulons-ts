/* eslint-disable @typescript-eslint/unbound-method */
import { Tulons } from "../src/tulons";

import mockFetch, { MockResponseInit } from 'jest-fetch-mock'

mockFetch.enableMocks();

test("Can get DID from wallet address", () => {
  const tulons = new Tulons('localhost', 1);

  const did = tulons.getDID("0x0");

  expect(did).toBe("did:pkh:eip155:1:0x0");
});

test("Can get Genesis Hash from DID", async () => {
  const tulons = new Tulons('localhost', 1);
  
  const hash = await tulons.getGenesisHash("did:pkh:eip155:1:0x0");
  
  // "did:3:kjzl6..." encoded and hashed (integration test)
  expect(hash).toBe("k2t6wyfsu4pg2uolfm8khi17vi56lp9d7679hy2cbbjyqp6ox9ovev8ciwnnxs");
});

test("Can get Genesis Streams from DID", async () => {
  const tulons = new Tulons('localhost', 1);
  
  // set mock for the streams expected request
  fetchMock.mockIf(/^localhost\/api\/v0\/multiqueries$/, (req: Request): Promise<MockResponseInit | string> => {

    return Promise.resolve({
      "body": JSON.stringify({
        "k2t6wyfsu4pg2uolfm8khi17vi56lp9d7679hy2cbbjyqp6ox9ovev8ciwnnxs": {
          "content":{
            "kz2832...": "ceramic://kz29j...",
            "k3qp34...": "ceramic://kz30x..."
          }
        }
      })
    });
  });

  const streams = await tulons.getGenesisStreams("k2t6wyfsu4pg2uolfm8khi17vi56lp9d7679hy2cbbjyqp6ox9ovev8ciwnnxs");
  
  // "did:3:kjzl6..." encoded and hashed (integration test)
  expect(streams).toStrictEqual({
    "kz2832...": "ceramic://kz29j...",
    "k3qp34...": "ceramic://kz30x..."
  });
});

test("Can get Stream from a streamId", async () => {
  const tulons = new Tulons('localhost', 1);
  
  // set mock for the streams expected request
  fetchMock.mockIf(/^localhost\/api\/v0\/multiqueries$/, (req: Request): Promise<MockResponseInit | string> => {

    return Promise.resolve({
      "body": JSON.stringify({
        "kz29j...": {
          "content": {
            "test": "value"
          }
        }
      })
    });
  });

  const content = await tulons.getStream("ceramic://kz29j...");
  
  expect(content).toStrictEqual({
    "test": "value"
  });
});

test("Can get Streams from an array of streamIds", async () => {
  const tulons = new Tulons('localhost', 1);
  
  // set mock for the streams expected request
  fetchMock.mockIf(/^localhost\/api\/v0\/multiqueries$/, (req: Request): Promise<MockResponseInit | string> => {

    return Promise.resolve({
      "body": JSON.stringify({
        "kz29j...": {
          "content": {
            "test": 1
          }
        }
      })
    });
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
  fetchMock.mockIf(/^localhost\/api\/v0\/multiqueries$/, (req: Request): Promise<MockResponseInit | string> => {

    return Promise.resolve({
      "body": JSON.stringify({
        "kz29j...": {
          "content": {
            "test": 1
          }
        }
      })
    });
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
  fetchMock.mockIf(/^localhost\/api\/v0\/multiqueries$/, (req: Request): Promise<MockResponseInit | string> => {

    return Promise.resolve({
      "body": JSON.stringify({
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
      })
    });
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
