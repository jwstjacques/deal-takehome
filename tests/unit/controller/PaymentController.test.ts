import { Request } from "jest-express/lib/request";
import { Response } from "jest-express/lib/response";

import PaymentController from "../../../src/controller/PaymentController";
import JobDal from "../../../src/dal/JobDal";
import PaymentDal from "../../../src/dal/PaymentDal";
import { PaymentStatusEnum } from "../../../src/enum/PaymentStatusEnum";

let res: any;

describe("PaymentController", () => {
  describe("payDeposit", () => {
    beforeEach(() => {
      res = new Response();
    });

    afterEach(() => {
      res.resetMocked();
    });

    describe("success", () => {
      it("should return 200 and an updated balance", async () => {
        const req: any = new Request("/balances/deposit/1", {
          method: "POST",
          headers: {
            profile_id: 1,
          },
        });
        req.profile = { id: 1 };
        req.params = { userId: 1 };
        req.body = { paymentAmount: 100 };

        const dal = new PaymentDal();
        const jobDal = new JobDal();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.updateBalanceWithDeposit = async (profileId: number, paymentAmount) => {
          return { response: PaymentStatusEnum.Success, balance: 1234 };
        };

        const controller = new PaymentController(dal, jobDal);

        await controller.payDeposit(req, res);

        expect(res.statusCode).toBe(200);
        expect(res.body).toMatchObject({ newBalance: 1234 });
      });
    });

    describe("failure", () => {
      it("should return 409 when clientId in params and headers do not match", async () => {
        const req: any = new Request("/balances/deposit/1", {
          method: "POST",
          headers: {
            profile_id: 17,
          },
        });
        req.profile = { id: 17 };
        req.params = { userId: 1 };
        req.body = { paymentAmount: 100 };

        const dal = new PaymentDal();
        const jobDal = new JobDal();
        let isDalcalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.updateBalanceWithDeposit = async (profileId: number, paymentAmount) => {
          isDalcalled = true;
          return { response: PaymentStatusEnum.Success, balance: 1234 };
        };

        const controller = new PaymentController(dal, jobDal);

        await controller.payDeposit(req, res);

        expect(res.statusCode).toBe(409);
        expect(res.body).toMatch("ClientId mismatch.");
        expect(isDalcalled).toBeFalsy();
      });

      it("should return 400 when the body is missing paymentAmount", async () => {
        const req: any = new Request("/balances/deposit/1", {
          method: "POST",
          headers: {
            profile_id: 1,
          },
        });
        req.params = { userId: 1 };
        req.profile = { id: 1 };
        req.body = {};

        const dal = new PaymentDal();
        const jobDal = new JobDal();
        let isDalcalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.updateBalanceWithDeposit = async (profileId: number, paymentAmount) => {
          isDalcalled = true;
          return { response: PaymentStatusEnum.Success, balance: 1234 };
        };

        const controller = new PaymentController(dal, jobDal);

        await controller.payDeposit(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatch("Body is missing a payment amount");
        expect(isDalcalled).toBeFalsy();
      });

      it("should return 400 when the body has an invalid paymentAmount", async () => {
        const req: any = new Request("/balances/deposit/1", {
          method: "POST",
          headers: {
            profile_id: 1,
          },
        });
        req.params = { userId: 1 };
        req.profile = { id: 1 };
        req.body = { paymentAmount: "FAKE" };

        const dal = new PaymentDal();
        const jobDal = new JobDal();
        let isDalcalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.updateBalanceWithDeposit = async (profileId: number, paymentAmount) => {
          isDalcalled = true;
          return { response: PaymentStatusEnum.Success, balance: 1234 };
        };

        const controller = new PaymentController(dal, jobDal);

        await controller.payDeposit(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatch("PaymentAmount of FAKE is invalid.");
        expect(isDalcalled).toBeFalsy();
      });

      it("should return 422 when the saving to the database fails", async () => {
        const req: any = new Request("/balances/deposit/1", {
          method: "POST",
          headers: {
            profile_id: 1,
          },
        });
        req.params = { userId: 1 };
        req.profile = { id: 1 };
        req.body = { paymentAmount: "1234" };

        const dal = new PaymentDal();
        const jobDal = new JobDal();
        let isDalcalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.updateBalanceWithDeposit = async (profileId: number, paymentAmount) => {
          isDalcalled = true;
          return { response: PaymentStatusEnum.Failed, balance: null };
        };

        const controller = new PaymentController(dal, jobDal);

        await controller.payDeposit(req, res);

        expect(res.statusCode).toBe(422);
        expect(res.body).toMatch(PaymentStatusEnum.Failed);
        expect(isDalcalled).toBeTruthy();
      });
    });
  });

  describe("payByJobId", () => {
    beforeEach(() => {
      res = new Response();
    });

    afterEach(() => {
      res.resetMocked();
    });

    describe("success", () => {
      it("should return 204 and an updated balance", async () => {
        const req: any = new Request("/jobs/:1/pay", {
          method: "POST",
          headers: {
            profile_id: 1,
          },
        });
        req.profile = { id: 1 };
        req.params = { id: 1 };
        req.body = { paymentAmount: 100 };

        const dal = new PaymentDal();
        const jobDal = new JobDal();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jobDal.getById = async (profileId, jobId) => {
          return { dataValues: { price: 100 } };
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.payJob = async (jobId: number, paymentAmount) => {
          return PaymentStatusEnum.Success;
        };

        const controller = new PaymentController(dal, jobDal);

        await controller.payByJobId(req, res);

        expect(res.statusCode).toBe(200);
      });
    });

    describe("failure", () => {
      it("should return 400 when the body is missing paymentAmount", async () => {
        const req: any = new Request("/jobs/1/pay", {
          method: "POST",
          headers: {
            profile_id: 1,
          },
        });
        req.params = { id: 1 };
        req.profile = { id: 1 };
        req.body = {};

        const dal = new PaymentDal();
        const jobDal = new JobDal();
        let isDalcalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jobDal.getById = async (profileId, jobId) => {
          return { dataValues: { price: 100 } };
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.payJob = async (profileId: number, paymentAmount) => {
          isDalcalled = true;
          return PaymentStatusEnum.Success;
        };

        const controller = new PaymentController(dal, jobDal);

        await controller.payByJobId(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatch("Body is missing a payment amount");
        expect(isDalcalled).toBeFalsy();
      });

      it("should return 400 when the body has an invalid paymentAmount", async () => {
        const req: any = new Request("/jobs/1/pay1", {
          method: "POST",
          headers: {
            profile_id: 1,
          },
        });
        req.params = { id: 1 };
        req.profile = { id: 1 };
        req.body = { paymentAmount: "FAKE" };

        const dal = new PaymentDal();
        const jobDal = new JobDal();
        let isDalcalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jobDal.getById = async (profileId, jobId) => {
          return { dataValues: { price: 100 } };
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.payJob = async (profileId: number, paymentAmount) => {
          isDalcalled = true;
          return PaymentStatusEnum.Success;
        };

        const controller = new PaymentController(dal, jobDal);

        await controller.payByJobId(req, res);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatch("PaymentAmount of FAKE is invalid.");
        expect(isDalcalled).toBeFalsy();
      });

      it("should return 422 when the saving to the database fails", async () => {
        const req: any = new Request("/jobs/1/pay", {
          method: "POST",
          headers: {
            profile_id: 1,
          },
        });
        req.params = { id: 1 };
        req.profile = { id: 1 };
        req.body = { paymentAmount: "1234" };

        const dal = new PaymentDal();
        const jobDal = new JobDal();
        let isDalcalled = false;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jobDal.getById = async (profileId, jobId) => {
          return { dataValues: { price: 100 } };
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        dal.payJob = async (profileId: number, paymentAmount) => {
          isDalcalled = true;
          return PaymentStatusEnum.Failed;
        };

        const controller = new PaymentController(dal, jobDal);

        await controller.payByJobId(req, res);

        expect(res.statusCode).toBe(422);
        expect(res.body).toMatch(PaymentStatusEnum.Failed);
        expect(isDalcalled).toBeTruthy();
      });
    });
  });
});
