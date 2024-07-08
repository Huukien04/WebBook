import { ɵparseCookieValue } from '@angular/common';
import { HttpContextToken } from '@angular/common/http';
import { Component, Input, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { LoginService } from 'src/app/login.service';
import { RegisterService } from 'src/app/register.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  router = inject(Router);

  private loginService = inject(RegisterService);
@Input() chuoi ='';
token: string | null = null;
them(moi:string){
  this.chuoi=moi;
}
  get userName() {
    return this.addForm.get('userName');
  }
  get userPass() {
    return this.addForm.get('userPass');
  }
  addForm: FormGroup = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    userPass: new FormControl('', [Validators.required]),
  })


  ngOnInit() { }

  onSubmit() {
    if (this.addForm.value) {
      this.loginService.addUser(this.addForm.value).subscribe({
        next: (data) => {
          console.log("add user succes");
          this.token = data.token;
          console.log(this.token);
          const expiresAt = moment().add(data.expiresIn, 'minute');
          localStorage.setItem('id_token', data.token);
          localStorage.setItem('expires_at', JSON.stringify(expiresAt.valueOf()));
          this.router.navigate(['login'])
        },
        error: error => {
          console.error(error);

        }
      });
    }
  }
  login() {
    this.router.navigate(['login']);
  }




 

}