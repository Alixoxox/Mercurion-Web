import { FormControl, FormGroup, Validators } from "@angular/forms";

export const loginForm = new FormGroup({

    email: new FormControl('',[
      Validators.required,
      Validators.email]),
  
    password: new FormControl('',[
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
    ])
  });

export const signupForm = new FormGroup({

  name: new FormControl('',[
    Validators.required,
    Validators.minLength(3) ]),
    
    email: new FormControl('',[
      Validators.email,
      Validators.required
    ]),
    password: new FormControl('',[
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/)
    ]) ,
    confirmPassword: new FormControl('', [
      Validators.required
    ])     
  });