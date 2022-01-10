// ** Validate that the Simulation didn't error ** //
const validateSimulation = (simulation: any) => {
  // ** For each result, check if there is an error ** //
  let valid = false;
  simulation.results.forEach((result: any) => {
    valid = Object.keys(result).includes('error') ? true : valid;
  });
  return valid;
};

export default validateSimulation;
