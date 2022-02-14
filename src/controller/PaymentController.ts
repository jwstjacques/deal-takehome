import { Response } from "express";

import JobDal from "../dal/JobDal";
import PaymentDal from "../dal/PaymentDal";
import { PaymentStatusEnum } from "../enum/PaymentStatusEnum";
import RequestWithProfile from "../interface/RequestWithProfile";
import { Profile } from "../model";

export default class PaymentController {
  private _dal: PaymentDal;
  private _jobDal: JobDal;

  constructor(dal: PaymentDal, jobDal: JobDal) {
    this._dal = dal;
    this._jobDal = jobDal;
  }

  /**
   * Pay full amount for a job, from balance of profile user.
   *
   * POST /jobs/:id/pay
   *
   * @param {RequestWithProfile} req
   * @param {Response} res
   */
  public payByJobId = async (req: RequestWithProfile, res: Response): Promise<void> => {
    try {
      const jobId = parseInt(req.params.id);
      const paymentAmount = req.body?.paymentAmount;

      if (!paymentAmount) {
        const message = "Body is missing a payment amount.";
        res.status(400).send(message);
        return;
      }

      if (isNaN(Number(paymentAmount)) || Number(paymentAmount) < 0) {
        const message = `PaymentAmount of ${paymentAmount} is invalid.`;
        res.status(400).send(message);
        return;
      }

      if (isNaN(jobId)) {
        const message = `The job with the jobId: ${jobId} does not exist for this profile.`;
        res.status(404).send(message);
        return;
      }

      const profile = req.profile as Profile;

      // GET JOB
      const job = await this._jobDal.getById(profile.id, jobId);

      if (!job) {
        const message = `The job with the jobId: ${jobId} does not exist for this profile.`;
        // TODO: Redirect
        res.status(404).send(message);
        return;
      }

      if (profile.balance < job?.dataValues?.price) {
        const message = "Insufficient Funds.";
        // This should probably be something not 400 -- it is a precondition
        res.status(400).send(message);
        // redirect
        return;
      }

      const result = await this._dal.payJob(jobId, paymentAmount);

      if (result !== PaymentStatusEnum.Success) {
        res.status(422).send(result);
        return;
      }

      // Should probably be something other than 200
      res.sendStatus(200);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  /**
   * Update Client balance with a deposit PaymentAmount.
   *
   * POST /balances/deposit/:userId
   * @param {RequesetWithProfile} req
   * @param {Response} res
   * @returns
   */
  payDeposit = async (req: RequestWithProfile, res: Response): Promise<void> => {
    try {
      const profile = req.profile as Profile;
      const paymentAmount = req.body?.paymentAmount;
      const clientId = parseInt(req.params.userId);

      if (profile.id !== clientId) {
        const message = "ClientId mismatch.";
        res.status(409).send(message);
        return;
      }

      if (!paymentAmount) {
        const message = "Body is missing a payment amount.";
        res.status(400).send(message);
        return;
      }

      if (isNaN(Number(paymentAmount)) || Number(paymentAmount) < 0) {
        const message = `PaymentAmount of ${paymentAmount} is invalid.`;
        res.status(400).send(message);
        return;
      }

      const result = await this._dal.updateBalanceWithDeposit(profile.id, paymentAmount);

      if (result.response !== PaymentStatusEnum.Success) {
        res.status(422).send(result.response);
        return;
      }

      res.status(200).send({ newBalance: result.balance });
    } catch (error) {
      res.status(500).send(error);
    }
  };
}
