// Mock data for UI development
const mockIssues = [
  {
    id: '1',
    title: 'Missing consent form',
    description: 'Consent form not in file for patient 003',
    site: 'Site-101',
    severity: 'major',
    status: 'open',
    created_at: '2025-05-01T09:00:00Z',
    updated_at: '2025-05-01T09:00:00Z'
  },
  {
    id: '2',
    title: 'Late visit',
    description: 'Visit week 4 occurred on week 6',
    site: 'Site-202',
    severity: 'minor',
    status: 'in_progress',
    created_at: '2025-05-03T12:30:00Z',
    updated_at: '2025-05-03T12:30:00Z'
  },
  {
    id: '3',
    title: 'Drug temp excursion',
    description: 'IP stored above max temp for 6 hours',
    site: 'Site-101',
    severity: 'critical',
    status: 'open',
    created_at: '2025-05-10T08:15:00Z',
    updated_at: '2025-05-10T08:15:00Z'
  },
  {
    id: '4',
    title: 'Unblinded email',
    description: 'Coordinator emailed treatment arm to CRA',
    site: 'Site-303',
    severity: 'major',
    status: 'resolved',
    created_at: '2025-05-14T16:00:00Z',
    updated_at: '2025-05-14T16:00:00Z'
  }
];

let issuesData = [...mockIssues];

export class MockIssueService {
  static async getIssues(filters = { search: '', status: '', severity: '' }) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filtered = [...issuesData];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(issue => 
        issue.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        issue.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(issue => issue.status === filters.status);
    }

    // Apply severity filter
    if (filters.severity) {
      filtered = filtered.filter(issue => issue.severity === filters.severity);
    }

    // Sort by created_at (desc)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return filtered;
  }

  static async getIssueById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return issuesData.find(issue => issue.id === id) || null;
  }

  static async createIssue(issueData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newIssue = {
      id: Date.now().toString(),
      ...issueData,
      status: issueData.status || 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    issuesData.unshift(newIssue);
    return newIssue;
  }

  static async updateIssue(id, updateData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const issueIndex = issuesData.findIndex(issue => issue.id === id);
    if (issueIndex === -1) {
      throw new Error('Issue not found');
    }

    const updatedIssue = {
      ...issuesData[issueIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    };

    issuesData[issueIndex] = updatedIssue;
    return updatedIssue;
  }

  static async deleteIssue(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const issueIndex = issuesData.findIndex(issue => issue.id === id);
    if (issueIndex === -1) {
      throw new Error('Issue not found');
    }

    issuesData.splice(issueIndex, 1);
  }

  static async getDashboardCounts() {
    await new Promise(resolve => setTimeout(resolve, 300));

    const counts = {
      byStatus: { open: 0, in_progress: 0, resolved: 0 },
      bySeverity: { minor: 0, major: 0, critical: 0 }
    };

    issuesData.forEach(issue => {
      counts.byStatus[issue.status]++;
      counts.bySeverity[issue.severity]++;
    });

    return counts;
  }

  static async importFromCSV(csvText) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    if (headers.length < 6) {
      throw new Error('Invalid CSV format. Expected: title,description,site,severity,status,createdAt');
    }

    const newIssues = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 6) {
        const newIssue = {
          id: Date.now().toString() + i,
          title: values[0].trim(),
          description: values[1].trim(),
          site: values[2].trim(),
          severity: values[3].trim(),
          status: values[4].trim(),
          created_at: values[5].trim(),
          updated_at: new Date().toISOString()
        };
        newIssues.push(newIssue);
      }
    }

    if (newIssues.length === 0) {
      throw new Error('No valid issues found in CSV');
    }

    issuesData = [...newIssues, ...issuesData];
    return newIssues.length;
  }
}