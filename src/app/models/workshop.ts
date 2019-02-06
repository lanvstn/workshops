export class Workshop {
  public id: number;
  public title: string;
  public description: string;
  public moment: string;
  public limit: number;
  public targetGroup: string;
  public _selected: boolean;
  public _selectionOrigin: string;
  public _registrationCount: number;
  public _editMode: boolean;
  public _selectable: boolean;
  public _inclusiveLinkedWorkshops: Workshop[];

  constructor() {};
}