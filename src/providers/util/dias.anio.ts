export function diasDelAnio(year: number): string[] {
    const dias: string[] = [];
  
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthStr = month.toString().padStart(2, '0');
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0'); 
        dias.push(`${monthStr}-${dayStr}`);
      }
    }
  
    return dias;
  }
  