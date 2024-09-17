import { eachDayOfInterval } from "date-fns";


export function fechasArray(fechaInicio: string, fechaFin: string){
    const fecha1 = new Date(fechaInicio);
    const fecha2 = new Date(fechaFin);
    const dias = eachDayOfInterval({ start: fecha1, end: fecha2 });

    return dias
}