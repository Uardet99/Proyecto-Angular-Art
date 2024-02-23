import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js'
import { Observable, Subject, from, tap } from 'rxjs';
import { IUser } from '../interfaces/user';
import { environment } from '../../environments/environment';

// Define un usuario vacio como constante
const emptyUser: IUser = {id: '0', avatar_url: 'none', full_name: 'none', username: 'none' }

// Decorador Injectable que indica el servicio puede ser inyectado en otros componentes o servicios
@Injectable({
  providedIn: 'root'
})

export class UsersService {
  defaultAvatarUrl: string  = 'default.png';

  // Instancia de cliente Supabase
  supaClient: any = null;

  // Constructor para emitir cambios en la informacion del usuario
  constructor() {
    this.supaClient = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);
  }

  // Subject para emitir cambios en la informacion del usuario
  userSubject: Subject<IUser> = new Subject;

  // Subject para emitir cambios en la lista de favoritos
  favoritesSubject: Subject<{id:number,uid:string,artwork_id:string}[]> = new Subject;

// NO IMPLEMENTADO//
  // Obtener los favoritos del usuario
  async getFavorites(userId: string): Promise<string[]> {

    try {
      // Consultamos la tabla 'favorites' de SUPABASE para obtener los artworks del usuario
      const { data, error } = await this.supaClient
        .from('favorites')
        .select('artwork_id')
        .eq('uid', userId);

      if (error) {
        console.error('Error al obtener favoritos:', error);
        return []; // o maneja el error según tus necesidades
      }

      const artworkIds =
        data?.map((favorite: { artwork_id: string }) => favorite.artwork_id) ||
        [];
      return artworkIds;
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      return []; // o maneja el error según tus necesidades
    }
  }

  // NO IMPLEMENTADO//
  // Obtener un favorito en concreto del usuario logeado
  async getFavorite(userId: string, artwork_id: number): Promise<string[]> {
    try {
      // Consultamos la tabla 'favorites' para obtener la obra de arte favorita en concreto del usuario
      const { data, error } = await this.supaClient
        .from('favorites')
        .select('artwork_id')
        .eq('uid', userId)
        .eq('artwork_id', artwork_id);

      if (error) {
        console.error('Error al obtener favorites:', error);
        return []; // o maneja el error según tus necesidades
      }

      // Extraer los 'artwork'
      const artworkIds =
        data?.map((favorite: { artwork_id: string }) => favorite.artwork_id) ||
        [];
      return artworkIds;

    } catch (error) {
      console.error('Error al obtener favorites:', error);
      return []; // o maneja el error según tus necesidades
    }
  }

  // NO IMPLEMENTADO//
  // Establecemos un artwort como favorito para el usuario logeado
  async setFavorite(artwork_id: string): Promise<any> {
    console.log('setfavorite', artwork_id);

    // Obtenemos la sesion del usuario logeado
    let { data, error } = await this.supaClient.auth.getSession();
    console.log(data.session);

    if (data.session != null) {

      // Insertamos el artwort en la tabla favorites asociado al usuario
      let promiseFavorites: Promise<boolean> = this.supaClient
        .from('favorites')
        .insert({ uid: data.session.user.id, artwork_id: artwork_id });

      // Actualizar la lista de favoritos despues de completar la insercion
      promiseFavorites.then(() => this.getFavorites(data.session.user.id));
    }
  }

  // NO IMPLEMENTADO//
  // Metodo asincrono para eliminar un favorito
  async deleteFavorite(artwork_id: string): Promise<any> {
    // Registrar en la consola la accion de eliminar un favorito con su identificador
    console.log('deleteFavorite', artwork_id);

    // Obtenemos la sesion del usuario logeado
    let { data, error } = await this.supaClient.auth.getSession();
    console.log(data.session);

    if (data.session != null) {
      try {
        // Intentamos eliminar el favorito de la tabla favorites
        const { data: deletedFavorite, error: deleteError } =
          await this.supaClient
            .from('favorites')
            .delete()
            .eq('uid', data.session.user.id)
            .eq('artwork_id', artwork_id)
            .single();

        // Manejar cualquier error durante la eliminación
        if (error) {
          console.error('Error al eliminnar:', error.message);
        }
      } catch (error: any) {
        console.error('Error al eliminnar:', error.message);
      }
    }
  }

  // Metodo asincronico para el inicio de sesion
  async login(email: string, password: string): Promise<boolean> {
    // Obtener la sesion actual
    let session = await this.supaClient.auth.getSession();
    let data, error;

    // Verificamos si ya hay una sesion activa
    if (session.data.session) {
      console.log("Usuario ya identificado");
    } else {
      // Iniciar sesion con email
      session = await this.supaClient.auth.signInWithPassword({
        email,
        password,
      });
      
      // Manejar el resultado de la autenticacion
      error = session.error;
      data = session.data;


      /* console.log({ data });
      console.log({ error });
      */

      if (error) {
        return false;
      }
    }

    // Verificamos si se obtuvo la informacio del usuario
    if (data.user != null) {
      // Almacenamos el ID del usuario en el alamcenamiento local
      localStorage.setItem('userId', data.user.id)
      // Obtenemos el perfil del usuario
      let log = await this.getProfile(data.user.id);
      return true;
    }
    return false;
  }

  // Obtener los datos del usuario para el profile
  async getProfile(userId: string): Promise<IUser | null> {
    try {
      // Consultar la tabla profiles de SUPABASE para obtener el perfil del usuario
      const { data, error } = await this.supaClient
        .from('profiles')
        .select('*')
        .eq('id', userId);

      if (error) {
        console.error('Error obteniendo datos del perfil:', error);
        return null;
      }

      // Obtenemos el primer perfil encontrado
      const userProfile = data?.[0];

      if (userProfile) {
        // Descargamos y asignamos la url al avatar de tenemos por defecto 'default.png'
        const avatarFile = userProfile.avatar_url.split('/').at(-1);
        // console.log({ avatarFile });
        const { data: avatarData, error: avatarError } =
          await this.supaClient.storage.from('avatars').download(avatarFile);

        if (avatarError) {
          console.error('Error al obtener el avatar:', avatarError);
          return null;
        }

        const avatarUrl = URL.createObjectURL(avatarData);
        userProfile.avatar_url = avatarUrl;
        this.userSubject.next(userProfile);
      }

      return userProfile; // Return the user profile
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
  // Comprobar si el usuario esta autenticado y obtener su perfil
  async isLogged(){
    let {data,error} = await this.supaClient.auth.getSession();
    // Si hay sesion obtenemos el profile
    if(data.session){
      this.getProfile(data.session.user.id)
    }
  }

  // Cerrar la sesion del Usuario
  async logout(){
    try {
      // Cerrar la sesion con SUPABASE
      const { error } = await this.supaClient.auth.signOut();
      // Limpiamos el almacenamiento local
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');

      if (error) {
        throw error;
      }

      // Emitir el usuario vacio
      this.userSubject.next(emptyUser);
    } catch (error) {
      console.error('Error al cerrar sesion:', error);
    }
  }

  // Registro de un nuevo usuario
  async register(
    email: string,
    password: string,
    username: string,
    fullName: string
  ): Promise<boolean> {

    try {
      // Registrarse con email y contraseña
      const { data, error } = await this.supaClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Error al registrar el usuario:', error);
        return false;
      }

      // Verificamos si se registro correctamente y actualizar el perfil
      if (data?.user != null) {
        //this.createProfile(data.user.id, firstName, lastName);
        console.log(username + '->' + fullName + '->' + this.defaultAvatarUrl);

        if (data?.user != null) {
          const { error: profileError } = await this.supaClient
            .from('profiles')
            .update({
              username: username,
              full_name: fullName,
              avatar_url: this.defaultAvatarUrl,
            })
            .eq('id', data.user.id);

          if (profileError) {
            console.error('Error al actualizar el perfil:', profileError);
            return false;
          }
          return true;
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  async updateUserProfile(
    userId: string,
    username: string,
    fullName: string
  ): Promise<boolean> {
    try {
      
      // Actualizar el perfil del usuario en la tabla 'profiles' de SUPABASE
      const { error } = await this.supaClient
        .from('profiles')
        .update({
          username: username,
          full_name: fullName,
          avatar_url: this.defaultAvatarUrl,
        })
        .eq('id', userId);

      

      if (error) {
        console.error('Error al actualizar el perfil:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      return false;
    }
  }

  
}

/*
npm install @supabase/supabase-js
*/
