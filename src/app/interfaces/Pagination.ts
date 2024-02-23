// Definicion de una interfaz llamada Paginacion
export interface Pagination {
  // Numero total de elementos en la paginacion
  total: number;
  // Limite de elemento por paginacion 
  limit: number;
  // Numero de la primera pagina en la paginacion
  primeraPagina: number;
  // Numero de la pagina actual
  paginaActual: number;
  // Numero total de paginas en la paginacion
  paginasTotales: number;
}
