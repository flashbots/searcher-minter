const fs = require('fs');

const readJson = (path: string) => {
  let data: any;
  try {
    data = fs.readFileSync(path);
    data = JSON.parse(data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  return data;
};

export default readJson;
