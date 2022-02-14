import moment from "moment";

import ContractDal from "../../../src/dal/ContractDal";
import { ContractStatusEnum } from "../../../src/enum/ContractStatusEnum";
import { ProfileTypeEnum } from "../../../src/enum/ProfileTypeEnum";
import TestHelpers from "../../TestHelper";

describe("ContractDal", () => {
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

    const jobId2 = await TestHelpers.createJob(
      contractIds[0],
      100,
      "FirstJob",
      moment("2060-02-01").toString()
    );
    jobIds.push(jobId2);
  });

  afterAll(async () => {
    await TestHelpers.deleteJobs(jobIds);
    await TestHelpers.deleteContracts(contractIds);
    await TestHelpers.deleteProfiles(profileIds);
  });

  describe("getById", () => {
    it("should return matching contract for a matching profileId/contractId", async () => {
      const dal = new ContractDal();

      const profileId = profileIds[1];
      const contractId = contractIds[0];

      const result = await dal.getById(profileId, contractId);
      expect(result.Client).toBeTruthy();
      expect(result.Contractor).toBeTruthy();
      expect(result.id).toBe(contractId);
      expect(result.ClientId).toBe(profileId);
    });

    it("should return null for a non-matching profileId/contractId", async () => {
      const dal = new ContractDal();

      const profileId = 12345;
      const contractId = contractIds[0];

      const result = await dal.getById(profileId, contractId);
      expect(result).toBeNull();
    });
  });

  describe("listByProfileId", () => {
    it("should return an array of length 1 for a profile with 2 contracts where 1 is terminated", async () => {
      const dal = new ContractDal();

      const profileId = profileIds[1];

      const result = await dal.listByProfileId(profileId);

      expect(result.length).toBe(1);
    });

    it("should return an empty array for a profile with no contracts", async () => {
      const dal = new ContractDal();

      // In real world this would be assigned to an ID that is KNOWN to not exist
      const profileId = 123456789;

      const result = await dal.listByProfileId(profileId);
      expect(result.length).toBe(0);
    });
  });
});
