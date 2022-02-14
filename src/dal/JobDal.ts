import { Op } from "sequelize";

import { ContractStatusEnum } from "../enum/ContractStatusEnum";
import { Contract, Job } from "../model";

export default class JobDal {
  /**
   * Get a job by for a matching profileId and jobId.
   *
   * @param {number} profileId
   * @param {number} jobId
   * @returns
   */
  public async getById(profileId: number, jobId: number) {
    try {
      const job = await Contract.findOne({
        where: {
          [Op.or]: [
            {
              clientId: profileId,
            },
            {
              contractorId: profileId,
            },
          ],
        },
        include: [
          {
            model: Job,
            required: true,
            where: {
              id: jobId,
            },
          },
        ],
      });

      return job;
    } catch (error) /* istanbul ignore next */ {
      throw new Error(error);
    }
  }

  /**
   * Retreive a list of unpaid active jobs belonging to a given profile ID.
   *
   * @param {number} profileId
   *
   * @returns {Contract[]}
   */
  public async listUnpaidByProfileId(profileId: number): Promise<Contract[]> {
    try {
      const jobs = await Contract.findAll({
        where: {
          [Op.or]: [
            {
              clientId: profileId,
            },
            {
              contractorId: profileId,
            },
          ],
          status: { [Op.ne]: ContractStatusEnum.Terminated },
        },
        include: [
          {
            model: Job,
            required: true,
            where: {
              paid: { [Op.or]: [0, null, false] },
            },
          },
        ],
      });

      return jobs;
    } catch (error) /* istanbul ignore next */ {
      throw new Error(error);
    }
  }
}
