import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-edit-workshop-dialog',
  templateUrl: './edit-workshop-dialog.component.html',
  styleUrls: ['./edit-workshop-dialog.component.css']
})
export class EditWorkshopDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EditWorkshopDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  editForm: FormGroup

  ngOnInit() {
    this.editForm = new FormGroup({
      title: new FormControl(this.data.editingWorkshop.title, Validators.nullValidator),
      moment: new FormControl(this.data.editingWorkshop.moment, Validators.nullValidator),
      description: new FormControl(this.data.editingWorkshop.description, Validators.nullValidator),
      limit: new FormControl(this.data.editingWorkshop.limit, Validators.nullValidator),
      targetGroup: new FormControl(this.data.editingWorkshop.targetGroup, Validators.nullValidator),
    });
  }

  saveWorkshop(): any {
    // 2-way data binding deprecated, need to save new values manually
    // https://angular.io/api/forms/FormControlName#use-with-ngmodel
    this.data.editingWorkshop.title = this.editForm.value['title'];
    this.data.editingWorkshop.moment = this.editForm.value['moment'];
    this.data.editingWorkshop.description = this.editForm.value['description'];
    this.data.editingWorkshop.limit = this.editForm.value['limit'];
    this.data.editingWorkshop.targetGroup = this.editForm.value['targetGroup'];

    this.dialogRef.close(this.data.editingWorkshop);
  }
  

}
