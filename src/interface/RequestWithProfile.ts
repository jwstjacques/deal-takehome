import { Request } from "express";

import { Profile } from "../model";

export default interface RequestWithProfile extends Request {
  profile: Profile;
}
