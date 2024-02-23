import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { IUser } from '../../interfaces/user';
import { map } from 'rxjs';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

// Decorador que define el componente de perfil
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})

export class ProfileComponent implements OnInit {
  formulario!: FormGroup;
  supaClient: any = null;
  profileUpdated: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UsersService
  ) {
    this.supaClient = createClient(
      environment.SUPABASE_URL,
      environment.SUPABASE_KEY
    );
    this.crearFormulario();
  }

  // Este metodo se ejecuta cuando inicializamos el componente
  ngOnInit(): void {
    const UserId = localStorage.getItem('userId');

    // Verificamos si hay un usario logeado
    if (UserId) {
      // Obtenemos el perfil y actualizamos el profile
      this.userService.getProfile(UserId).then((profile) => {
        if (profile) {
          profile.full_name = profile.full_name.trim();
          profile.website = profile.website || '';

          // Establecemos los valores del formulario con los datos del perfil
          this.formulario.setValue({
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            website: profile.website,
          });

          // Comprobar si el perfil se actualizó con éxito después de la carga del componente
          if (localStorage.getItem('profileUpdated') === 'true') {
            this.profileUpdated = true;
            // Puedes restablecer el estado después de mostrar el mensaje si es necesario
            setTimeout(() => {
              this.profileUpdated = false;
              localStorage.removeItem('profileUpdated');
            }, 3000);
          }
        }
      });
    }
  }

  // Metodo para guardar los cambios en el perfil
  guardarPerfil() {
    if (this.formulario.valid) {
      const updatedProfile: IUser = this.formulario.value;

      // Llamamos al service para actualizar el perfil
      this.userService
        .updateUserProfile(
          updatedProfile.id,
          updatedProfile.username,
          updatedProfile.full_name
        )
        .then((response) => {
          console.log('Perfil actualizado', response);
          this.profileUpdated = true;

          // Almacenar en localStorage para verificar en ngOnInit()
          localStorage.setItem('profileUpdated', 'true');

          // Puedes restablecer el estado después de mostrar el mensaje si es necesario
          setTimeout(() => {
            this.profileUpdated = false;
            localStorage.removeItem('profileUpdated');
          }, 3000);
        })
        .catch((error) => {
          console.error('Error al actualizar el perfil', error);
        });
    }
  }

  // En este metodo creamos el formulario con las validaciones
  crearFormulario() {
    this.formulario = this.formBuilder.group({
      id: [''],

      // Definimos un campo 'username'
      username: [
        '',
        [
          // Requiere un valor
          Validators.required,
          // La longitud debe ser 5 caracteres
          Validators.minLength(5),
          // Debe contener al menos un caracter alfabetico
          Validators.pattern('.*[a-zA-Z].*'),
        ],
      ],
      full_name: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.pattern('.*[a-zA-Z].*'),
        ],
      ],
      avatar_url: [''],
      website: ['', websiteValidator('http.*')],
    });
  }

  get usernameNoValid() {
    return (
      this.formulario.get('username')!.invalid &&
      this.formulario.get('username')!.touched
    );
  }
  get fullNameNoValid() {
    return (
      this.formulario.get('full_name')!.invalid &&
      this.formulario.get('full_name')!.touched
    );
  }
}

// Funcion auxiliar para validar el formato de la Url de la web
function websiteValidator(pattern: string): ValidatorFn {
  return (c: AbstractControl): { [key: string]: any } | null => {
    if (c.value) {
      let regexp = new RegExp(pattern);

      return regexp.test(c.value) ? null : { website: c.value };
    }
    return null;
  };
}
