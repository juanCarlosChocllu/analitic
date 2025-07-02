export function tasaConversion(totalConvertidos:number,totalVisitantes:number ):number{
    if(totalVisitantes <= 0  || totalConvertidos <= 0){
        return 0
      }
    const resultado = (totalConvertidos/totalVisitantes) * 100
    return Math.round(resultado)
}