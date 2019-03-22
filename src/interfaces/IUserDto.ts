
export interface IUserDto {
  username: string;
  email: string;
  password: string;
  created?: Date;
  modified?: Date;
  salt?: string;
  hash?: string;
}
