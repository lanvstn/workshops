import { Workshop } from '../models/workshop'

export class Event {
  public id: number;
  public name: string;
  public title: string;
  public available: boolean;
  public workshops: Workshop[];
  
  constructor() {};
}