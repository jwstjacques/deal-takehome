import { Response } from "express";

import JobDal from "../dal/JobDal";
import RequestWithProfile from "../interface/RequestWithProfile";

export default class JobController {
  private _dal: JobDal;

  constructor(dal: JobDal) {
    this._dal = dal;
  }

  /**
   * Get all unpaid jobs related to a the user's profileId.
   * Includes jobs as a client OR customer
   *
   * GET /jobs/unpaid
   *
   * @param {RequestWithProfile} req
   * @param {Response} res
   */
  public listUnpaid = async (req: RequestWithProfile, res: Response): Promise<void> => {
    try {
      const profile = req.profile;

      const contracts = await this._dal.listUnpaidByProfileId(profile.id);

      res.status(200).send(contracts);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}
