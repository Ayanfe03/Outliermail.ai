import type { EmailMessage } from "@/types";
import pLimit from "p-limit";


export async function syncEmailsToDatabase(emails: EmailMessage[], accountId: string) {
    console.log('attempting to sync emails to database', emails.length);
    const limit = pLimit(10); 

    try {
        Promise.all(emails.map((email, index) => upsertEmail(email, accountId, index)))
    } catch (error) {
        console.error('Oops', error);
    }
}

async function upsertEmail(email: EmailMessage, accountId: string, index: number) {
    console.log('upserting email', index);
    try {
        let emailLabelType: 'inbox' | 'sent' | 'draft' = 'inbox';
        if (email.sysLabels.includes('inbox') || email.sysLabels.includes('important')) {
            emailLabelType = 'inbox';
        } else if (email.sysLabels.includes('sent')) {
            emailLabelType = 'sent';
        } else if (email.sysLabels.includes('draft')) {
            emailLabelType = 'draft';
        }
    } catch (error) {
        
    }
}