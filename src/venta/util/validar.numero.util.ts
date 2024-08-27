export const parseNumber = (value:any) => {
    const number = parseFloat(value.replace(/-/g, ''))    
    return  number; 
  }
  