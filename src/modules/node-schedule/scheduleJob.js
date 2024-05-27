const nodeSchedule = require('node-schedule');
const { pushNotification } = require('../notification/notification.repo');

const scheduleJob = (schedule = {}) => {
    console.log("🚀 ~ scheduleJob ~ schedule:::", schedule);
    try {
        if (!schedule.startDate) {
            throw new Error('Schedule must have a start date.');
        }

        const scheduleMembers = (schedule.members || []).map(member => member.memberId.toString());
        const allMemberIds = [...scheduleMembers, schedule.ownerId?.toString()];

        nodeSchedule.scheduleJob(new Date(schedule.startDate), async () => {
            try {
                const notificationsPromises = allMemberIds.map(memberId => {
                    return pushNotification({
                        userId: memberId,
                        content: `Thời gian lịch trình ${schedule.topic} đã tới`,
                        url: `${process.env.CLIENT_URL}/trip/${schedule._id?.toString()}`
                    }).then(notifications => {
                        global._io.to(memberId).emit('update-notification', { notifications });
                    }).catch(notificationError => {
                        console.error(`🚀 ~ scheduleJob ~ Error sending notification to ${memberId}::`, notificationError);
                    });
                });

                await Promise.all(notificationsPromises);
            } catch (notificationError) {
                console.error("🚀 ~ scheduleJob ~ notificationError:::", notificationError);
            }
        });
    } catch (error) {
        console.error("🚀 ~ scheduleJob ~ error:::", error);
    }
};

module.exports = { scheduleJob };