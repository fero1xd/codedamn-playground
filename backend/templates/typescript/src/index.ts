import { getDB } from './config';

const main = () => {
  const db = getDB();

  const admin = db.getAdmin();

  console.log(
    `Admin's name is ${admin.user} and his password is ${admin.password}`
  );
};

main();
