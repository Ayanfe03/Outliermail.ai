import type { EmailMessage, EmailAddress } from "@/types";
import pLimit from "p-limit";
import { db } from "@/server/db";


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

        const addressesToUpsert =  new Map()
        for (const address of [email.from, ...email.to, ...email.cc, ...email.bcc]) {
            addressesToUpsert.set(address.address, address);
        }

        const upsertedAddresses: (Awaited<ReturnType<typeof upsertEmailAddress>>)[] = []

        for (const address of addressesToUpsert.values()) {
            const upsertedAddress = await upsertEmailAddress(address, accountId)
            upsertedAddresses.push(upsertedAddress);
        }


    } catch (error) {
        
    }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
    try {
        const existingAddress = await db.emailAddress.findUnique({
            where: { accountId_address: { accountId: accountId, address: address.address ?? "" } },
        });

        if (existingAddress) {
            return await db.emailAddress.update({
                where: { id: existingAddress.id },
                data: { name: address.name, raw: address.raw },
            });
        } else {
            return await db.emailAddress.create({
                data: { address: address.address ?? "", name: address.name, raw: address.raw, accountId },
            });
        }
    } catch (error) {
        console.log('Failed to upsert email address', error);
        return null;
    }
}