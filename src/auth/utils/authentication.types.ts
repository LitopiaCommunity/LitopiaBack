import { User } from "../../models/users/user.entity";

export type UserDetails = {
  username: string;
  discriminator: string;
  discordId: string;
  avatar: string;
  accessToken: string;
  refreshToken: string;
};

export interface AuthenticationTypes {
  validateUser(details: UserDetails);
  createUser(details: UserDetails);
  findUser(discordId: string): Promise<User | undefined>;
}

export interface UserKeyStore {
  discordID:string
}

export type Done = (err: Error, user: UserKeyStore | User) => void;