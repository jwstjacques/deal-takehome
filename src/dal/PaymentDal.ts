import moment from "moment";
import { Op } from "sequelize";

import { ContractStatusEnum } from "../enum/ContractStatusEnum";
import { PaymentStatusEnum } from "../enum/PaymentStatusEnum";
import { ProfileAliasEnum } from "../enum/ProfileAliasEnum";
import { ProfileTypeEnum } from "../enum/ProfileTypeEnum";
import { Contract, Job, Profile, sequelize } from "../model";

interface PaymentResponse {
  response: PaymentStatusEnum;
  balance: number | null;
}

export default class PaymentDal {
  /**
   * Adds a payment amount to a Client's balance.
   *
   * @param {number} profileId
   * @param {number} paymentAmount
   */
  public async updateBalanceWithDeposit(
    profileId: number,
    paymentAmount: number
  ): Promise<PaymentResponse> {
    let transaction = sequelize.transaction();

    try {
      if (paymentAmount <= 0) {
        return {
          response: PaymentStatusEnum.MustExceedZero,
          balance: null,
        };
      }

      transaction = await sequelize.transaction();

      const profile = await Profile.findOne({
        where: {
          type: ProfileTypeEnum.Client,
          id: profileId,
        },
      });

      if (!profile) {
        return {
          response: PaymentStatusEnum.ClientDoesNotExist,
          balance: null,
        };
      }

      const jobTotals = await Job.findOne({
        attributes: [[sequelize.fn("sum", sequelize.col("price")), "total"]],
        where: {
          paid: { [Op.or]: [0, null, false] },
        },
        include: [
          {
            model: Contract,
            where: {
              ClientId: profileId,
              status: { [Op.ne]: ContractStatusEnum.Terminated },
            },
            include: {
              attributes: ["id", "firstName", "lastName", "balance"],
              model: Profile,
              required: true,
              as: ProfileAliasEnum.Client,
            },
          },
        ],
      });

      const totalFromOutstandingJobs = jobTotals?.dataValues?.total;

      // Deposit cannot exceed 25% of outstanding jobs on non-terminated contracts
      if (!totalFromOutstandingJobs || paymentAmount > totalFromOutstandingJobs * 0.25) {
        return {
          response: PaymentStatusEnum.DespositExceedsMaxAmount,
          balance: profile.dataValues.balance,
        };
      }

      const previousBalance = profile.dataValues.balance;

      const result = await Profile.update(
        { balance: previousBalance + paymentAmount },
        { where: { id: profileId }, lock: true, transaction }
      );

      /* istanbul ignore next -- hard to reproduce */
      if (!result[0]) {
        await transaction.rollback();

        return {
          response: PaymentStatusEnum.Failed,
          balance: null,
        };
      }

      await transaction.commit();

      // Returning is not supported in SQLite
      const updatedProfile = await Profile.findOne({
        where: {
          type: ProfileTypeEnum.Client,
          id: profileId,
        },
      });

      /* istanbul ignore next -- hard to reproduce */
      if (!updatedProfile) {
        await transaction.rollback();

        return {
          response: PaymentStatusEnum.ClientDoesNotExist,
          balance: null,
        };
      }

      return {
        response: PaymentStatusEnum.Success,
        balance: updatedProfile.dataValues.balance,
      };
    } catch (error) /* istanbul ignore next -- hard to reproduce */ {
      await transaction.rollback();
      throw new Error(error);
    }
  }

  /**
   * Transfers funds from client's balance to contractor's balance
   * based on payment amount and job price validation.
   *
   * @param {number} jobId
   * @param {number} paymentAmount
   * @returns {PaymentStatusEnum}
   */
  public async payJob(jobId: number, paymentAmount: number): Promise<PaymentStatusEnum> {
    let transaction = sequelize.transaction();

    try {
      if (paymentAmount <= 0) {
        return PaymentStatusEnum.MustExceedZero;
      }

      transaction = await sequelize.transaction();

      const job = await Job.findOne({
        where: {
          id: jobId,
        },
        include: [
          {
            model: Contract,
            required: true,
            include: [
              {
                model: Profile,
                required: true,
                as: ProfileAliasEnum.Client,
              },
              {
                model: Profile,
                required: true,
                as: ProfileAliasEnum.Contractor,
              },
            ],
          },
        ],
        skipLocked: true,
      });

      if (!job) {
        return PaymentStatusEnum.JobDoesNotExist;
      }

      const amountForJob = job?.dataValues?.price;

      if (!amountForJob || paymentAmount > amountForJob) {
        return PaymentStatusEnum.PaymentAmountExceedsJobPay;
      }

      const clientBalance = job.Contract.Client.dataValues.balance;
      const contractorBalance = job.Contract.Contractor.dataValues.balance;

      const contractorResult = await Profile.update(
        { balance: contractorBalance + paymentAmount },
        { where: { id: job.Contract.Contractor.dataValues.id }, lock: true, transaction }
      );

      const clientResult = await Profile.update(
        { balance: clientBalance - paymentAmount },
        { where: { id: job.Contract.Client.dataValues.id }, lock: true, transaction }
      );

      const jobResult = await Job.update(
        { paid: true, paymentDate: moment().toString() },
        { where: { id: jobId }, lock: true, transaction }
      );

      /* istanbul ignore next -- hard to reproduce */
      if (!contractorResult[0] || !clientResult[0] || !jobResult[0]) {
        await transaction.rollback();
        return PaymentStatusEnum.Failed;
      }

      await transaction.commit();

      // Returning is not supported in SQLite
      const updatedJob = await Job.findOne({
        where: {
          id: jobId,
        },
      });

      /* istanbul ignore next -- hard to reproduce */
      if (!updatedJob || !updatedJob.dataValues.paid) {
        await transaction.rollback();

        return PaymentStatusEnum.Failed;
      }

      return PaymentStatusEnum.Success;
    } catch (error) /* istanbul ignore next -- hard to reproduce */ {
      await transaction.rollback();
      throw new Error(error);
    }
  }
}
