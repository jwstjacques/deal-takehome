import { Response } from "express";

import AdminDal from "../dal/AdminDal";
import HelperFunctions from "../helpers/HelperFunctions";
import RequestWithProfile from "../interface/RequestWithProfile";

export default class AdminController {
  private _adminDal: AdminDal;

  constructor(adminDal: AdminDal) {
    this._adminDal = adminDal;
  }

  /**
   * Returns the highest paid out profession for a given date range.
   *
   * GET /admin/best-profession?start=<date>&end=<date>
   *
   * @param {RequestWithProfile} req
   * @param {Response} res
   */
  public getBestProfession = async (req: RequestWithProfile, res: Response): Promise<void> => {
    try {
      const query = req.query;

      if (
        !query?.start ||
        !query?.end ||
        !HelperFunctions.validateDateRange(query.start as string, query.end as string)
      ) {
        const message = "Invalid date range.";
        res.status(400).send(message);
        return;
      }

      const profession = await this._adminDal.getBestProfession(
        query.start as string,
        query.end as string
      );

      res.status(200).send(profession);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  /**
   * Gets the highest paying clients for a given date range, with an optional limit.
   *
   * GET /admin/best-clients?start=<date>&end=<date>&limit=<integer>
   *
   * @param {RequestWithProfile} req
   * @param {Response} res
   */
  public listBestClients = async (req: RequestWithProfile, res: Response): Promise<void> => {
    try {
      const query = req.query;

      if (
        !query?.start ||
        !query?.end ||
        !HelperFunctions.validateDateRange(query.start as string, query.end as string)
      ) {
        const message = "Invalid date range.";
        res.status(400).send(message);
        return;
      }

      if (
        query.limit &&
        (isNaN(parseInt(query.limit as string)) || parseInt(query.limit as string) < 1)
      ) {
        const message = "Limit is not a valid integer.";
        res.status(400).send(message);
        return;
      }

      const limit = query.limit ? parseInt(query.limit as string) : undefined;

      const clients = await this._adminDal.getBestClients(
        query.start as string,
        query.end as string,
        limit
      );

      res.status(200).send(clients);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}
