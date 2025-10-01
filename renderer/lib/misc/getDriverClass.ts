import calculateDriverAge from "./calculateDriverAge";
/**
 * TODO: SKS classes maybe a bit different?
 *
 * JKS classes
 *
 * class 0 - 7 years
 * class 1 8-9 years
 * class 2 10-11 years
 * class 3 12-13 years
 * class 4 14-15 years
 * class 5 16-18 years
 * class 6 19-23 years
 * class 7 24+ years
 *
 * SKS classes
 * class 1 12-14 years
 * class 2 15-17 years
 * class 3 18-20 years
 * class 4 21-26 years
 * class 5 27+ years
 */
const getDriverClass = ({
  birthDate,
  type,
}: {
  birthDate: Driver["birthDate"];
  type: SlalomType;
}) => {
  const age = calculateDriverAge(birthDate);

  // JKS classes
  if (type === "JKS") {
    if (age >= 24) return 7;
    if (age >= 19) return 6;
    if (age >= 16) return 5;
    if (age >= 14) return 4;
    if (age >= 12) return 3;
    if (age >= 10) return 2;
    if (age >= 8) return 1;
    return 0;
  }

  // SKS classes
  if (type === "SKS") {
    if (age >= 27) return 5;
    if (age >= 21) return 4;
    if (age >= 18) return 3;
    if (age >= 15) return 2;
    return 1;
  }
};

export default getDriverClass;
