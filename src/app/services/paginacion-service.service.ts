// Importacion del decorador Injectable
import { Injectable } from '@angular/core';
// Importacion de la interfaz Paginacion
import { Pagination } from '../interfaces/Pagination';

// Decorador Injectable
@Injectable({
  providedIn: 'root',
})
export class PaginationService {

  // Instancia de la interfaz Paginacion
  private paginas: Pagination = {
    total: 124258,
    limit: 6,
    primeraPagina: 1,
    paginaActual: 1,
    paginasTotales: 20710,
  };

  // Metodo para obtener las paginas actuales
  obtenerPaginas(): Pagination {
    return this.paginas;
  }

  // Metodo para obtener la pagina actual
  actualizarNumeroPaginaActual(numeroPagina: number): void {
    this.paginas.paginaActual = numeroPagina;
  }
}
