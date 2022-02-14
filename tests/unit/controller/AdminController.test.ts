import { Request } from "jest-express/lib/request";
import { Response } from "jest-express/lib/response";

import AdminController from "../../../src/controller/AdminController";
import AdminDal from "../../../src/dal/AdminDal";
import { ProfileTypeEnum } from "../../../src/enum/ProfileTypeEnum";
import TestHelpers from "../../TestHelper";

let res: any;

describe("AdminController", () => {
  let profileId: number;

  beforeAll(async () => {
    profileId = await TestHelpers.createProfile(ProfileTypeEnum.Client, {
      lastName: "AdminControllerTest",
    });
  });

  afterAll(async () => {
    await TestHelpers.deleteProfiles([profileId]);
  });

  describe("listBestClients", () => {
    beforeEach(() => {
      res = new Response();
    });

    afterEach(() => {
      res.resetMocked();
    });

    it("should return 200 with a valid date range in query params", async () => {
      const req: any = new Request("/admin/best-clients?start=2022-02-02&end=2022-02-03&limit=3", {
        method: "GET",
        headers: {
          profile_id: profileId,
        },
      });
      req.profile = { id: profileId };
      req.query = {
        start: "2022-02-02",
        end: "2022-02-03",
        limit: "3",
      };

      const dal = new AdminDal();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dal.getBestClients = async (startDate, endDate) => {
        return [{}, {}, {}];
      };

      const controller = new AdminController(dal);

      await controller.listBestClients(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject([{}, {}, {}]);
    });

    describe("failures", () => {
      it("should return 400 when query params are missing", async () => {
        const req: any = new Request("/admin/best-clients", {
          method: "GET",
          headers: {
            profile_id: profileId,
          },
        });
        req.profile = { id: profileId };

        const dal = new AdminDal();
        let isDalCalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.getBestClients = async (startDate, endDate) => {
          isDalCalled = true;
          return [];
        };

        const controller = new AdminController(dal);

        await controller.listBestClients(req, res);

        expect(res.statusCode).toBe(400);
        expect(isDalCalled).toBeFalsy();
        expect(res.body).toBe("Invalid date range.");
      });

      it("should return 400 when limit is not a number", async () => {
        const req: any = new Request("/admin/best-clients", {
          method: "GET",
          headers: {
            profile_id: profileId,
          },
        });
        req.profile = { id: profileId };
        req.query = {
          start: "2022-02-02",
          end: "2022-02-03",
          limit: "FAKE",
        };

        const dal = new AdminDal();
        let isDalCalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.getBestClients = async (startDate, endDate) => {
          isDalCalled = true;
          return [];
        };

        const controller = new AdminController(dal);

        await controller.listBestClients(req, res);

        expect(res.statusCode).toBe(400);
        expect(isDalCalled).toBeFalsy();
        expect(res.body).toBe("Limit is not a valid integer.");
      });

      it("should return 500 on a failure within the dal", async () => {
        const req: any = new Request(
          "/admin/best-clients?start=2022-02-02&end=2022-02-03&limit=3",
          {
            method: "GET",
            headers: {
              profile_id: profileId,
            },
          }
        );
        req.profile = { id: profileId };
        req.query = {
          start: "2022-02-02",
          end: "2022-02-03",
          limit: "3",
        };

        const dal = new AdminDal();
        let isDalCalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.getBestClients = async (startDate, endDate) => {
          isDalCalled = true;
          throw new Error("Failed");
        };

        const controller = new AdminController(dal);

        await controller.listBestClients(req, res);

        expect(res.statusCode).toBe(500);
        expect(isDalCalled).toBeTruthy();
      });
    });
  });

  describe("getBestProfession", () => {
    beforeEach(() => {
      res = new Response();
    });

    afterEach(() => {
      res.resetMocked();
    });

    it("should return 200 and a contract for matching profileId and contractId", async () => {
      const req: any = new Request("/admin/best-profession?start=2022-02-02&end=2022-02-03", {
        method: "GET",
        headers: {
          profile_id: profileId,
        },
      });
      req.profile = { id: profileId };
      req.query = {
        start: "2022-01-01",
        end: "2022-01-02",
      };

      const dal = new AdminDal();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dal.getBestProfession = async (startDate, endDate): Promise<any[]> => {
        return [{}];
      };

      const controller = new AdminController(dal);

      await controller.getBestProfession(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toMatchObject({});
    });

    describe("failures", () => {
      it("should return 400 when there are no query parms", async () => {
        const req: any = new Request("/admin/best-profession", {
          method: "GET",
          headers: {
            profile_id: profileId,
          },
        });
        req.profile = { id: profileId };

        const dal = new AdminDal();
        let isDalCalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.getBestProfession = async (startDate: string, endDate: string) => {
          isDalCalled = true;
          return [{}];
        };

        const controller = new AdminController(dal);

        await controller.getBestProfession(req, res);

        expect(res.statusCode).toBe(400);
        expect(isDalCalled).toBeFalsy();
        expect(res.body).toBe("Invalid date range.");
      });

      it("should return 500 on a failure within the dal", async () => {
        const req: any = new Request("/admin/best-profession?start=2022-02-02&end=2022-02-03", {
          method: "GET",
          headers: {
            profile_id: profileId,
          },
        });
        req.profile = { id: profileId };
        req.query = {
          start: "2022-01-01",
          end: "2022-01-02",
        };

        const dal = new AdminDal();
        let isDalCalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.getBestProfession = async (startDate: string, endDate: string) => {
          isDalCalled = true;
          throw new Error("Failed");
        };

        const controller = new AdminController(dal);

        await controller.getBestProfession(req, res);

        expect(res.statusCode).toBe(500);
        expect(isDalCalled).toBeTruthy();
      });
    });
  });
});
