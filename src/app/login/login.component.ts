import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NotifyService } from '../services/notify.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private notifyService: NotifyService) { }

  ngOnInit() {
    this.initForm();
  }

  @Input() parentComponent: any;
  @Input() isAdminLogin: number;

  authMethod: string = "key";
  keyLength: number = 5;
  authForm: FormGroup;

  auth(): void {
    this.authService.login(this.authForm.value)
      .then(user => {
        this.parentComponent.afterLogin();
      })
      .catch(error => {
        this.notifyService.error(`Login mislukt: ${error}`, false);
      });
  }

  private initForm(): void {
    if (this.authMethod==="key") {
        this.authForm = new FormGroup({
          credential: new FormControl('', Validators.required),
          admin_login: new FormControl(this.isAdminLogin)
        });
    }
  }

}
