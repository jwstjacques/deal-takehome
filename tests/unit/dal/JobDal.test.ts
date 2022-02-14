import moment from "moment";

import JobDal from "../../../src/dal/JobDal";
import { ContractStatusEnum } from "../../../src/enum/ContractStatusEnum";
import { ProfileTypeEnum } from "../../../src/enum/ProfileTypeEnum";
import { Profile } from "../../../src/model";
import TestHelpers from "../../TestHelper";

describe("JobDal", () => {
  const profileIds: number[] = [];
  let contractIds: number[] = [];
  const jobIds: number[] = [];

  beforeAll(async () => {
    const attributes = { lastName: "ContractDalTest", balance: 500 };

    const contractorId = await TestHelpers.createProfile(ProfileTypeEnum.Contractor, attributes);
    profileIds.push(contractorId);

    const clientId = await TestHelpers.createProfile(ProfileTypeEnum.Client, {
      lastName: "Lowest",
      balance: 500,
    });
    profileIds.push(clientId);

    const contractId = await TestHelpers.createContract(
      clientId,
      contractorId,
      ContractStatusEnum.InProgress
    );
    const contractId2 = await TestHelpers.createContract(
      clientId,
      contractorId,
      ContractStatusEnum.Terminated
    );
    contractIds = [contractId, contractId2];

    const jobId = await TestHelpers.createJob(
      contractIds[0],
      100,
      "FirstJob",
      moment("2060-02-01").toString()
    );
    jobIds.push(jobId);

    const jobId2 = await TestHelpers.createJob(contractIds[0], 200, "SecondJob", null);
    jobIds.push(jobId2);
    const jobId3 = await TestHelpers.createJob(contractIds[0], 300, "ThirdJob", null);
    jobIds.push(jobId3);
  });

  afterAll(async () => {
    await TestHelpers.deleteJobs(jobIds);
    await TestHelpers.deleteContracts(contractIds);
    await TestHelpers.deleteProfiles(profileIds);
  });

  describe("getById", () => {
    it("should return an array of length 2 for a contractor with 2 unpaid jobs", async () => {
      const dal = new JobDal();

      const profileId = profileIds[1];
      const jobId = jobIds[1];

      const res = await dal.getById(1, 1);
      console.log(res);

      const result = await dal.getById(profileId, jobId);

      expect(result.dataValues.ClientId).toBe(profileId);
      expect(result.dataValues.Jobs[0].dataValues.id).toBe(jobId);
    });
  });

  describe("listUnpaidByProfileId", () => {
    it("should return an array of length 2 for a contractor with 2 unpaid jobs", async () => {
      const dal = new JobDal();

      // In real world this would be assigned to inserted data
      const profileId = profileIds[0];

      const result = await dal.listUnpaidByProfileId(profileId);

      expect(result[0].dataValues.Jobs.length).toBe(2);
    });

    it("should return an array of length 1 for a client with 2 unpaid jobs", async () => {
      const dal = new JobDal();

      // In real world this would be assigned to inserted data
      const profileId = profileIds[1];

      const result = await dal.listUnpaidByProfileId(profileId);

      expect(result[0].dataValues.Jobs.length).toBe(2);
    });

    it("should return an empty array for a profile with no unpaid jobs", async () => {
      const dal = new JobDal();

      const profileId = (await Profile.max("id")) + 1000;

      const result = await dal.listUnpaidByProfileId(profileId);
      expect(result.length).toBe(0);
    });
  });
});
