'use strict';
const { SuccessResponse } = require("../../common/core/success.response");
const AdminService = require("./admin.service");

class AdminController {

    getAllUsers = async (req, res) => {
        new SuccessResponse({
            message: 'Get all users successfully',
            metadata: await AdminService.getAllUsers()
        }).send(res);
    }

    updateUser = async (req, res) => {
        new SuccessResponse({
            message: 'Update user successfully',
            metadata: await AdminService.updateUser(req.body)
        }).send(res);
    }

    statisticScheduleByMonth = async (req, res) => {
        new SuccessResponse({
            message: 'Get statistic schedule by month successfully',
            metadata: await AdminService.statisticScheduleByMonth()
        }).send(res);
    }

    statisticUserThisMonth = async (req, res) => {
        new SuccessResponse({
            message: 'Get statistic user this month successfully',
            metadata: await AdminService.statisticUserThisMonth()
        }).send(res);
    }

    statisticScheduleThisMonth = async (req, res) => {
        new SuccessResponse({
            message: 'Get statistic schedule this month successfully',
            metadata: await AdminService.statisticScheduleThisMonth()
        }).send(res);
    }

    getRankingList = async (req, res) => {
        new SuccessResponse({
            message: 'Get ranking list successfully',
            metadata: await AdminService.getRankingList()
        }).send(res);
    }

}

module.exports = new AdminController();