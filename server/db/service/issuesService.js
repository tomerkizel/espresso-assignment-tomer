import _ from 'lodash';

export default class IssuesService {
    constructor(IssuesModel) {
        this.Issues = IssuesModel;
    }
    get = async (data) => {
        try {
            if(_.isEmpty(data.where)) {
                delete data.where;
            }
            const res = await this.Issues.findAndCountAll(data);
            return {
                rows: res.rows.map(record => {
                    try{
                        return record.toJSON();
                    } catch (error) {
                        return record;
                    }
                }),
                count: res.count
            };
        } catch (error) {
            throw new Error(`Failed to get Issues records: ${error.message}`);
        }
    }

    create = async (data) => {
        try {
            const res = await this.Issues.upsert(data);
            return res[1];
        } catch (error) {
            throw new Error(`Failed to create Issues record: ${error.message}`);
        }
    }

    bulkCreate = async (data) => {
        try {
            const res = await this.Issues.bulkCreate(data);
            return res.map(record => {
                try{
                    return record.toJSON();
                } catch (error) {
                    return record;
                }
            });
        } catch (error) {
            throw new Error(`Failed to bulk create Issues records: ${error.message}`);
        }
    }

    update = async (id, data) => {
        try {
            const [updatedCount] = await this.Issues.update(data, { where: { id } });
            return updatedCount;
        } catch (error) {
            throw new Error(`Failed to update Issues records: ${error.message}`);
        }
    }

    delete = async (where = {}) => {
        try {
            const deletedCount = await this.Issues.destroy({ where });
            return deletedCount;
        } catch (error) {
            throw new Error(`Failed to delete Issues records: ${error.message}`);
        }
    }
}
