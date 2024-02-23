// paginacion.component.ts
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
// Importacion del servicio de Paginacion y la interfaz Paginacion
import { PaginationService } from '../../services/paginacion-service.service';
import { Pagination } from '../../interfaces/Pagination';

// Decorador que define el componente 
@Component({
  selector: 'app-paginacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paginacion.component.html',
  styleUrls: ['./paginacion.component.css'],
})

export class PaginacionComponent {
// Propiedad de entrada que recibe las paginas de la paginacion
@Input() paginas!: Pagination;
// Evento de salida que emite el numero de pagina cuando cambia
@Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();

// Variable que almacena el numero de pagina introducido manualmente
numeroPaginaIntroducidoManualmente: number = 1;
  

// Constructor que recibe el servicio de paginacion como dependencia
constructor(private paginacionService: PaginationService) {
  // Inicializacion de las paginas del componente con el servicio de paginacion
  this.paginas = this.paginacionService.obtenerPaginas();
}


 // Metodo para ir a la última página
irUltimaPagina(): void {
  this.irPaginaBuscada(this.paginas.paginasTotales);
}

// Metodo para ir a la siguiente página
irSiguientePagina(): void {
  const siguientePagina = this.paginas.paginaActual + 1;
  if (siguientePagina <= this.paginas.paginasTotales) {
    this.irPaginaBuscada(siguientePagina);
  }
}

// Metodo para ir a la página anterior
irPaginaAnterior(): void {
  const paginaAnterior = this.paginas.paginaActual - 1;
  if (paginaAnterior >= 1) {
    this.irPaginaBuscada(paginaAnterior);
  }
}


// Metodo para ir a la pagina buscada y emitir el evento correspondiente
irPaginaBuscada(page: number): void {
  this.pageChanged.emit(page);
  this.paginacionService.actualizarNumeroPaginaActual(page);
}

// Metodo para mostrar la pagina introducida manualmente
mostrarPaginaPorNumeroIntroducido(): boolean {
  // Almacenamos el numero de pagina introducido manualmente
  const nuevaPaginaSeleccionada = this.numeroPaginaIntroducidoManualmente;

  // Verifica si es un número válido
  if (!Number.isInteger(nuevaPaginaSeleccionada)) {
    console.error('El valor introducido no es un número válido.');
    return false;
  }

  // Verificamos si el numero de pagina esta dentro del nuestro rango valido
  if (nuevaPaginaSeleccionada >= 1 && nuevaPaginaSeleccionada <= this.paginas.paginasTotales) {
    // Si es valido, llamamos al metodo irPaginaBuscada() y actualizamos la pagina actual
    this.irPaginaBuscada(nuevaPaginaSeleccionada);
    // Retornamos true para indicar que se ha realizado el cambio de pagina correctamente
    return true;
  }
  // Si el numero de la pagina no es valido, retornamos false
  return false;
}


}
