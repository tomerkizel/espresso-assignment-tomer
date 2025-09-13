class IssueService {
    static instance = new IssueService();

    constructor() { }

    getIssues = async (input) => {
        const stringifiedInput = JSON.stringify(input);
        const url = new URL('/api/issues', window.location.origin);
        url.searchParams.set('filters', stringifiedInput);
        
        const result = await fetch(url.toString(), {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const data = await result.json();

        if (data.error) {
        
            throw new Error(`Failed to fetch issues: ${data.error}`);
        }

        return data || [];
    }

    removeIssue = async (id) => {
        const url = new URL('/api/issues', window.location.origin);
        url.searchParams.set('id', id);
        
        const result = await fetch(url.toString(), {
            method: 'DELETE',
        });

        const data = await result.json();

        if (data.error) {
            throw new Error(`Failed to delete issue: ${data.error}`);
        }

        return data;
    }

    createIssue = async (input) => {
        console.log(input);
        const url = new URL('/api/issues', window.location.origin);
        const result = await fetch(url.toString(), {
            method: 'POST',
            body: JSON.stringify(input),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await result.json();

        if (data.error) {
            throw new Error(`Failed to create issue: ${data.error}`);
        }

        return data;
    }

    updateIssue = async (id, input) => {
        const url = new URL('/api/issues', window.location.origin);
        url.searchParams.set('id', id);
        
        const result = await fetch(url.toString(), {
            method: 'PUT',
            body: JSON.stringify(input),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await result.json();

        if (data.error) {
            throw new Error(`Failed to update issue: ${data.error}`);
        }

        return data;
    }


    getDashboardCounts = async () => {
        const url = new URL('/api/issues/count', window.location.origin);
        const result = await fetch(url.toString());
        const data = await result.json();
        return data;
    }
}

export default IssueService.instance;