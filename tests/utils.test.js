import { insertAtIndex, removeAtIndex, getRandomIndex } from "../src/utils";
import { nanoid } from "nanoid";

const randomInput = nanoid().split("");

describe("Utilities", () => {
  describe("insertAtIndex", () => {
    it("Should not modify the given input array", () => {
      insertAtIndex(randomInput, 1, null);
      expect(randomInput).toEqual(randomInput);
    });

    it("Should insert an item next to the given index", () => {
      const randomIndex = getRandomIndex(randomInput);
      const output = insertAtIndex(randomInput, randomIndex, null);

      expect(output.length).toBe(randomInput.length + 1);
      expect(output[randomIndex]).toBe(null);
    });

    it("Should insert the item at exactly the given index", () => {
      const randomIndex = getRandomIndex(randomInput);
      const output = insertAtIndex(randomInput, randomIndex, null, true);

      expect(output.length).toBe(randomInput.length);
      expect(output[randomIndex]).toBe(null);
    });
  });

  describe("removeAtIndex", () => {
    it("Should not modify the given input array", () => {
      removeAtIndex(randomInput, 1);
      expect(randomInput).toEqual(randomInput);
    });

    it("Should be able to remove the item at a given index", () => {
      const randomIndex = getRandomIndex(randomInput);
      const output = removeAtIndex(randomInput, randomIndex);
      expect(output.length).toBe(randomInput.length - 1);
      expect(randomInput).toEqual(expect.arrayContaining(output));
    });
  });
});
