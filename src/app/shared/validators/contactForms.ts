import { FormControl, FormGroup, Validators } from "@angular/forms";

export const contactForm = new FormGroup({
  mail: new FormControl('', [Validators.required, Validators.email]),
  subject: new FormControl('', Validators.required),
  message: new FormControl('', [Validators.required, Validators.minLength(10)]),
});
