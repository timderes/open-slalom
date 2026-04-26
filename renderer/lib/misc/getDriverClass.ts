import { calculateDriverAgeBasedOfBirthYear } from './calculateDriverAge';
import { CLASS_AGE_TABLE } from '../constants';

type DriverBirthDate = {
  birthDate: Driver['birthDate'];
};

const getClassByAge = ({
  age,
  classTable,
}: {
  age: number;
  classTable: Record<string, { min: number; max: number | null }>;
}) => {
  for (const [classKey, range] of Object.entries(classTable) as [
    string,
    { min: number; max: number | null },
  ][]) {
    if (age >= range.min && (range.max === null || age <= range.max)) {
      return Number(classKey);
    }
  }
  return null;
};

const getJksClass = ({ birthDate }: DriverBirthDate): number | null => {
  const age = calculateDriverAgeBasedOfBirthYear(birthDate);

  if (!age || isNaN(age)) {
    return null;
  }

  return getClassByAge({ age, classTable: CLASS_AGE_TABLE.JKS });
};

const getSksClass = ({ birthDate }: DriverBirthDate): number | null => {
  const age = calculateDriverAgeBasedOfBirthYear(birthDate);

  if (!age || isNaN(age)) {
    return null;
  }

  return getClassByAge({ age, classTable: CLASS_AGE_TABLE.SKS });
};

export { getJksClass, getSksClass };
