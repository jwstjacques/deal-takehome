import HelperFunctions from "../../../src/helpers/HelperFunctions";

describe("TestHelperController", () => {
  describe("validateDate", () => {
    it.each([
      ["2021-02-10", true],
      ["2021-2-10", false],
      ["2021-13-10", false],
      ["2021-02-32", false],
      ["1800-02-10", false],
    ])("Expect %s to be validated as %s", (date, expected) => {
      const result = HelperFunctions.validateDate(date);
      expect(result).toBe(expected);
    });
  });

  describe("validateDateRange", () => {
    it.each([
      ["2021-02-10", "2021-02-11", true],
      ["2021-03-10", "2021-02-10", false],
      ["2021-03-10", "2021-03-10", true],
    ])(
      "Expect %s is on or before %s to be true to be validated as %s",
      (startDate, endDate, expected) => {
        const result = HelperFunctions.validateDateRange(startDate, endDate);
        expect(result).toBe(expected);
      }
    );
  });
});
