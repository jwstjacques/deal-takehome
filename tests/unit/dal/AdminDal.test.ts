import moment from "moment";

import AdminDal from "../../../src/dal/AdminDal";
import { ContractStatusEnum } from "../../../src/enum/ContractStatusEnum";
import { ProfileTypeEnum } from "../../../src/enum/ProfileTypeEnum";
import { Job, Profile } from "../../../src/model";
import TestHelpers from "../../TestHelper";

jest.setTimeout(5000);

describe("AdminDal", () => {
  describe("getBestClients", () => {
    describe("success", () => {
      let clientIds: number[] = [];
      const contractorIds: number[] = [];
      let contractIds: number[] = [];
      const jobIds: number[] = [];

      beforeAll(async () => {
        const attributes = { lastName: "BestClientTest", balance: 500 };

        const contractorId = await TestHelpers.createProfile(
          ProfileTypeEnum.Contractor,
          attributes
        );
        contractorIds.push(contractorId);

        const clientId = await TestHelpers.createProfile(ProfileTypeEnum.Client, {
          lastName: "Lowest",
          balance: 500,
        });
        const clientId2 = await TestHelpers.createProfile(ProfileTypeEnum.Client, {
          lastName: "Middle",
          balance: 1000,
        });
        const clientId3 = await TestHelpers.createProfile(ProfileTypeEnum.Client, {
          lastName: "Highest",
          balance: 1500,
        });

        clientIds = [clientId, clientId2, clientId3];

        const contractId = await TestHelpers.createContract(
          clientId,
          contractorId,
          ContractStatusEnum.InProgress
        );
        const contractId2 = await TestHelpers.createContract(
          clientId2,
          contractorId,
          ContractStatusEnum.InProgress
        );
        const contractId3 = await TestHelpers.createContract(
          clientId3,
          contractorId,
          ContractStatusEnum.InProgress
        );
        contractIds = [contractId, contractId2, contractId3];

        for (let i = 0; i < 3; i++) {
          let description = "LowestPaid";

          if (i === 1) {
            description = "MiddlePaid";
          } else if (i === 2) {
            description = "HighestPaid";
          }

          const day = 1 + i;
          const jobId = await TestHelpers.createJob(
            contractIds[i],
            100 * (i + 1),
            description,
            moment(`2060-02-0${day}`).toString()
          );

          jobIds.push(jobId);
        }

        // Will not be in date range -- Lowest increase by 100
        const jobId1 = await TestHelpers.createJob(
          contractId,
          100,
          "HighestPaid -- Out of Date Range",
          moment("2060-02-15").toString()
        );

        jobIds.push(jobId1);

        // Unpaid -- Will not show up
        const jobId2 = await TestHelpers.createJob(contractId3, 300, "HighestPaid -- Unpaid", null);

        jobIds.push(jobId2);
      });

      afterAll(async () => {
        await TestHelpers.deleteJobs(jobIds);
        await TestHelpers.deleteContracts([...contractIds]);
        await TestHelpers.deleteProfiles([...clientIds, ...contractorIds]);
      });

      it("should return an array of 2 in order by payment when no limit is submitted", async () => {
        const dal = new AdminDal();

        const result = await dal.getBestClients("2060-02-01", "2060-02-14");
        expect(result.length).toBe(2);
        expect(result[0].lastName).toBe("Highest");
        expect(result[1].lastName).toBe("Middle");
        expect(result[0].Payments).toBe(300);
        expect(result[1].Payments).toBe(200);
      });

      it("should return an array of 3 in order by payment when a limit of 3 is submitted", async () => {
        const dal = new AdminDal();

        const result = await dal.getBestClients("2060-02-01", "2060-02-15", 3);
        expect(result.length).toBe(3);
        expect(result[0].lastName).toBe("Highest");
        expect(result[1].lastName).toBe("Lowest");
        expect(result[2].lastName).toBe("Middle");
        expect(result[0].Payments).toBe(300);
        expect(result[1].Payments).toBe(200);
        expect(result[2].Payments).toBe(200);
      });

      it("should return an empty array when no results exist for date range", async () => {
        const dal = new AdminDal();

        const result = await dal.getBestClients("2051-02-01", "2051-02-14");
        expect(result).toMatchObject([]);
      });
    });

    describe("failure", () => {
      it("should throw error for invalid startDate", async () => {
        const dal = new AdminDal();

        const startDate = "Fake";
        const endDate = "2050-12-31";

        const call = async () => {
          await dal.getBestClients(startDate, endDate);
        };

        await expect(call).rejects.toThrow('Start date: "Fake" is invalid.');
      });

      it("should throw error for invalid endDate", async () => {
        const dal = new AdminDal();

        const startDate = "2050-12-31";
        const endDate = "Fake";

        const call = async () => {
          await dal.getBestClients(startDate, endDate);
        };

        await expect(call).rejects.toThrow('End date: "Fake" is invalid.');
      });

      it("should throw error for invalid endDate", async () => {
        const dal = new AdminDal();

        const startDate = "2050-12-31";
        const endDate = "2050-01-31";

        const call = async () => {
          await dal.getBestClients(startDate, endDate);
        };

        await expect(call).rejects.toThrow(
          "Invalid date range. End date 2050-01-31 comes before 2050-12-31"
        );
      });
    });
  });

  describe("getBestProfession", () => {
    describe("success", () => {
      let profileIds: number[] = [];
      let contractIds: number[] = [];
      let jobIds: number[] = [];

      beforeAll(async () => {
        // Just in case
        await Job.destroy({
          where: {
            description: ["BestProfession", "Different"],
          },
        });
        await Profile.destroy({
          where: {
            profession: ["Jedi", "Sith"],
          },
        });

        const attributes = { lastName: "BestProfessionTest", balance: 500 };

        const clientId = await TestHelpers.createProfile(ProfileTypeEnum.Client, attributes);
        const contractorId = await TestHelpers.createProfile(ProfileTypeEnum.Contractor, {
          ...attributes,
          profession: "Jedi",
        });
        const contractorId2 = await TestHelpers.createProfile(ProfileTypeEnum.Contractor, {
          ...attributes,
          profession: "Jedi",
        });
        const contractorId3 = await TestHelpers.createProfile(ProfileTypeEnum.Contractor, {
          ...attributes,
          profession: "Jedi",
        });
        const contractorId4 = await TestHelpers.createProfile(ProfileTypeEnum.Contractor, {
          ...attributes,
          profession: "Jedi",
        });
        const contractorId5 = await TestHelpers.createProfile(ProfileTypeEnum.Contractor, {
          ...attributes,
          profession: "Jedi",
        });
        const contractorId6 = await TestHelpers.createProfile(ProfileTypeEnum.Contractor, {
          ...attributes,
          profession: "Sith",
        });
        profileIds = [
          clientId,
          contractorId,
          contractorId2,
          contractorId3,
          contractorId4,
          contractorId5,
          contractorId6,
        ];

        const contractId = await TestHelpers.createContract(
          clientId,
          contractorId,
          ContractStatusEnum.InProgress
        );
        const contractId2 = await TestHelpers.createContract(
          clientId,
          contractorId2,
          ContractStatusEnum.InProgress
        );
        const contractId3 = await TestHelpers.createContract(
          clientId,
          contractorId3,
          ContractStatusEnum.InProgress
        );
        const contractId4 = await TestHelpers.createContract(
          clientId,
          contractorId4,
          ContractStatusEnum.InProgress
        );
        const contractId5 = await TestHelpers.createContract(
          clientId,
          contractorId5,
          ContractStatusEnum.InProgress
        );
        const contractId6 = await TestHelpers.createContract(
          clientId,
          contractorId6,
          ContractStatusEnum.InProgress
        );

        contractIds = [contractId, contractId2, contractId3, contractId4, contractId5, contractId6];

        // Will be in result
        const jobId1 = await TestHelpers.createJob(
          contractId,
          100,
          "BestProfession",
          moment("2050-02-01").toString()
        );
        // Will be in result
        const jobId2 = await TestHelpers.createJob(
          contractId2,
          100,
          "BestProfession",
          moment("2050-02-14").toString()
        );
        // Outside of date range
        const jobId3 = await TestHelpers.createJob(
          contractId3,
          100,
          "BestProfession",
          moment("2050-02-17").toString()
        );

        // Not paid
        const jobId4 = await TestHelpers.createJob(contractId4, 100, "BestProfession", null);
        // Different description
        const jobId5 = await TestHelpers.createJob(
          contractId5,
          100,
          "Different",
          moment("2050-02-14").toString()
        );

        const jobId6 = await TestHelpers.createJob(
          contractId6,
          500,
          "Sith Job",
          moment("2050-02-14").toString()
        );
        const jobId7 = await TestHelpers.createJob(
          contractId6,
          500,
          "Sith Job",
          moment("2050-02-14").toString()
        );

        jobIds = [jobId1, jobId2, jobId3, jobId4, jobId5, jobId6, jobId7];
      });

      afterAll(async () => {
        await TestHelpers.deleteJobs(jobIds);
        await TestHelpers.deleteContracts(contractIds);
        await TestHelpers.deleteProfiles(profileIds);
      });

      it("should return an object of prefession: Sith and total: 1000 when results exist for date range", async () => {
        const dal = new AdminDal();

        const result = await dal.getBestProfession("2050-02-01", "2050-02-14");
        expect(result[0]).toMatchObject({
          profession: "Sith",
          Payments: 1000,
        });
      });

      it("should return an empty object when no results exist for date range", async () => {
        const dal = new AdminDal();

        const result = await dal.getBestProfession("2051-02-01", "2051-02-14");
        expect(result).toMatchObject({});
      });
    });

    describe("failure", () => {
      it("should throw error for invalid startDate", async () => {
        const dal = new AdminDal();

        const startDate = "Fake";
        const endDate = "2050-12-31";

        const call = async () => {
          await dal.getBestProfession(startDate, endDate);
        };

        await expect(call).rejects.toThrow('Start date: "Fake" is invalid.');
      });

      it("should throw error for invalid endDate", async () => {
        const dal = new AdminDal();

        const startDate = "2050-12-31";
        const endDate = "Fake";

        const call = async () => {
          await dal.getBestProfession(startDate, endDate);
        };

        await expect(call).rejects.toThrow('End date: "Fake" is invalid.');
      });

      it("should throw error for invalid endDate", async () => {
        const dal = new AdminDal();

        const startDate = "2050-12-31";
        const endDate = "2050-01-31";

        const call = async () => {
          await dal.getBestProfession(startDate, endDate);
        };

        await expect(call).rejects.toThrow(
          "Invalid date range. End date 2050-01-31 comes before 2050-12-31"
        );
      });
    });
  });
});
