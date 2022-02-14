import HelperFunctions from "../helpers/HelperFunctions";
import { sequelize } from "../model";

export default class AdminDal {
  /**
   * Returns the clients with the highest payouts for a given period, with a supplied limit.
   *
   * @param {string} startDate With format of YYYY-MM-DD
   * @param {string} endDate With format of YYYY-MM-DD
   * @param {number} limit Default of 2.
   * @returns
   */
  public async getBestClients(
    startDate: string,
    endDate: string,
    limit: number = 2
  ): Promise<any[]> {
    try {
      this._dateValidation(startDate, endDate);

      const result = await sequelize.query(`
        SELECT p.firstname, p.lastname, SUM(j.price) as "Payments"
        FROM Jobs j
        LEFT JOIN Contracts c
        on j.contractid = c.id
        LEFT JOIN Profiles p on
        c.clientId = p.id
        WHERE
        j.paymentDate >= '${startDate}' AND
        j.paymentDate <= '${endDate}T11:59:59.999Z'
        GROUP BY c.clientid
        ORDER BY "Payments" DESC, p.lastName ASC
        LIMIT ${limit}
      `);
      return result.length ? result[0] : [];
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Returns the highest paid out profession for a given period.
   *
   * @param {string} startDate
   * @param {string} endDate
   * @param {number} limit Default value of 1
   * @returns
   */
  public async getBestProfession(
    startDate: string,
    endDate: string,
    limit: number = 1
  ): Promise<any[]> {
    try {
      this._dateValidation(startDate, endDate);

      const bestProfession = await sequelize.query(`
        SELECT p.profession, SUM(j.price) as "Payments"
        FROM Jobs j
        LEFT JOIN Contracts c
        on j.ContractId = c.id
        LEFT JOIN Profiles p on
        c.ContractorId = p.id
        WHERE
        j.paymentDate >= '${startDate}' AND
        j.paymentDate <= '${endDate}T11:59:59.999Z'
        GROUP BY p.profession
        ORDER BY "Payments" DESC, p.profession ASC
        LIMIT ${limit}
      `);

      return bestProfession.length ? bestProfession[0] : [];
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Handles validation of incoming startDate and endDate.
   *
   * @param {string} startDate
   * @param {string} endDate
   */
  private _dateValidation(startDate: string, endDate: string): void {
    if (!HelperFunctions.validateDate(startDate)) {
      throw new Error(`Start date: "${startDate}" is invalid.`);
    }

    if (!HelperFunctions.validateDate(endDate)) {
      throw new Error(`End date: "${endDate}" is invalid.`);
    }

    if (!HelperFunctions.validateDateRange(startDate, endDate)) {
      throw new Error(`Invalid date range. End date ${endDate} comes before ${startDate}`);
    }
  }
}
