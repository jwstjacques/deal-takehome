import moment from "moment";

import PaymentDal from "../../../src/dal/PaymentDal";
import { ContractStatusEnum } from "../../../src/enum/ContractStatusEnum";
import { PaymentStatusEnum } from "../../../src/enum/PaymentStatusEnum";
import { ProfileTypeEnum } from "../../../src/enum/ProfileTypeEnum";
import { Job, Profile } from "../../../src/model";
import TestHelpers from "../../TestHelper";

jest.setTimeout(10000);

describe("PaymentDal", () => {
  describe("updateBalanceWithDeposit", () => {
    const profileIds: number[] = [];
    const jobIds: number[] = [];
    const contractIds: number[] = [];

    beforeAll(async () => {
      // Create client
      const clientId = await TestHelpers.createProfile(ProfileTypeEnum.Client, {
        lastName: "UpdateBalanceTest",
        balance: 1000,
      });
      const contractorId = await TestHelpers.createProfile(ProfileTypeEnum.Contractor, {
        lastName: "UpdateBalanceTest",
      });
      profileIds.push(clientId);
      profileIds.push(contractorId);

      const contractId = await TestHelpers.createContract(
        clientId,
        contractorId,
        ContractStatusEnum.InProgress
      );
      const contractId2 = await TestHelpers.createContract(
        clientId,
        contractorId,
        ContractStatusEnum.InProgress
      );

      contractIds.push(contractId);
      contractIds.push(contractId2);

      const jobId = await TestHelpers.createJob(contractId, 1000, "DepositJob", null);
      const jobId2 = await TestHelpers.createJob(contractId, 2000, "DepositJob", null);
      const jobId3 = await TestHelpers.createJob(
        contractId2,
        3000,
        "Paid Job -- Won't Show Up",
        moment().toString()
      );

      jobIds.push(jobId);
      jobIds.push(jobId2);
      jobIds.push(jobId3);
    });

    afterAll(async () => {
      await TestHelpers.deleteJobs(jobIds);
      await TestHelpers.deleteContracts(contractIds);
      await TestHelpers.deleteProfiles(profileIds);
    });

    describe("success", () => {
      it("should deposit 250 into the client's account.", async () => {
        const dal = new PaymentDal();

        const profileId = profileIds[0];
        const paymentAmount = 250;

        const clientBeforeUpdate = await Profile.findOne({ where: { id: profileId } });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.updateBalanceWithDeposit(profileId, paymentAmount);

        expect(result).toMatchObject({ response: PaymentStatusEnum.Success, balance: 1250 });

        const client = await Profile.findOne({ where: { id: profileId } });

        expect(client.dataValues.balance).toBe(1250);
        expect(client.dataValues.updatedAt).not.toBe(clientBeforeUpdate.dataValues.updatedAt);
      });
    });

    describe("failure", () => {
      it("should reject 10000 deposit.", async () => {
        const dal = new PaymentDal();

        const profileId = profileIds[0];
        const paymentAmount = 10000;

        const clientBeforeUpdate = await Profile.findOne({ where: { id: profileId } });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.updateBalanceWithDeposit(profileId, paymentAmount);

        expect(result).toMatchObject({
          response: PaymentStatusEnum.DespositExceedsMaxAmount,
          balance: clientBeforeUpdate.dataValues.balance,
        });

        const client = await Profile.findOne({ where: { id: profileId } });

        expect(client.dataValues.balance).toBe(clientBeforeUpdate.dataValues.balance);
      });

      it("should reject negative deposit.", async () => {
        const dal = new PaymentDal();

        const profileId = profileIds[0];
        const paymentAmount = -1;

        const clientBeforeUpdate = await Profile.findOne({ where: { id: profileId } });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.updateBalanceWithDeposit(profileId, paymentAmount);

        expect(result).toMatchObject({
          response: PaymentStatusEnum.MustExceedZero,
          balance: null,
        });

        const client = await Profile.findOne({ where: { id: profileId } });

        expect(client.dataValues.balance).toBe(clientBeforeUpdate.dataValues.balance);
      });

      it("should send error when client does not exist", async () => {
        const dal = new PaymentDal();

        const profileId = (await Profile.max("id")) + 1000;
        const paymentAmount = 100;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.updateBalanceWithDeposit(profileId, paymentAmount);

        expect(result).toMatchObject({
          response: PaymentStatusEnum.ClientDoesNotExist,
          balance: null,
        });
      });
    });
  });

  describe("payJob", () => {
    const profileIds: number[] = [];
    const jobIds: number[] = [];
    const contractIds: number[] = [];

    beforeAll(async () => {
      // Create client
      const clientId = await TestHelpers.createProfile(ProfileTypeEnum.Client, {
        lastName: "UpdateBalanceTest",
        balance: 1000,
      });
      const contractorId = await TestHelpers.createProfile(ProfileTypeEnum.Contractor, {
        lastName: "UpdateBalanceTest",
        balance: 0,
      });
      profileIds.push(clientId);
      profileIds.push(contractorId);

      const contractId = await TestHelpers.createContract(
        clientId,
        contractorId,
        ContractStatusEnum.InProgress
      );

      contractIds.push(contractId);

      const jobId = await TestHelpers.createJob(contractId, 1000, "DepositJob", null);

      jobIds.push(jobId);
    });

    afterAll(async () => {
      await TestHelpers.deleteJobs(jobIds);
      await TestHelpers.deleteContracts(contractIds);
      await TestHelpers.deleteProfiles(profileIds);
    });

    describe("success", () => {
      it("should return 200 and deposit 1000 into contractors balance and remove 1000 from client's balance", async () => {
        const dal = new PaymentDal();

        const clientId = profileIds[0];
        const contractorId = profileIds[1];
        const jobId = jobIds[0];
        const paymentAmount = 1000;

        const clientBeforeUpdate = await Profile.findOne({ where: { id: clientId } });
        const contractorBeforeUpdate = await Profile.findOne({ where: { id: contractorId } });
        const jobBeforeUpdate = await Job.findOne({ where: { id: jobId } });

        expect(clientBeforeUpdate.dataValues.balance).toBe(1000);
        expect(contractorBeforeUpdate.dataValues.balance).toBe(0);
        expect(jobBeforeUpdate.dataValues.paid).toBeFalsy();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.payJob(jobId, paymentAmount);

        expect(result).toBe(PaymentStatusEnum.Success);

        const clientAfter = await Profile.findOne({ where: { id: clientId } });
        const contractorAfter = await Profile.findOne({ where: { id: contractorId } });
        const jobAfter = await Job.findOne({ where: { id: jobId } });

        expect(clientAfter.dataValues.balance).toBe(0);
        expect(contractorAfter.dataValues.balance).toBe(1000);
        expect(jobAfter.dataValues.paid).toBeTruthy();
        expect(clientAfter.dataValues.updatedAt).not.toBe(clientBeforeUpdate.dataValues.updatedAt);
        expect(contractorAfter.dataValues.updatedAt).not.toBe(
          contractorBeforeUpdate.dataValues.updatedAt
        );
        expect(jobAfter.dataValues.updatedAt).not.toBe(jobBeforeUpdate.dataValues.updatedAt);
      });
    });

    describe("failure", () => {
      it("should reject 10000 deposit.", async () => {
        const dal = new PaymentDal();

        const jobId = jobIds[0];
        const paymentAmount = 10000;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.payJob(jobId, paymentAmount);

        expect(result).toMatch(PaymentStatusEnum.PaymentAmountExceedsJobPay);
      });

      it("should reject negative deposit.", async () => {
        const dal = new PaymentDal();

        const jobId = jobIds[0];
        const paymentAmount = -1;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.payJob(jobId, paymentAmount);

        expect(result).toMatch(PaymentStatusEnum.MustExceedZero);
      });

      it("should send error when client does not exist", async () => {
        const dal = new PaymentDal();

        const jobId = (await Job.max("id")) + 1000;
        const paymentAmount = 100;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result = await dal.payJob(jobId, paymentAmount);

        expect(result).toMatch(PaymentStatusEnum.JobDoesNotExist);
      });
    });
  });
});
