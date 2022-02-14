/* istanbul ignore file */
import { ContractStatusEnum } from "../src/enum/ContractStatusEnum";
import { ProfileTypeEnum } from "../src/enum/ProfileTypeEnum";
import { Contract, Job, Profile } from "../src/model";

export default class TestHelpers {
  public static async createProfile(
    profileType: ProfileTypeEnum,
    values: any = {}
  ): Promise<number> {
    const profileId = await Profile.max("id");

    const newProfile = await Profile.create({
      id: profileId + 1,
      firstName: "UnitTest",
      lastName: values.lastName || "LastName",
      profession: values.profession || "UnitTest",
      balance: values.balance || 0,
      type: profileType,
    });

    return newProfile.dataValues.id;
  }

  public static async createContract(
    clientId: number,
    contractorId: number,
    status: ContractStatusEnum
  ): Promise<number> {
    const contractId = await Contract.max("id");

    const newContract = await Contract.create({
      id: contractId + 1,
      terms: "for unitTest",
      status: status,
      ClientId: clientId,
      ContractorId: contractorId,
    });

    return newContract.dataValues.id;
  }

  public static async createJob(
    contractId: number,
    price: number,
    description: string,
    paymentDate: string | null
  ): Promise<number> {
    const jobId = await Job.max("id");

    const newJob = await Job.create({
      id: jobId + 1,
      ContractId: contractId,
      description,
      price,
      paymentDate,
      paid: paymentDate ? true : null,
    });

    return newJob.dataValues.id;
  }

  public static async deleteProfiles(ids: number[]): Promise<void> {
    await Profile.destroy({
      where: {
        id: ids,
      },
    });
  }

  public static async deleteContracts(ids: number[]): Promise<void> {
    await Contract.destroy({
      where: {
        id: ids,
      },
    });
  }

  public static async deleteJobs(ids: number[]): Promise<void> {
    await Job.destroy({
      where: {
        id: ids,
      },
    });
  }
}
