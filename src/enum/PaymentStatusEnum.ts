export enum PaymentStatusEnum {
  Success = "Success",
  ClientDoesNotExist = "Client does not exist.",
  ContractorDoesNotExist = "Contractor does not exist.",
  DespositExceedsMaxAmount = "Deposit exceeds maximum amount.",
  MustExceedZero = "Payment amount must be greater than $0.00",
  Failed = "Failed",
  JobDoesNotExist = "Job does not exist.",
  PaymentAmountExceedsJobPay = "PaymentAmount exceeds job pay.",
  JobAlreadyPaid = "Job has already been paid.",
  ContractTerminated = "Contract has been terminated",
}
