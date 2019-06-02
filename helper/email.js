module.exports.sendSignupEmail = (sgMail, user, host) => {
    const msg = {
        to: user.email,
        from: 'chris@christophermcdonald.me',
        subject: "Welcome to the NoteNodeApp!",
        text: "NoteNodeApp-Text",
        html: "<p>NoteNodeApp-HTML</p>",
        templateId: 'd-18cdc73ec5564f0eb6d53f066300e5eb',
        dynamic_template_data: {
            action: `https://${host}/verify?user=${user.email}&guid=${user.guid}`
        },
    };
    sgMail.send(msg);
};

module.exports.sendPasswordResetEmail = (sgMail, user, host) => {
    const msg = {
        to: user.email,
        from: 'chris@christophermcdonald.me',
        subject: "Welcome to the NoteNodeApp!",
        text: "NoteNodeApp-Text",
        html: "<p>NoteNodeApp-HTML</p>",
        templateId: 'd-79a7bafada544522a9b5fa8b80f7a476',
        dynamic_template_data: {
            action: `https://${host}/passwordReset?user=${user.email}&guid=${user.tempGuid}`
        },
    };
    sgMail.send(msg);
};
