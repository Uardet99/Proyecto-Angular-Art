import { Component, Input, OnInit } from '@angular/core';
import { IArtwork } from '../../interfaces/i-artwork';
import { ArtworkComponent } from '../artwork/artwork.component';
import { ArtworkRowComponent } from '../artwork-row/artwork-row.component';
import { ApiServiceService } from '../../services/api-service.service';
import { ArtworkFilterPipe } from '../../pipes/artwork-filter.pipe';
import { FilterService } from '../../services/filter.service';
import { debounceTime, filter } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { PaginacionComponent } from '../paginacion/paginacion.component';
import { Pagination } from '../../interfaces/Pagination';
import { Router } from '@angular/router';
import { PaginationService } from '../../services/paginacion-service.service';

@Component({
  selector: 'app-artwork-list',
  standalone: true,
  imports: [
    ArtworkComponent,
    ArtworkRowComponent,
    ArtworkFilterPipe,
    CommonModule,
    PaginacionComponent,
  ],
  templateUrl: './artwork-list.component.html',
  styleUrl: './artwork-list.component.css',
})
export class ArtworkListComponent implements OnInit {
  paginas!: Pagination;

  constructor(
    private artService: ApiServiceService,
    private filterService: FilterService,
    private usersService: UsersService,
    private router: Router,
    private servicioPaginacion: PaginationService
  ) {
    this.paginas = servicioPaginacion.obtenerPaginas();
  }

  async ngOnInit(): Promise<void> {
    if (this.onlyFavorites === 'favorites') {
      this.artService
        .getArtworksFromIDs(['3752', '11294', '6010'])
        .subscribe((artworkList: IArtwork[]) => (this.quadres = artworkList));
    } else {
      this.loadArtworks(
        this.servicioPaginacion.obtenerPaginas().paginaActual,
        this.servicioPaginacion.obtenerPaginas().limit
      );
      this.filterService.searchFilter
        .pipe(debounceTime(500))
        .subscribe((filter) => {
          this.filter = filter;
          this.artService.filterArtWorks(this.filter);
        });
    }
  }

  loadArtworks(page: number, limit: number): void {
    this.artService
      .getArtWorks(page, limit)
      .subscribe((artworkList: IArtwork[]) => {
        const usersService = new UsersService();
        artworkList.map(async (quadre) => {
          const isFav = await usersService
            .getFavorite('37d6cdab-fcd8-46d7-97c0-fb12197c6057', quadre.id)
            .then((result) => result.length > 0);

          quadre.like = isFav;
        });

        this.quadres = artworkList;
        console.log(artworkList);
        this.servicioPaginacion.actualizarNumeroPaginaActual(page);
        // Actualizar la URL con los parámetros de consulta
        this.router.navigate([], {
          queryParams: { page, limit },
        });
      });
  }
  toggleLike($event: boolean, artwork: IArtwork) {
    console.log($event, artwork);
    artwork.like = !artwork.like;
    if (artwork.like) {
      this.usersService.setFavorite(artwork.id + '');
    } else {
      this.usersService.deleteFavorite(artwork.id + '');
    }
  }

  quadres: IArtwork[] = [];
  filter: string = '';
  @Input() onlyFavorites: string = '';
}
