export const calculateExperience = (startPracticeDate: string): string => {
    const startDate = new Date(startPracticeDate);
    const currentDate = new Date();
  
    let years = currentDate.getFullYear() - startDate.getFullYear();
    let months = currentDate.getMonth() - startDate.getMonth();
    let days = currentDate.getDate() - startDate.getDate();
  
    if (days < 0) {
      months -= 1;
      days += new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate(); // Days in previous month
    }
  
    if (months < 0) {
      years -= 1;
      months += 12;
    }
  
    if (years < 0) {
      return 'Invalid start date'; // If future date
    }
  
    if (years === 0 && months === 0) {
      return `Less than a month`;
    }
  
    if (years === 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    }
  
    if (months === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    }
  
    return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
  };
  