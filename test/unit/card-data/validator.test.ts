import "mocha";

import { expect } from "chai";
import { isCardDataObject } from "../../../src/card-data/validator";

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("card-data/validator unit tests", function() {
  describe("Basic card", function() {
    it("valid card should return true", function() {
      const cardData = {
        type: 1,
        data: {
          front: "Front",
          back: "Back",
        },
      };

      return expect(isCardDataObject(cardData)).to.be.true;
    });

    it("card with invalid type enum should return false", function() {
      const cardData = {
        type: 3,
        data: {
          front: "Front",
          back: "Back",
        },
      };

      return expect(isCardDataObject(cardData)).to.be.false;
    });

    it("card with missing property in data object should return false", function() {
      const cardData = {
        type: 0,
        data: {
          front: "Front",
        },
      };

      return expect(isCardDataObject(cardData)).to.be.false;
    });

    it("card with invalid data object structure should return false", function() {
      const cardData = {
        type: 0,
        data: {
          foo: 2,
        },
      };

      return expect(isCardDataObject(cardData)).to.be.false;
    });

    it("card with missing type property should return false", function() {
      it("card with missing property in data object should return false", function() {
        const cardData = {
          type: 0,
        };

        return expect(isCardDataObject(cardData)).to.be.false;
      });
    });
  });
});
