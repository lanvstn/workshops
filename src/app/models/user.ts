import { Registration } from "./registration";

export class User {
  public id: number;
  public full_name: string;
  public token: string;
  public permission: number;
  public identity: string;
  public targetGroup: string;
  public user_class: string;
  public event_id: number;
  public registrations: Registration[];

  constructor() {}
}