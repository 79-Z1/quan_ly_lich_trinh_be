const nodeSchedule = require('node-schedule');
const { pushNotification } = require('../notification/notification.repo');
const { sendMail } = require('../mail/send-mail');
const { notificationMailFormat } = require('../mail/notification-mail-format');
const { formatVNDate } = require('../../common/utils/date.util');
const { Schedule } = require('../schedule/schedule.model');

const scheduleJob = async (scheduleId) => {
    try {
        const schedule = await Schedule.findById(scheduleId)
            .populate({
                path: 'members.memberId',
                select: 'email'
            })
            .populate({
                path: 'ownerId',
                select: 'email'
            })
            .exec();

        if (!schedule.startDate) {
            throw new Error('Schedule must have a start date.');
        }

        const scheduleMembers = (schedule.members || []).map(member => ({
            id: member.memberId._id.toString(),
            email: member.memberId.email
        }));
        const allMembers = [
            ...scheduleMembers,
            { id: schedule.ownerId._id.toString(), email: schedule.ownerId.email }
        ];
        console.log("🚀 ~ scheduleJob ~ allMembers:::", allMembers);

        nodeSchedule.scheduleJob(new Date(schedule.startDate), async () => {
            try {
                const notificationsPromises = allMembers.map(member => {
                    return pushNotification({
                        userId: member.id,
                        content: `Thời gian lịch trình ${schedule.topic} đã tới`,
                        url: `${process.env.CLIENT_URL}/trip/${schedule._id?.toString()}`
                    }).then(async notifications => {
                        global._io.to(member.id).emit('update-notification', { notifications });
                        await sendMail(member.email, 'Bạn có một lịch trình đã bắt đầu', notificationMailFormat({
                            url: `${process.env.CLIENT_URL}/trip/${schedule._id?.toString()}`,
                            scheduleName: schedule.topic,
                            startTime: formatVNDate(schedule.startDate),
                            endTime: formatVNDate(schedule.endDate)
                        }));
                    }).catch(notificationError => {
                        console.error(`🚀 ~ scheduleJob ~ Error sending notification to ${member.id}::`, notificationError);
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