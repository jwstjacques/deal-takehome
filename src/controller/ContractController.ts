import { Response } from "express";

import ContractDal from "../dal/ContractDal";
import RequestWithProfile from "../interface/RequestWithProfile";

export default class ContractController {
  private _dal: ContractDal;

  constructor(dal: ContractDal) {
    this._dal = dal;
  }

  /**
   * Gets a contract for a given productID if the user has an associated profileId.
   *
   * GET /contracts/:id
   *
   * @param {RequestWithProfile} req
   * @param {Response} res
   */
  public getById = async (req: RequestWithProfile, res: Response): Promise<void> => {
    try {
      const contractId = parseInt(req.params.id);

      if (isNaN(contractId)) {
        const message = `Bad Request. ContractId: ${req.params.id} in path is invalid.`;
        res.status(400).send(message);
        return;
      }

      const profile = req.profile;

      const contract = await this._dal.getById(profile.id, contractId);

      if (!contract) {
        const message = `The contract with the contractId: ${contractId} does not exist for this profile.`;
        res.status(404).send(message);
        return;
      }

      res.status(200).send(contract);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  /**
   * List all contracts for a given profileId.
   * GET /contracts
   *
   * @param {RequestWithProfile} req
   * @param {Response} res
   */
  public list = async (req: RequestWithProfile, res: Response): Promise<void> => {
    try {
      const profile = req.profile;

      const contracts = await this._dal.listByProfileId(profile.id);

      res.status(200).send(contracts);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}
