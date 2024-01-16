/* eslint-disable no-unused-vars */
"use strict";
const { Model } = require("sequelize");
const { Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: 'userId'
      })
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({ title: title, dueDate: dueDate, completed: false, userId });
    }

    static getTodos() {
      return this.findAll();
    }

    static async overdue(userId) {
      return this.findAll({
        where: {
          completed: false,
          userId,
          dueDate: {
            [Op.lt]: new Date().toISOString().split("T")[0],
          },
        },
      });
    }

    static async dueToday(userId) {
      return this.findAll({
        where: {
          completed: false,
          userId,
          dueDate: {
            [Op.eq]: new Date().toISOString().split("T")[0],
          },
        },
      });
    }

    static async dueLater(userId) {
      return this.findAll({
        where: {
          completed: false,
          userId,
          dueDate: {
            [Op.gt]: new Date().toISOString().split("T")[0],
          },
        },
      });
    }

    static async completedItems(userId) {
      return this.findAll({
        where: {
          userId,
          completed: true,
        }
      })
    }

    static async remove(id, userId) {
      return this.destroy({
        where: {
          id,
          userId
        }
      })
    }

    setCompletionStatus(status) {
      if (status) {
        return this.update({ completed: false });
      }
      return this.update({ completed: true });
    }
  }

  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
