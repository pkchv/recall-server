import "mocha";

import { expect } from "chai";
import { normalizeTag } from "../../../src/utility/normalize-tag";

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("utility/normalize-tag unit tests", function() {
  it("should return an empty string", function() {
    return expect(normalizeTag("")).to.be.lengthOf(0);
  });

  it("should trim whitespace", function() {
    return expect(normalizeTag("  tag   ")).to.be.equal("tag");
  });

  it("should add hypens", function() {
    return expect(normalizeTag("multi   part   tag")).to.be.equal("multi-part-tag");
  });

  it("should lowercase", function() {
    return expect(normalizeTag("TAG")).to.be.equal("tag");
  });

  it("should trim, lowercase, add hypens", function() {
    return expect(normalizeTag(" vErY WeIrD   TaG ")).to.be.equal("very-weird-tag");
  });
});
