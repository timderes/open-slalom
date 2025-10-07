import calculateDriverAge from "./calculateDriverAge";
/**
 * Returns JKS driver class based on birth date.
 */
const getJksDriverClass = ({
  birthDate,
}: {
  birthDate: Driver["birthDate"];
}) => {
  const age = calculateDriverAge(birthDate);

  if (age < 8) return 0;
  if (age < 10) return 1;
  if (age < 12) return 2;
  if (age < 14) return 3;
  if (age < 16) return 4;
  if (age < 19) return 5;
  if (age < 24) return 6;
  return 7;
};

/*
 * Returns SKS driver class based on birth date.
 *
 * TODO: Verify these age ranges!
 */
const getSksDriverClass = ({
  birthDate,
}: {
  birthDate: Driver["birthDate"];
}) => {
  const age = calculateDriverAge(birthDate);

  if (age < 12) return 1;
  if (age < 15) return 2;
  if (age < 18) return 3;
  return 4;
};

export { getJksDriverClass, getSksDriverClass };
