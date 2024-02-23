// Importa elementos necesarios de Angular
import { Component, Input } from '@angular/core';
import { FormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Define el componente Angular llamado 'LoginComponent'
@Component({
  // Selector CSS para cada componente
  selector: 'app-login',
  // Configuraciones adicionales del componente
  standalone: true,
  imports: [FormsModule, CommonModule],
  // Rutas de la plantilla HTML y estilos CSS asociados al componente
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  mode: string = 'login';
  // Constructor del componente que recibe instacias de UsersService y Router
  constructor(private usersService: UsersService, private router: Router, private formBuilder: FormBuilder) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      passwordRepeat: ['', [Validators.required]],
    });

    // Agrega un validador personalizado para verificar que las contraseñas coincidan
    this.loginForm
      .get('passwordRepeat')
      ?.setValidators([
        Validators.required,
        this.comprobarPasswords.bind(this),
      ]);
   }
  
   comprobarPasswords() {
    const password = this.loginForm.get('password')?.value;
    const passwordRepeat = this.loginForm.get('passwordRepeat')?.value;

    return password === passwordRepeat ? null : { mismatch: true };
  }

  // Setter para la propieda 'mode' que permite cambiar su valor y realizar acciones adicionales
  @Input()
  set setmode(value: string) {
    this.mode = value;
    // Si el valor es 'logout', llama al servicio de usuarios para cerrar sesion y y redirige a la pagina de inicio de sesion
    if(value ==='logout'){
      this.usersService.logout();
      this.router.navigate(['userManagement','login']);
    }
  }

  // Propiedades para almacenar correo electronico, contraseña y mensaje de error
  email: string = '';
  password: string = '';
  error: string = '';
  username: string = '';
  fullName: string = '';
  comfirmPassword: string = '';
  
  

  async comprobarModo() {
    if (this.mode === 'login') {
      await this.login();
    } else if (this.mode === 'register') {
      if (this.password === this.comfirmPassword) {
        await this.register();
      } else {
        this.error = 'Passwords do not match';
      }
      
    }
  }


  async register() {
    const registered = await this.usersService.register(
      this.email,
      this.password,
      this.username,
      this.fullName
    );

    console.log({registered});
    
    if (registered) {
      this.router.navigate(['favorites']);
    } else {
      this.error = 'Registration failed';
    }
  }

  // Metodo asincrono para realizar el inicio de sesion
  async login() {
    // Llama al servicio de usuarios para intentar iniciar sesión
    let logged = await this.usersService.login(this.email, this.password);

    // Si el inicio de sesion es exitoso, redirige a la pagina de favoritos, de lo contrario, muestra un mensaje de error
    if (logged) {
      this.router.navigate(['favorites']);
    } else {
      this.error = 'Bad Email or Password'
    }
  }



}