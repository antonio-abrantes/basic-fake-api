const userAdmin = {
  user: "",
  password: "",
};

const secretKey = "";

const tokenApp = "";

const tokenData = {
  id: "",
  email: "",
};

const minioData = {
  endPoint: "",
  port: 80,
  useSSL: true,
  accessKey: "",
  secretKey: "",
};

const pgCredentiasl = {
  user: "postgres",
  host: "your_host_name",
  database: "your_database",
  port: 5432,
  password: "your_password",
};

const users = [
  {
    user: "usuario",
    password: "senha",
    rule: "tipo",
  },
];

module.exports = {
  tokenApp,
  secretKey,
  tokenData,
  userAdmin,
  minioData,
  evoApiBaseUrl,
  evoApiKey,
  pgCredentiasl,
  users,
};
