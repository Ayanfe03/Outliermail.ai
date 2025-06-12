import { db } from "./server/db";

await db.user.create({
    data: {
        emailAddress: 'test4@gmail.com',
        firstName: 'Ayanfeoluwa',
        lastName: 'Oluwasuan',
    }
})

console.log('User created successfully!');