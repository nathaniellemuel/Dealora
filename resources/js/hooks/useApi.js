export function useApi(token) {
    const headers = (extra = {}) => ({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extra,
    });

    return {
        listAgreements: async () => {
            const r = await fetch('/api/agreements', { headers: headers() });
            if (!r.ok) throw new Error('Failed to load agreements');
            return r.json();
        },
        getAgreement: async (id) => {
            const r = await fetch(`/api/agreements/${id}`, { headers: headers() });
            if (!r.ok) throw new Error('Not found');
            return r.json();
        },
        createAgreement: async (payload) => {
            const r = await fetch('/api/agreements', { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Create failed');
            return j;
        },
        generateSow: async (description) => {
            const r = await fetch('/api/agreements/generate-sow', {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify({ description }),
            });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Failed');
            return j;
        },
        updateAgreement: async (id, payload) => {
            const r = await fetch(`/api/agreements/${id}`, { method: 'PATCH', headers: headers(), body: JSON.stringify(payload) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Update failed');
            return j;
        },
        deleteAgreement: async (id) => {
            const r = await fetch(`/api/agreements/${id}`, { method: 'DELETE', headers: headers() });
            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j.message ?? 'Delete failed');
            return j;
        },
        lockAgreement: async (id, payload) => {
            const r = await fetch(`/api/agreements/${id}/lock`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Lock failed');
            return j;
        },
        verify: async (identifier) => {
            const r = await fetch(`/api/agreements/verify/${identifier}`, { headers: { Accept: 'application/json' } });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Not found');
            return j;
        },
        listMilestones: async (agreementId) => {
            const r = await fetch(`/api/agreements/${agreementId}/milestones`, { headers: headers() });
            if (!r.ok) throw new Error('Failed to load milestones');
            return r.json();
        },
        createMilestone: async (agreementId, payload) => {
            const r = await fetch(`/api/agreements/${agreementId}/milestones`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Create failed');
            return j;
        },
        fundAgreement: async (agreementId, payload) => {
            const r = await fetch(`/api/agreements/${agreementId}/fund`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Fund failed');
            return j;
        },
        submitMilestone: async (milestoneId) => {
            const r = await fetch(`/api/milestones/${milestoneId}/submit`, { method: 'POST', headers: headers() });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Submit failed');
            return j;
        },
        approveMilestone: async (milestoneId) => {
            const r = await fetch(`/api/milestones/${milestoneId}/approve`, { method: 'POST', headers: headers() });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Approve failed');
            return j;
        },
        requestMilestoneChanges: async (milestoneId) => {
            const r = await fetch(`/api/milestones/${milestoneId}/request-changes`, { method: 'POST', headers: headers() });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Failed');
            return j;
        },
        createDeliverable: async (agreementId, payload) => {
            const r = await fetch(`/api/agreements/${agreementId}/deliverables`, { method: 'POST', headers: headers(), body: JSON.stringify(payload) });
            const j = await r.json();
            if (!r.ok) throw new Error(j.message ?? 'Failed');
            return j;
        },
    };
}
