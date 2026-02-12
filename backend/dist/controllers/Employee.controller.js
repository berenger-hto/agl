import { EmployeeModel } from '../models/Employee.model.js';
export class EmployeeController {
    static async getAll(c) {
        try {
            const format = c.req.query('format');
            if (format === 'tree') {
                const tree = await EmployeeModel.getHierarchy();
                return c.json(tree);
            }
            const employees = await EmployeeModel.getAll();
            return c.json(employees);
        }
        catch (error) {
            console.error('Error fetching employees:', error);
            return c.json({ error: 'Internal Server Error' }, 500);
        }
    }
}
