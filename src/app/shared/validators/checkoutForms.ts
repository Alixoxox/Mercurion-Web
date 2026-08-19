import { FormControl, FormGroup, Validators } from "@angular/forms";

export const checkoutForm = new FormGroup({
  fullName: new FormControl('', Validators.required),
  email: new FormControl('', [Validators.required, Validators.email]),
  phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\+?[\d\s\-()]{11}$/),Validators.minLength(11), Validators.maxLength(11)]),
  address: new FormControl('', Validators.required),
  city: new FormControl('', Validators.required),
  country: new FormControl('', Validators.required),
  postalCode: new FormControl('', [Validators.required, Validators.pattern(/^[\d\s\-]{3,10}$/)]),
});
