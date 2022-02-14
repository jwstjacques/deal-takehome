import { Op } from "sequelize";

import { ContractStatusEnum } from "../enum/ContractStatusEnum";
import { ProfileAliasEnum } from "../enum/ProfileAliasEnum";
import { ProfileTypeEnum } from "../enum/ProfileTypeEnum";
import { Contract, Job, Profile } from "../model";

export default class ContractDal {
  /**
   * Retreive a contract for a given ID, and profile ID.
   *
   * @param {number} profileId
   * @param {number} contractId
   *
   * @returns Contract with associated profiles for contractor and client.
   */
  public async getById(profileId: number, contractId: number): Promise<Contract> {
    try {
      const contract = await Contract.findOne({
        where: {
          id: contractId,
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
            model: Profile,
            where: { type: ProfileTypeEnum.Client },
            required: true,
            as: ProfileAliasEnum.Client,
          },
          {
            model: Profile,
            where: { type: ProfileTypeEnum.Contractor },
            required: true,
            as: ProfileAliasEnum.Contractor,
          },
        ],
      });

      return contract;
    } catch (error) /* istanbul ignore next */ {
      throw new Error(error);
    }
  }

  /**
   * Retreive a list of contracts belonging to a given profile ID.
   *
   * @param {number} profileId
   *
   * @returns {Contract[]}
   */
  public async listByProfileId(profileId: number): Promise<Contract[]> {
    try {
      const contracts = await Contract.findAll({
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
          },
        ],
      });

      return contracts;
    } catch (error) /* istanbul ignore next */ {
      throw new Error(error);
    }
  }
}
