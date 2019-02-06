import { Workshop } from "./workshop";

export class Registration {
    public id: number;
    public entry_time: Date;
    public workshop_id: number;
    public user_id: number;
    public _workshop: Workshop;

    constructor() {}
}