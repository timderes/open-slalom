/**
 * Returns the German translation of a driver's sex.
 */
const translateSex = (sex: Driver['sex']): string => {
  switch (sex) {
    case 'male':
      return 'Männlich';
    case 'female':
      return 'Weiblich';
    case 'other':
      return 'Divers';
  }
};

export default translateSex;
