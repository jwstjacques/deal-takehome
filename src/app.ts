import bodyParser from "body-parser";
import express from "express";
import { exit } from "process";

import AdminController from "./controller/AdminController";
import ContractController from "./controller/ContractController";
import JobController from "./controller/JobController";
import PaymentController from "./controller/PaymentController";
import AdminDal from "./dal/AdminDal";
import ContractDal from "./dal/ContractDal";
import JobDal from "./dal/JobDal";
import PaymentDal from "./dal/PaymentDal";
import getProfile from "./middleware/getProfile";
import { sequelize } from "./model";

const app: express.Express = express();
app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

// Confirm Databasae Connection
try {
  sequelize.authenticate().then(() => {
    console.log("Connection has been established successfully.");
  });
} catch (error) {
  console.error("Unable to connect to the database:", error);
  exit(-1);
}

const adminDal = new AdminDal();
const contractDal = new ContractDal();
const jobDal = new JobDal();
const paymentDal = new PaymentDal();

const adminController = new AdminController(adminDal);
const contractController = new ContractController(contractDal);
const jobController = new JobController(jobDal);
const paymentController = new PaymentController(paymentDal, jobDal);

// Contracts
app.get("/contracts/:id", getProfile, contractController.getById);
app.get("/contracts", getProfile, contractController.list);

// Jobs
app.get("/jobs/unpaid", getProfile, jobController.listUnpaid);

// Payments
app.post("/jobs/:id/pay", getProfile, paymentController.payByJobId);
app.post("/balances/deposit/:userId", getProfile, paymentController.payDeposit);

// Admin
app.get("/admin/best-profession", getProfile, adminController.getBestProfession);
app.get("/admin/best-clients", getProfile, adminController.listBestClients);

module.exports = app;
