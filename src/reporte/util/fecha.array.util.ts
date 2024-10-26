import { eachDayOfInterval } from "date-fns";

export function fechasArray(fechaInicio: string, fechaFin: string) {
    const fecha1 = new Date(fechaInicio + "T00:00:00"); 
    const fecha2 = new Date(fechaFin + "T23:59:59"); 

 
    const dias = eachDayOfInterval({ start: fecha1, end: fecha2 });
    return dias;
}

