// ** Validate that the Simulation didn't error ** //
const validateSimulation = (simulation: any) => {
  // ** For each result, check if there is an error ** //
  let valid = true;

  // ** If error is present in the object, return invalid ** //
  if ('error' in Object.keys(simulation)) return false;

  // ** If no results in simulation, invalid ** //
  if (!('results' in Object.keys(simulation))) return false;

  // ** Otherwise try to loop over results ** //
  simulation.results.forEach((result: any) => {
    valid = Object.keys(result).includes('error') ? false : valid;
  });
  return valid;
};

export default validateSimulation;
