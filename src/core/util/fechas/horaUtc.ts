 export function  horaUtc(fecha: string) {
    const fechaDate = new Date(fecha);
    fechaDate.setHours(fechaDate.getHours() - 4);
    return fechaDate;
  }