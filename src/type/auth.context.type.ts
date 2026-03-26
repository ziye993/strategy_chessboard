import { ILoginData } from "./api.type";

export interface IAuthStatus {
  user?: any;
  token?: string | null;
  isAuthenticated?: boolean;
  loading?: boolean;
}

export interface IAuthProvide {
  state: IAuthStatus;
  login: (loginData: ILoginData) => Promise<boolean>;
  logout: () => void;
  register: (email: string, pawd: string) => Promise<boolean>;
}