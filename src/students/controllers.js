const pool = require('../../db')

const cron = require('node-cron');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey('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');

const getAllScheduledEmails = async (req, res) => {
    try {
        const query = 'SELECT * FROM scheduled_emails';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all scheduled emails:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const getScheduledMailById = async (req, res) => {
    const { id } = req.params
    try {
        const query = 'SELECT * FROM scheduled_emails where id = $1';
        const result = await pool.query(query, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching email with that id:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const createEmail = async (req, res) => {
    const { recipient_email, subject, body, send_at } = req.body;
    const status = 'unsent'
    try {
        // Inserting the scheduled email into the database
        const query = 'INSERT INTO scheduled_emails (recipient_email, subject, body, send_at,status) VALUES ($1, $2, $3, $4,$5)';
        await pool.query(query, [recipient_email, subject, body, send_at, status]);
        res.json({ message: 'Email scheduled successfully!' });
    } catch (err) {
        console.error('Error scheduling email:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//scheduling a mail for every 30 minutes
cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();
        const query = 'SELECT * FROM scheduled_emails WHERE send_at = $1';
        const result = await pool.query(query, [now]);

        for (const row of result.rows) {
            const { id, recipient_email, subject, body } = row;
            const msg = {
                to: recipient_email,
                from: 'vinayvardanreddy@gmail.com',
                subject: subject,
                text: body,
                html: `<p>${body}</p>`,
            };
            let result = await sgMail.send(msg);
            await pool.query(`update scheduled_emails set status = 'sent' where id =${id}`)
        }
    } catch (err) {
        console.error('Error sending scheduled emails:', err);
    }
});

const updateScheduledMail = async (req, res) => {
    const { id } = req.params;
    const { send_at } = req.body;

    try {
        // Check if the email exists in the database
        const selectQuery = 'SELECT * FROM scheduled_emails WHERE id = $1';
        const selectResult = await pool.query(selectQuery, [id]);

        if (selectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Email not found' });
        }

        // Update the send_at field for the email
        const updateQuery = 'UPDATE scheduled_emails SET send_at = $1 WHERE id = $2';
        await pool.query(updateQuery, [send_at, id]);

        res.json({ message: 'Email rescheduled successfully!' });
    } catch (err) {
        console.error('Error rescheduling email:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const unsentEmails = async (req, res) => {
    const status = req.body.status;
    try {
        const query = 'SELECT * FROM scheduled_emails where status =$1';
        const result = await pool.query(query, [status]);
        if (result.rows > 0) {
            res.json(result.rows);
        } else {
            res.status(200).send(
                { message: 'there are no mails pending to send' }
            )
        }
    } catch (err) {
        console.error('Error fetching all scheduled emails:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const deleteScheduledMail = async (req, res) => {
    const { id } = req.params;
    try {
        const now = new Date();
        const query = `select FROM scheduled_emails WHERE id = ${id}`;
        const result = await pool.query(query);
        if (result.rows.length > 0) {
            await pool.query(`delete FROM scheduled_emails WHERE id = ${id}`)
            res.status(200).send({
                message: 'deleted successfully'
            })
        } else {
            res.status(500).send({
                message: 'could not find email with particular id'
            })
        }
    } catch (err) {
        console.error('Error deleting emails:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
module.exports = {
    createEmail, updateScheduledMail, deleteScheduledMail, getAllScheduledEmails, getScheduledMailById, unsentEmails
}