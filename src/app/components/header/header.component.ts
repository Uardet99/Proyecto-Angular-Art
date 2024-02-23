import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../services/filter.service';
import { UsersService } from '../../services/users.service';
import { IUser } from '../../interfaces/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink,RouterLinkActive,FormsModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  nickname: string |null = null;

  constructor(private filterService: FilterService, private usersService :UsersService){}

  ngOnInit(): void {
      this.usersService.userSubject.subscribe(user => this.user = user);
      this.usersService.isLogged();
      this.nickname = this.getLocalStorageNickname();
      console.log("Hola" + this.nickname);
      
  }

  user: IUser | null = null;
  defaultImage: string = 'assets/logo.svg'

  filter: string='';

  changeFilter($event: Event){
      $event.preventDefault();
      this.filterService.searchFilter.next(this.filter)
  }

  getLocalStorageNickname(){
  return localStorage.getItem('userId');
  }
}