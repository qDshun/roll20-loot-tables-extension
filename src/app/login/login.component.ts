import { Component, ChangeDetectionStrategy, inject } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { RouterModule } from "@angular/router";
import { AuthCardComponent } from "../auth-card/auth-card.component";
import { LoginRequest } from "../../injected-script/component-injection/models";
import { IdentityService } from "../../injected-script/component-injection/services/identity.service";
import { ControlsOf } from "../helpers";
import { WorldService } from "../../injected-script/component-injection/services/world.service";
import { CommonModule } from "@angular/common";
import { BehaviorSubject, ReplaySubject, map, pipe, share, switchMap } from "rxjs";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatFormFieldModule, MatButtonModule, MatInputModule, MatIconModule, AuthCardComponent, ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  private identityService = inject(IdentityService);
  private worldService = inject(WorldService);
  worlds$ = this.worldService.worlds$;
  public hidePassword = true;

  private refreshLogin$ = new BehaviorSubject<null>(null);

  public loginSuccessfull$ = this.refreshLogin$.pipe(
    switchMap(() => chrome.storage.local.get('credentials')),
    switchMap(credentials => {
      const loginRequest = { email: credentials['credentials'].split(';')[0], password: credentials['credentials'].split(';')[1]} as LoginRequest;
      return this.identityService.login(loginRequest, true)
    }),
    map(() => true),
    share({ connector: () => new ReplaySubject(1) })
  );

  constructor() {
    this.loginSuccessfull$.subscribe(() => console.log('login succ subscribe'))
  }
  loginForm: FormGroup<ControlsOf<LoginRequest>> = this.formBuilder.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  rememberMe = true;

  login(): void {
    const loginRequestDto = this.loginForm.getRawValue();
    this.identityService.login(loginRequestDto, this.rememberMe)
      .subscribe(() => {
        chrome.storage.local.set({credentials: `${loginRequestDto.email};${loginRequestDto.password}`});
        this.refreshLogin$.next(null);
      });

  }
}
