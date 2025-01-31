export function formateoFechas(fechaInicio:string, fechaFin:string ){
    const  fechaI=new Date(fechaInicio)
    const  fechaF=new Date(fechaFin)
      fechaI.setHours(0, 0, 0, 0)
      fechaF.setHours(23, 59, 59, 999)
      return [fechaI, fechaF ]
  }
