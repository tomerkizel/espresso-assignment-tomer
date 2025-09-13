import { DataTypes } from 'sequelize';

export default(sequelize) => {
    const Issues = sequelize.define('Issues', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        site: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('open', 'in_progress', 'resolved'),
            allowNull: true,
        },
        severity: {
            type: DataTypes.ENUM('minor', 'major', 'critical'),
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            onUpdate: DataTypes.NOW,
        },
    }, {
        tableName: 'issues',
        timestamps: false,
        freezeTableName: true,
    });

    return Issues;
};