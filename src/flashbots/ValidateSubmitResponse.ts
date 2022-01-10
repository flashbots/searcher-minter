// ** Validate that the bundle didn't error ** //
const validateSubmitResponse = (submission: any) => Object.keys(submission).includes('error');

export default validateSubmitResponse;
