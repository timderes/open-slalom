/**
 * Calculates the driver's age based on their birth date.
 */
const calculateDriverAge = (birthDate: Driver["birthDate"]): number => {
  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Calculates the driver's age based on their birth year. Used for determining driver classes.
 * Since driver classes are based on age ranges that span entire years.
 */
const calculateDriverAgeBasedOfBirthYear = (
  birthDate: Driver["birthDate"]
): number => {
  const birthYear = new Date(birthDate).getFullYear();
  const currentYear = new Date().getFullYear();

  return currentYear - birthYear;
};

export default calculateDriverAge;
export { calculateDriverAgeBasedOfBirthYear };
