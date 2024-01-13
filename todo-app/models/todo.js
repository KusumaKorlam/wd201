'use strict';
const {
  Model , Op
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: 'UseRID'
      // define association here
    })
    }
    static addTodo({title, dueDate , UseRID}) {
      return this.create({title: title, dueDate: dueDate,completed: false, UseRID})
    }
    static getTodos() {
      return this.findAll({ order: [["id", "ASC"]] });
    }
    static async remove(id, UseRID) {
      return this.destroy({
        where: {
          id,
          UseRID
        },
      });
      }
    MarkASCompleted() {
      return this.update({completed: true})
    }
    setCompletionStatus(bool) {
      return this.update({ completed: bool });
    }
    static overdue(UseRID) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.lt]: new Date().toLocaleDateString("en-CA"),
          },
          UseRID: UseRID,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static dueToday(UseRID) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.eq]: new Date().toLocaleDateString("en-CA"),
          },
          UseRID: UseRID,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static dueLater(UseRID) {
      return this.findAll({
        where: {
          dueDate: {
            [Op.gt]: new Date().toLocaleDateString("en-CA"),
          },
          UseRID: UseRID,
          completed: false,
        },
        order: [["id", "ASC"]],
      });
    }
    static completeditems(UseRID) {
      return this.findAll({
        where: {
          UseRID: UseRID,
          completed: true,
        },
        order: [["id", "ASC"]],
      });
    }
    static async remove(id , UseRID) {
      return this.destroy({
        where: { id, UseRID },
      });
    }
  }
  Todo.init({
    title: DataTypes.STRING,
    dueDate: DataTypes.DATEONLY,
    completed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Todo',
  });
  return Todo;
};
