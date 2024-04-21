const DB = {
  getAdmin: () => {
    return {
      user: 'admin',
      password: 'supersecretpassword',
      logins: 21,
    };
  },
};

export function getDB() {
  return DB;
}
