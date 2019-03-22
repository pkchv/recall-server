import { mockReq } from "sinon-express-mock";

export function createRequestWithBody(body) {
  return mockReq({
    body,
  });
}
