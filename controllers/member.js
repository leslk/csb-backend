const Member = require('../models/member');
const ErrorHandler = require('../models/errorHandler');

exports.createMember = async (req, res) => {
    try {
        // TO DO push member id in the site content
        const member = new Member(req.body.firstName, req.body.lastName, req.body.image);
        const newMember = await member.save();
        return res.status(201).json({
            message: "Member created",
            member: newMember
        });
    } catch (error) {
        return new ErrorHandler(error.status, error.message).send(res);
    }
}

exports.getMembers = async (req, res) => {
    try {
        const members = await Member.getMembers();
        return res.status(200).json({
            message: "Members found",
            members: members
        });
    } catch (error) {
        return new ErrorHandler(error.status, error.message);
    }
}

exports.deleteMember = async (req, res) => {
    try {
        // TO DO delete member id from the site content
        const memberToDelete = await Member.deleteMember(req.params.id);
        return res.status(200).json({
            message: "Member deleted",
            member: memberToDelete
        });
    } catch (error) {
        return new ErrorHandler(error.status, error.message);
    }
}