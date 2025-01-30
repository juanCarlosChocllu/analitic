export function calcularPorcentaje(cantidad:number, total:number):number{
      if(cantidad <= 0  || total <= 0){
        return 0
      }
      const porcentaje = (cantidad / total) * 100;
    
      
      return Math.round(porcentaje)

}