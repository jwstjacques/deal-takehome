import { Request } from "jest-express/lib/request";
import { Response } from "jest-express/lib/response";

import ContractController from "../../../src/controller/ContractController";
import ContractDal from "../../../src/dal/ContractDal";

let res: any;

describe("ContractController", () => {
  describe("list", () => {
    beforeEach(() => {
      res = new Response();
    });

    afterEach(() => {
      res.resetMocked();
    });

    it("should return 200 and a list of contracts for given profileId", async () => {
      const req: any = new Request("/contracts", {
        method: "GET",
        headers: {
          profile_id: 1,
        },
      });
      req.profile = { id: 1 };

      const dal = new ContractDal();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dal.listByProfileId = async (profileId: number) => {
        return [];
      };

      const controller = new ContractController(dal);

      await controller.list(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject([]);
    });

    it("should return 500 on a failure within the dal", async () => {
      const req: any = new Request("/contracts", {
        method: "GET",
        headers: {
          profile_id: 1,
        },
      });
      req.params = { id: 1 };
      req.profile = { id: 1 };

      const dal = new ContractDal();
      let isDalCalled = false;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dal.listByProfileId = async (profileId: number) => {
        isDalCalled = true;
        throw new Error("Failed");
      };

      const controller = new ContractController(dal);

      await controller.list(req, res);

      expect(res.statusCode).toBe(500);
      expect(isDalCalled).toBeTruthy();
    });
  });

  describe("getById", () => {
    beforeEach(() => {
      res = new Response();
    });

    afterEach(() => {
      res.resetMocked();
    });

    it("should return 200 and a contract for matching profileId and contractId", async () => {
      const req: any = new Request("/contracts", {
        method: "GET",
        headers: {
          profile_id: 1,
        },
      });
      req.params = { id: 1 };
      req.profile = { id: 1 };

      const dal = new ContractDal();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dal.getById = async (profileId: number, contractId: number) => {
        return {};
      };

      const controller = new ContractController(dal);

      await controller.getById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({});
    });

    describe("failures", () => {
      it("should return 400 when ID is a not a valid number", async () => {
        const req: any = new Request("/contracts", {
          method: "GET",
          headers: {
            profile_id: 1,
          },
        });
        req.params = { id: "FAKE" };
        req.profile = { id: 1 };

        const dal = new ContractDal();
        let isDalCalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.getById = async (profileId: number, contractId: number) => {
          isDalCalled = true;
          return {};
        };

        const controller = new ContractController(dal);

        await controller.getById(req, res);

        expect(res.statusCode).toBe(400);
        expect(isDalCalled).toBeFalsy();
        expect(res.body).toBe("Bad Request. ContractId: FAKE in path is invalid.");
      });

      it("should return 404 when no matching contract is found", async () => {
        const req: any = new Request("/contracts", {
          method: "GET",
          headers: {
            profile_id: 1,
          },
        });
        req.params = { id: 1 };
        req.profile = { id: 1 };

        const dal = new ContractDal();
        let isDalCalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.getById = async (profileId: number, contractId: number) => {
          isDalCalled = true;
          return null;
        };

        const controller = new ContractController(dal);

        await controller.getById(req, res);

        expect(res.statusCode).toBe(404);
        expect(isDalCalled).toBeTruthy();
        expect(res.body).toBe(
          "The contract with the contractId: 1 does not exist for this profile."
        );
      });

      it("should return 500 on a failure within the dal", async () => {
        const req: any = new Request("/contracts", {
          method: "GET",
          headers: {
            profile_id: 1,
          },
        });
        req.params = { id: 1 };
        req.profile = { id: 1 };

        const dal = new ContractDal();
        let isDalCalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.getById = async (profileId: number, contractId: number) => {
          isDalCalled = true;
          throw new Error("Failed");
        };

        const controller = new ContractController(dal);

        await controller.getById(req, res);

        expect(res.statusCode).toBe(500);
        expect(isDalCalled).toBeTruthy();
      });
    });
  });
});
