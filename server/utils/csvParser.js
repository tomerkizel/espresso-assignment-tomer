import csv from 'csv-parser';
import { Readable } from 'stream';
import { InvalidParameterError } from './errors.js';

export class CSVParser {
    static async parseIssuesCSV(fileBuffer) {
        return new Promise((resolve, reject) => {
            const results = [];
            const stream = Readable.from(fileBuffer.toString());
            
            stream
                .pipe(csv())
                .on('data', (data) => {
                    try {
                        // Validate and transform the CSV row
                        const issue = CSVParser.validateAndTransformIssue(data);
                        results.push(issue);
                    } catch (error) {
                        reject(new InvalidParameterError(`Error parsing CSV row: ${error.message}`));
                    }
                })
                .on('end', () => {
                    if (results.length === 0) {
                        reject(new InvalidParameterError('CSV file is empty or contains no valid issues'));
                    }
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(new InvalidParameterError(`Error reading CSV file: ${error.message}`));
                });
        });
    }

    static validateAndTransformIssue(data) {
        const { title, description, site, severity, status, createdAt } = data;

        // Validate required fields
        if (!title || !title.trim()) {
            throw new Error('Title is required');
        }
        if (!description || !description.trim()) {
            throw new Error('Description is required');
        }

        // Validate severity if provided
        if (severity && !['minor', 'major', 'critical'].includes(severity.toLowerCase())) {
            throw new Error(`Invalid severity: ${severity}. Must be one of: minor, major, critical`);
        }

        // Validate status if provided
        if (status && !['open', 'in_progress', 'resolved'].includes(status.toLowerCase())) {
            throw new Error(`Invalid status: ${status}. Must be one of: open, in_progress, resolved`);
        }

        // Validate createdAt if provided
        let parsedCreatedAt = null;
        if (createdAt && createdAt.trim()) {
            parsedCreatedAt = new Date(createdAt);
            if (isNaN(parsedCreatedAt.getTime())) {
                throw new Error(`Invalid date format for createdAt: ${createdAt}`);
            }
        }

        return {
            title: title.trim(),
            description: description.trim(),
            site: site && site.trim() ? site.trim() : null,
            severity: severity && severity.trim() ? severity.toLowerCase() : null,
            status: status && status.trim() ? status.toLowerCase() : null,
            ...(parsedCreatedAt && { createdAt: parsedCreatedAt })
        };
    }

    static validateCSVHeaders(headers) {
        const requiredHeaders = ['title', 'description'];
        const allowedHeaders = ['title', 'description', 'site', 'severity', 'status', 'createdAt'];
        
        // Check if required headers are present
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        if (missingHeaders.length > 0) {
            throw new InvalidParameterError(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
        }

        // Check for invalid headers
        const invalidHeaders = headers.filter(header => !allowedHeaders.includes(header));
        if (invalidHeaders.length > 0) {
            throw new InvalidParameterError(`Invalid CSV headers: ${invalidHeaders.join(', ')}. Allowed headers: ${allowedHeaders.join(', ')}`);
        }

        return true;
    }
}
