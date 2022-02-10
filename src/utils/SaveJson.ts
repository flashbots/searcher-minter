const fs = require('fs');

const saveJson = (path: string, data: JSON) => {
  try {
    fs.writeFileSync(path, data);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
};

export default saveJson;
