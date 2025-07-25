module.exports = (sequelize, Sequelize) => {
  const Log = sequelize.define("logs", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    filename: {
      type: Sequelize.STRING,
      allowNull: false
    },
    uploadDate: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    totalLines: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    errorCount: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  });
  return Log;
};
