/**
 * Returns the German translation of a driver's gender.
 */
const translateGender = (gender: Driver['gender']): string => {
  switch (gender) {
    case 'male':
      return 'Männlich';
    case 'female':
      return 'Weiblich';
    case 'other':
      return 'Divers';
  }
};

export default translateGender;
